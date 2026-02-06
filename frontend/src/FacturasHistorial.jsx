import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './FacturasHistorial.css';
import { getClientes } from './apiCliente';
import { getFacturas, getFacturaConProductos } from './apiFactura';
import InvoicePreview from './InvoicePreview';

const money = new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const TAX_RATE = 0.12;

const statusPalette = {
  paid: { label: 'Pagada', className: 'badge-paid' },
  pending: { label: 'Pendiente', className: 'badge-pending' },
  cancelled: { label: 'Cancelada', className: 'badge-cancelled' },
};

const filterOptions = [
  { value: 'all', label: 'Todas' },
  { value: 'paid', label: 'Pagadas' },
  { value: 'pending', label: 'Pendientes' },
  { value: 'cancelled', label: 'Canceladas' },
];

const formatOrderCode = (facId) => `FAC-${String(facId).padStart(4, '0')}`;

const isSameDay = (dateA, dateB) =>
  dateA.getFullYear() === dateB.getFullYear() &&
  dateA.getMonth() === dateB.getMonth() &&
  dateA.getDate() === dateB.getDate();

export default function FacturasHistorial() {
  const navigate = useNavigate();
  const [facturas, setFacturas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedInvoice, setSelectedInvoice] = useState(null);
  const [autoPrintInvoice, setAutoPrintInvoice] = useState(false);
  const [stats, setStats] = useState({ totalToday: 0, totalOrders: 0 });

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [{ data: facturasData }, { data: clientesData }] = await Promise.all([
        getFacturas(),
        getClientes(),
      ]);

      const clienteMap = new Map((clientesData || []).map((cliente) => [cliente.cli_id, cliente]));

      const enriched = await Promise.all(
        (facturasData || []).map(async (factura) => {
          let items = [];
          try {
            const { data: detail } = await getFacturaConProductos(factura.fac_id);
            items = (detail?.Productos || []).map((producto) => ({
              pro_id: producto.pro_id,
              pro_nombre: producto.pro_nombre,
              pro_pvp: Number(producto.FacturaProducto?.facpro_pvp ?? producto.pro_pvp ?? 0),
              quantity: Number(producto.FacturaProducto?.facpro_cantidad ?? 1),
              note: '',
            }));
          } catch (error) {
            console.error('Error al cargar detalle de factura', error);
          }

          const subtotal = Number(
            items.reduce((acc, item) => acc + item.pro_pvp * item.quantity, 0).toFixed(2),
          );
          const totalWithTax = Number((subtotal * (1 + TAX_RATE)).toFixed(2));
          const itemCount = items.reduce((acc, item) => acc + item.quantity, 0);
          const parsedDate = new Date(factura.fac_fecha);

          return {
            ...factura,
            orderCode: formatOrderCode(factura.fac_id),
            cliente: clienteMap.get(factura.cli_id) ?? null,
            items,
            subtotal,
            totalWithTax,
            itemCount,
            date: parsedDate,
            status: 'paid',
          };
        }),
      );

      const today = new Date();
      const totalToday = enriched
        .filter((factura) => factura.date && isSameDay(factura.date, today))
        .reduce((acc, factura) => acc + factura.totalWithTax, 0);

      setFacturas(enriched);
      setStats({ totalToday, totalOrders: enriched.length });
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const filteredFacturas = useMemo(() => {
    const query = search.trim().toLowerCase();
    return facturas.filter((factura) => {
      const matchesStatus = statusFilter === 'all' || factura.status === statusFilter;
      const matchesQuery =
        !query ||
        factura.orderCode.toLowerCase().includes(query) ||
        factura.cliente?.cli_nombre?.toLowerCase().includes(query);
      return matchesStatus && matchesQuery;
    });
  }, [facturas, search, statusFilter]);

  const handleViewDetail = (factura, options = {}) => {
    const { autoPrint = false } = options;
    setSelectedInvoice({
      client: factura.cliente,
      factura,
      items: factura.items,
      totals: {
        subtotal: factura.subtotal,
        taxAmount: Number((factura.subtotal * TAX_RATE).toFixed(2)),
        total: factura.totalWithTax,
      },
      orderCode: factura.orderCode,
      generatedAt: factura.date || new Date(),
    });
    setAutoPrintInvoice(autoPrint);
  };

  const handlePrint = (factura) => handleViewDetail(factura, { autoPrint: true });

  const handleClosePreview = () => {
    setSelectedInvoice(null);
    setAutoPrintInvoice(false);
  };

  return (
    <section className="facturas-layout container py-4 animate__animated animate__fadeIn">

      <header className="facturas-header">
        <div>
          <h3 className="fw-bold text-dark mb-1">Historial de Ventas</h3>
          <p className="text-muted mb-0">Gestiona y revisa todas las facturas emitidas.</p>
        </div>
        <button type="button" className="btn btn-primary rounded-pill px-4 shadow-sm" onClick={() => navigate('/ventas')}>
          <i className="fas fa-plus me-2" />Nueva venta
        </button>
      </header>

      <div className="row g-3 mb-4">
        <div className="col-md-3">
          <div className="card card-stats p-3 shadow-sm">
            <div className="d-flex align-items-center">
              <div className="icon-pill text-primary">
                <i className="fas fa-file-invoice-dollar" />
              </div>
              <div>
                <small className="text-muted d-block">Total de hoy</small>
                <h5 className="fw-bold mb-0">{money.format(stats.totalToday)}</h5>
              </div>
            </div>
          </div>
        </div>
        <div className="col-md-3">
          <div className="card card-stats p-3 shadow-sm">
            <div className="d-flex align-items-center">
              <div className="icon-pill text-success">
                <i className="fas fa-shopping-bag" />
              </div>
              <div>
                <small className="text-muted d-block">Facturas</small>
                <h5 className="fw-bold mb-0">{stats.totalOrders}</h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="row align-items-center mb-4 g-3">
        <div className="col-lg-8">
          <div className="d-flex flex-wrap gap-2">
            {filterOptions.map((option) => (
              <button
                key={option.value}
                type="button"
                className={`filter-chip ${statusFilter === option.value ? 'active' : ''}`}
                onClick={() => setStatusFilter(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>
        <div className="col-lg-4">
          <div className="position-relative">
            <i className="fas fa-search search-icon" />
            <input
              type="text"
              className="form-control search-box shadow-sm"
              placeholder="Buscar por cliente o factura..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="table-container shadow-sm">
        {loading ? (
          <div className="text-center py-5">
            <div className="spinner-border text-primary" role="status">
              <span className="visually-hidden">Cargando...</span>
            </div>
            <p className="text-muted mt-3 mb-0">Cargando facturas...</p>
          </div>
        ) : filteredFacturas.length === 0 ? (
          <div className="text-center py-5">
            <i className="fas fa-folder-open text-muted mb-3" style={{ fontSize: '3rem' }} />
            <p className="mb-0 text-muted">No hay facturas que coincidan con tu búsqueda.</p>
          </div>
        ) : (
          <div className="table-responsive">
            <table className="table mb-0">
              <thead>
                <tr>
                  <th>Nº Factura</th>
                  <th>Fecha y hora</th>
                  <th>Cliente</th>
                  <th>Productos</th>
                  <th>Total</th>
                  <th>Estado</th>
                  <th className="text-center">Acciones</th>
                </tr>
              </thead>
              <tbody>
                {filteredFacturas.map((factura) => {
                  const palette = statusPalette[factura.status] || statusPalette.paid;
                  return (
                    <tr key={factura.fac_id}>
                      <td className="fw-bold">#{factura.orderCode}</td>
                      <td className="small">
                        {factura.date ? factura.date.toLocaleString('es-EC', { dateStyle: 'medium', timeStyle: 'short' }) : 'N/D'}
                      </td>
                      <td>
                        <div className="fw-bold">{factura.cliente?.cli_nombre || 'Consumidor final'}</div>
                        <small className="text-muted">ID Cliente: {factura.cliente?.cli_id ?? '—'}</small>
                      </td>
                      <td>
                        <span className="badge bg-light text-dark border fw-normal">{factura.itemCount} ítems</span>
                      </td>
                      <td className="fw-bold text-dark">{money.format(factura.totalWithTax)}</td>
                      <td>
                        <span className={`status-badge ${palette.className}`}>{palette.label}</span>
                      </td>
                      <td className="text-center">
                        <button type="button" className="btn-view" title="Ver detalles" onClick={() => handleViewDetail(factura)}>
                          <i className="fas fa-eye" />
                        </button>
                        <button type="button" className="btn-view ms-1" title="Imprimir" onClick={() => handlePrint(factura)}>
                          <i className="fas fa-print" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <InvoicePreview
        data={selectedInvoice}
        autoPrint={autoPrintInvoice}
        onAutoPrintComplete={() => setAutoPrintInvoice(false)}
        onClose={handleClosePreview}
      />
    </section>
  );
}
