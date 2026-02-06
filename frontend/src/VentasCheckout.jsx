import { useEffect, useMemo, useState } from 'react';
import './VentasCheckout.css';
import { getProductos } from './apiProducto';
import { getClientes } from './apiCliente';
import { addProductoToFactura, createFactura } from './apiFactura';
import InvoicePreview from './InvoicePreview';

const money = new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

const TAX_RATE = 0.12;

const generateOrderCode = () => {
  const now = new Date();
  return `FAC-${now.getFullYear()}${(now.getMonth() + 1).toString().padStart(2, '0')}${now
    .getDate()
    .toString()
    .padStart(2, '0')}-${now.getHours().toString().padStart(2, '0')}${now
    .getMinutes()
    .toString()
    .padStart(2, '0')}`;
};

export default function VentasCheckout() {
  const [productos, setProductos] = useState([]);
  const [clientes, setClientes] = useState([]);
  const [productSearch, setProductSearch] = useState('');
  const [clientSearch, setClientSearch] = useState('');
  const [cart, setCart] = useState([]);
  const [selectedClient, setSelectedClient] = useState(null);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [submitting, setSubmitting] = useState(false);
  const [loadingCatalog, setLoadingCatalog] = useState(false);
  const [loadingClientes, setLoadingClientes] = useState(false);
  const [orderCode, setOrderCode] = useState(generateOrderCode());
  const [productPanelOpen, setProductPanelOpen] = useState(false);
  const [clientPanelOpen, setClientPanelOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);

  useEffect(() => {
    const loadProductos = async () => {
      setLoadingCatalog(true);
      try {
        const { data } = await getProductos();
        setProductos(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setStatus({ type: 'danger', message: 'No se pudo cargar el catálogo de productos.' });
      } finally {
        setLoadingCatalog(false);
      }
    };

    const loadClientes = async () => {
      setLoadingClientes(true);
      try {
        const { data } = await getClientes();
        setClientes(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error(error);
        setStatus({ type: 'danger', message: 'No se pudo cargar la lista de clientes.' });
      } finally {
        setLoadingClientes(false);
      }
    };

    loadProductos();
    loadClientes();
  }, []);

  const filteredProductos = useMemo(() => {
    const query = productSearch.trim().toLowerCase();
    if (!query) return productos;
    return productos.filter((producto) =>
      producto.pro_nombre?.toLowerCase().includes(query) ||
      String(producto.pro_id).includes(query)
    );
  }, [productos, productSearch]);

  const filteredClientes = useMemo(() => {
    const query = clientSearch.trim().toLowerCase();
    if (!query) return clientes;
    return clientes.filter((cliente) =>
      cliente.cli_nombre?.toLowerCase().includes(query) ||
      cliente.cli_correo?.toLowerCase().includes(query)
    );
  }, [clientes, clientSearch]);

  const subtotal = useMemo(
    () => cart.reduce((acc, item) => acc + Number(item.pro_pvp || 0) * item.quantity, 0),
    [cart],
  );

  const handleAddProduct = (producto) => {
    if (!producto.pro_estado) {
      setStatus({ type: 'warning', message: 'El producto seleccionado está inactivo.' });
      return;
    }
    const numericPrice = Number(producto.pro_pvp) || 0;
    setCart((prev) => {
      const exists = prev.find((item) => item.pro_id === producto.pro_id);
      if (exists) {
        return prev.map((item) =>
          item.pro_id === producto.pro_id ? { ...item, quantity: item.quantity + 1 } : item,
        );
      }
      return [
        ...prev,
        {
          pro_id: producto.pro_id,
          pro_nombre: producto.pro_nombre,
          pro_pvp: numericPrice,
          quantity: 1,
          note: '',
        },
      ];
    });
  };

  const handleQuantity = (proId, delta) => {
    setCart((prev) =>
      prev
        .map((item) =>
          item.pro_id === proId ? { ...item, quantity: Math.max(1, item.quantity + delta) } : item,
        )
        .filter((item) => item.quantity > 0),
    );
  };

  const handleRemoveProduct = (proId) => {
    setCart((prev) => prev.filter((item) => item.pro_id !== proId));
  };

  const handleNoteChange = (proId, value) => {
    setCart((prev) => prev.map((item) => (item.pro_id === proId ? { ...item, note: value } : item)));
  };

  const handleSelectClient = (cliente) => {
    setSelectedClient(cliente);
    setClientSearch('');
    setClientPanelOpen(false);
  };

  const handleClearClient = () => {
    setSelectedClient(null);
  };

  const handleFinalizeSale = async (event) => {
    event.preventDefault();
    setStatus({ type: '', message: '' });

    if (cart.length === 0) {
      setStatus({ type: 'warning', message: 'Agrega al menos un producto a la factura.' });
      return;
    }

    if (!selectedClient) {
      setStatus({ type: 'warning', message: 'Selecciona o registra un cliente.' });
      return;
    }

    const cartSnapshot = cart.map((item) => ({ ...item }));
    const currentOrderCode = orderCode;
    const snapshotSubtotal = Number(subtotal.toFixed(2));
    const taxAmount = Number((snapshotSubtotal * TAX_RATE).toFixed(2));

    setSubmitting(true);
    try {
      const { data: factura } = await createFactura({
        cli_id: selectedClient.cli_id,
        fac_fecha: new Date().toISOString(),
      });

      await Promise.all(
        cart.map((item) =>
          addProductoToFactura(factura.fac_id, {
            pro_id: item.pro_id,
            facpro_cantidad: item.quantity,
            facpro_pvp: item.pro_pvp,
          }),
        ),
      );

      setStatus({ type: 'success', message: 'Factura registrada exitosamente.' });
      setInvoiceData({
        client: selectedClient,
        factura,
        items: cartSnapshot,
        totals: {
          subtotal: snapshotSubtotal,
          taxAmount,
          total: snapshotSubtotal + taxAmount,
        },
        orderCode: currentOrderCode,
        generatedAt: new Date(),
      });
      setCart([]);
      setOrderCode(generateOrderCode());
    } catch (error) {
      console.error(error);
      setStatus({ type: 'danger', message: 'Ocurrió un error al guardar la factura.' });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="ventas-checkout container py-5 animate__animated animate__fadeIn">
      <header className="ventas-header">
        <div>
          <h2 className="fw-bold text-dark mb-1">
            <i className="fas fa-cash-register text-success me-2" />Finalizar Venta
          </h2>
          <p className="text-muted mb-0">Selecciona productos, asigna un cliente y genera la factura.</p>
        </div>
        <span className="order-code">{orderCode}</span>
      </header>

      {status.message && (
        <div className={`alert alert-${status.type || 'info'} shadow-sm rounded-4`} role="alert">
          {status.message}
        </div>
      )}

      <form className="row g-4" onSubmit={handleFinalizeSale}>
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-header bg-white py-3 d-flex justify-content-between align-items-center">
              <h5 className="fw-bold mb-0">Detalle de Productos</h5>
              <div className="d-flex align-items-center gap-2">
                <span className="badge text-bg-secondary rounded-pill">{cart.length} ítems</span>
                <button
                  type="button"
                  className="btn btn-primary btn-sm rounded-pill"
                  onClick={() => setProductPanelOpen(true)}
                >
                  <i className="fas fa-plus me-1" />Agregar producto
                </button>
              </div>
            </div>
            <div className="card-body p-0">
              {cart.length === 0 ? (
                <div className="text-center py-5">
                  <i className="fas fa-shopping-basket empty-cart-icon mb-3" />
                  <h5 className="fw-bold">Tu factura está vacía</h5>
                  <p className="text-muted small mb-0">Usa el botón "Agregar producto" para armar la factura.</p>
                </div>
              ) : (
                <ul className="list-group list-group-flush">
                  {cart.map((item) => (
                    <li className="list-group-item cart-item" key={item.pro_id}>
                      <div className="cart-item-head">
                        <div>
                          <h6 className="fw-bold mb-1">{item.pro_nombre}</h6>
                          <span className="price-tag">{money.format(item.pro_pvp)}</span>
                        </div>
                        <button type="button" className="btn btn-link text-danger p-0" onClick={() => handleRemoveProduct(item.pro_id)}>
                          <i className="fas fa-trash me-1" />Quitar
                        </button>
                      </div>
                      <div className="cart-item-body">
                        <div className="quantity-control">
                          <button type="button" onClick={() => handleQuantity(item.pro_id, -1)}>-</button>
                          <span>{item.quantity}</span>
                          <button type="button" onClick={() => handleQuantity(item.pro_id, 1)}>+</button>
                        </div>
                        <div className="cart-subtotal">{money.format(item.pro_pvp * item.quantity)}</div>
                      </div>
                      <input
                        type="text"
                        className="form-control form-control-sm note-input"
                        placeholder="Nota adicional..."
                        value={item.note}
                        onChange={(event) => handleNoteChange(item.pro_id, event.target.value)}
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm rounded-4 mb-4">
            <div className="card-header bg-primary bg-opacity-10 py-3 border-bottom-0">
              <h6 className="fw-bold text-primary mb-0">
                <i className="fas fa-user-tag me-2" />Asignar Cliente
              </h6>
            </div>
            <div className="card-body">
              {selectedClient ? (
                <>
                  <div className="cliente-chip">
                    <div>
                      <p className="mb-1 fw-bold">{selectedClient.cli_nombre}</p>
                      <small className="text-muted">{selectedClient.cli_correo}</small>
                    </div>
                    <button type="button" className="btn btn-sm btn-outline-danger" onClick={handleClearClient}>
                      <i className="fas fa-times" />
                    </button>
                  </div>
                  <button
                    type="button"
                    className="btn btn-outline-primary w-100 mt-3"
                    onClick={() => setClientPanelOpen(true)}
                  >
                    <i className="fas fa-sync-alt me-2" />Cambiar cliente
                  </button>
                </>
              ) : (
                <>
                  <p className="text-muted small mb-2">Selecciona uno de los clientes registrados.</p>
                  <button
                    type="button"
                    className="btn btn-primary w-100"
                    onClick={() => setClientPanelOpen(true)}
                  >
                    <i className="fas fa-user-check me-2" />Elegir cliente
                  </button>
                </>
              )}

              <a
                href="/clientes"
                target="_blank"
                rel="noreferrer"
                className="btn btn-outline-secondary w-100 mt-3"
              >
                <i className="fas fa-external-link-alt me-2" />Gestionar clientes
              </a>
            </div>
          </div>

          <div className="card border-0 shadow-sm rounded-4">
            <div className="card-body">
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Subtotal</span>
                <span className="fw-bold">{money.format(subtotal)}</span>
              </div>
              <div className="d-flex justify-content-between mb-2">
                <span className="text-muted">Impuestos (incl.)</span>
                <span className="text-muted">Incluidos</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-3 pt-3 border-top">
                <h5 className="fw-bold mb-0">Total a pagar</h5>
                <h4 className="fw-bold text-success mb-0">{money.format(subtotal)}</h4>
              </div>
              <button type="submit" className="btn btn-success w-100 btn-lg mt-4 shadow-sm" disabled={submitting}>
                {submitting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true" />
                    Procesando...
                  </>
                ) : (
                  <>
                    <i className="fas fa-check-circle me-2" /> Finalizar venta
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </form>
      {productPanelOpen && (
        <div className="selection-panel-backdrop" role="dialog" aria-modal="true">
          <div className="selection-panel">
            <div className="selection-panel-header">
              <div>
                <h5 className="mb-1">Seleccionar productos</h5>
                <small className="text-muted">
                  {loadingCatalog ? 'Cargando catálogo…' : `${filteredProductos.length} disponibles`}
                </small>
              </div>
              <button type="button" className="btn btn-light btn-sm" onClick={() => setProductPanelOpen(false)}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="search-field mb-3">
              <i className="fas fa-search" />
              <input
                type="text"
                placeholder="Buscar por nombre o ID..."
                value={productSearch}
                onChange={(event) => setProductSearch(event.target.value)}
              />
            </div>
            <div className="selection-panel-list">
              {filteredProductos.map((producto) => (
                <button
                  type="button"
                  className="selection-panel-item"
                  key={producto.pro_id}
                  disabled={!producto.pro_estado}
                  onClick={() => handleAddProduct(producto)}
                >
                  <div className="producto-icon">
                    <i className={`fas ${producto.pro_estado ? 'fa-pizza-slice' : 'fa-ban'}`} />
                  </div>
                  <div className="flex-grow-1 text-start">
                    <h6 className="mb-1">{producto.pro_nombre}</h6>
                    <small className="text-muted">{money.format(producto.pro_pvp || 0)}</small>
                  </div>
                  <i className="fas fa-plus text-primary" />
                </button>
              ))}
              {!loadingCatalog && filteredProductos.length === 0 && (
                <p className="text-center text-muted">No se encontraron productos.</p>
              )}
            </div>
          </div>
        </div>
      )}

      {clientPanelOpen && (
        <div className="selection-panel-backdrop" role="dialog" aria-modal="true">
          <div className="selection-panel">
            <div className="selection-panel-header">
              <div>
                <h5 className="mb-1">Seleccionar cliente</h5>
                <small className="text-muted">
                  {loadingClientes ? 'Cargando clientes…' : `${filteredClientes.length} disponibles`}
                </small>
              </div>
              <button type="button" className="btn btn-light btn-sm" onClick={() => setClientPanelOpen(false)}>
                <i className="fas fa-times" />
              </button>
            </div>
            <div className="search-field mb-3">
              <i className="fas fa-search" />
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                value={clientSearch}
                onChange={(event) => setClientSearch(event.target.value)}
              />
            </div>
            <div className="selection-panel-list">
              {filteredClientes.map((cliente) => (
                <button
                  type="button"
                  className="selection-panel-item"
                  key={cliente.cli_id}
                  onClick={() => handleSelectClient(cliente)}
                >
                  <div className="producto-icon">
                    <i className="fas fa-user" />
                  </div>
                  <div className="flex-grow-1 text-start">
                    <h6 className="mb-1">{cliente.cli_nombre}</h6>
                    <small className="text-muted">{cliente.cli_correo}</small>
                  </div>
                  <i className="fas fa-check text-success" />
                </button>
              ))}
              {!loadingClientes && filteredClientes.length === 0 && (
                <p className="text-center text-muted">
                  No se encontraron clientes. Utiliza el módulo dedicado para registrarlos.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
      <InvoicePreview data={invoiceData} onClose={() => setInvoiceData(null)} />
    </section>
  );
}
