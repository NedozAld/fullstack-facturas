import { useEffect, useMemo, useState } from 'react';
import {
  createProducto,
  deleteProducto,
  getProductos,
  updateProducto,
} from './apiProducto';
import './ProductoCrud.css';

const emptyForm = { pro_nombre: '', pro_pvp: '', pro_estado: 'true' };
const currencyFormatter = new Intl.NumberFormat('es-EC', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
});

export default function ProductoCrud() {
  const [productos, setProductos] = useState([]);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState(emptyForm);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchProductos = async () => {
    setLoading(true);
    try {
      const { data } = await getProductos();
      setProductos(Array.isArray(data) ? data : []);
      setError('');
    } catch (err) {
      console.error(err);
      setError('No se pudieron cargar los productos.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProductos();
  }, []);

  const filteredProductos = useMemo(() => {
    const query = search.trim().toLowerCase();
    if (!query) return productos;
    return productos.filter((producto) =>
      producto.pro_nombre?.toLowerCase().includes(query) ||
      String(producto.pro_id).includes(query)
    );
  }, [productos, search]);

  const openModal = (producto = null) => {
    if (producto) {
      setForm({
        pro_nombre: producto.pro_nombre ?? '',
        pro_pvp: producto.pro_pvp ?? '',
        pro_estado: producto.pro_estado ? 'true' : 'false',
      });
      setEditingId(producto.pro_id);
    } else {
      setForm(emptyForm);
      setEditingId(null);
    }
    setModalOpen(true);
  };

  const closeModal = () => {
    setModalOpen(false);
    setForm(emptyForm);
    setEditingId(null);
  };

  const handleFormChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const payload = {
      pro_nombre: form.pro_nombre.trim(),
      pro_pvp: Number(form.pro_pvp) || 0,
      pro_estado: form.pro_estado === 'true',
    };

    if (!payload.pro_nombre) {
      setError('El nombre del producto es obligatorio.');
      return;
    }

    setLoading(true);
    try {
      if (editingId) {
        await updateProducto(editingId, payload);
      } else {
        await createProducto(payload);
      }
      closeModal();
      fetchProductos();
    } catch (err) {
      console.error(err);
      setError('No se pudo guardar el producto.');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (proId) => {
    const confirmDelete = window.confirm('¿Deseas eliminar este producto?');
    if (!confirmDelete) return;

    setLoading(true);
    try {
      await deleteProducto(proId);
      fetchProductos();
    } catch (err) {
      console.error(err);
      setError('No se pudo eliminar el producto.');
    } finally {
      setLoading(false);
    }
  };

  const iconPalette = [
    { bg: '#fff3cd', color: '#ffc107', icon: 'fa-utensils' },
    { bg: '#e2e3e5', color: '#6c757d', icon: 'fa-wine-bottle' },
    { bg: '#f8d7da', color: '#dc3545', icon: 'fa-bahai' },
    { bg: '#d1e7dd', color: '#0f5132', icon: 'fa-leaf' },
  ];

  const getIconStyles = (producto) => {
    if (!producto.pro_estado) {
      return { bg: '#f8d7da', color: '#dc3545', icon: 'fa-ban' };
    }
    const key = producto.pro_nombre?.charCodeAt(0) ?? 0;
    return iconPalette[key % iconPalette.length];
  };

  return (
    <section className="producto-crud container py-5 animate__animated animate__fadeIn">
      {loading && (
        <div className="loading-indicator">
          <div className="spinner" />
          <span>Procesando...</span>
        </div>
      )}

      <div className="row align-items-center mb-5 g-3">
        <div className="col-lg-7">
          <h2 className="fw-bold text-dark mb-1">
            <i className="fas fa-pizza-slice text-warning me-2" />Catálogo de Productos
          </h2>
          <p className="text-muted mb-0">Administra el menú, precios y disponibilidad.</p>
        </div>
        <div className="col-lg-5 text-lg-end">
          <button
            type="button"
            className="btn btn-primary btn-lg shadow-sm fw-bold rounded-pill px-4 py-2"
            onClick={() => openModal()}
          >
            <i className="fas fa-plus me-2" /> Nuevo Producto
          </button>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger border-0 shadow-sm" role="alert">
          {error}
        </div>
      )}

      <div className="table-container">
        <div className="p-4 border-bottom bg-white">
          <div className="search-container">
            <i className="fas fa-search search-icon" />
            <input
              type="text"
              className="form-control"
              placeholder="Buscar por nombre o ID..."
              value={search}
              onChange={(event) => setSearch(event.target.value)}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0">
            <thead>
              <tr>
                <th className="ps-4" style={{ width: '80px' }}>ID</th>
                <th>Nombre del Producto</th>
                <th className="text-end pe-5">Precio (PVP)</th>
                <th className="text-center">Estado</th>
                <th className="text-center pe-4">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {filteredProductos.map((producto) => {
                const iconStyle = getIconStyles(producto);
                return (
                  <tr className="animate__animated animate__fadeIn" key={producto.pro_id}>
                    <td className="ps-4 text-secondary fw-bold small">#{producto.pro_id}</td>
                    <td className="py-3">
                      <div className="d-flex align-items-center">
                        <div
                          className="product-icon"
                          style={{ backgroundColor: iconStyle.bg, color: iconStyle.color }}
                        >
                          <i className={`fas ${iconStyle.icon}`} />
                        </div>
                        <div className="d-flex flex-column">
                          <span className="text-dark fw-bold mb-0">{producto.pro_nombre}</span>
                          <span className="text-xs text-muted small">SKU: {producto.pro_id}</span>
                        </div>
                      </div>
                    </td>
                    <td className="text-end pe-5">
                      <span className={`price-tag ${producto.pro_estado ? '' : 'price-tag-muted'}`}>
                        {currencyFormatter.format(producto.pro_pvp || 0)}
                      </span>
                    </td>
                    <td className="text-center">
                      <span
                        className={`status-badge ${producto.pro_estado ? 'status-active' : 'status-inactive'}`}
                      >
                        {producto.pro_estado ? 'Disponible' : 'No Disponible'}
                      </span>
                    </td>
                    <td className="text-center pe-4">
                      <div className="d-flex justify-content-center gap-2">
                        <button
                          type="button"
                          className="btn btn-sm btn-light text-primary border rounded-circle"
                          title="Editar"
                          onClick={() => openModal(producto)}
                        >
                          <i className="fas fa-edit" />
                        </button>
                        <button
                          type="button"
                          className="btn btn-sm btn-light text-danger border rounded-circle"
                          title="Eliminar"
                          onClick={() => handleDelete(producto.pro_id)}
                        >
                          <i className="fas fa-trash" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredProductos.length === 0 && (
          <div className="text-center py-5" id="noResults">
            <div className="py-4">
              <i className="fas fa-box-open fa-3x text-muted mb-3 opacity-25" />
              <h5 className="text-muted fw-bold">Producto no encontrado</h5>
              <p className="text-muted small">Verifica el nombre e intenta nuevamente.</p>
            </div>
          </div>
        )}
      </div>

      {modalOpen && (
        <div className="modal-backdrop" role="dialog" aria-modal="true">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg animate__animated animate__fadeInUp">
              <div className="modal-header border-0 pt-4 px-4">
                <h5 className="modal-title fw-bold text-dark">
                  <i className="fas fa-cart-plus text-primary me-2" />
                  {editingId ? 'Editar Producto' : 'Nuevo Producto'}
                </h5>
                <button type="button" className="btn-close" onClick={closeModal} aria-label="Cerrar" />
              </div>

              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="alert alert-warning border-0 bg-light d-flex align-items-center mb-4">
                    <i className="fas fa-database me-2 text-warning" />
                    <small className="text-muted">
                      Registros <strong>Productos</strong>
                    </small>
                  </div>

                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-bold small text-muted">
                        Nombre del Producto <span className="text-danger">*</span>
                      </label>
                      <input
                        type="text"
                        name="pro_nombre"
                        className="form-control form-control-lg"
                        placeholder="Ej: Pizza Hawaiana Familiar"
                        value={form.pro_nombre}
                        onChange={handleFormChange}
                        required
                      />
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted">
                        Precio PVP <span className="text-danger">*</span>
                      </label>
                      <div className="input-group">
                        <span className="input-group-text bg-white border-end-0 text-success fw-bold">$</span>
                        <input
                          type="number"
                          name="pro_pvp"
                          className="form-control border-start-0 ps-0"
                          placeholder="0.00"
                          step="0.01"
                          min="0"
                          value={form.pro_pvp}
                          onChange={handleFormChange}
                          required
                        />
                      </div>
                      <div className="form-text">Numeric</div>
                    </div>

                    <div className="col-md-6">
                      <label className="form-label fw-bold small text-muted">
                        Estado <span className="text-danger">*</span>
                      </label>
                      <select
                        name="pro_estado"
                        className="form-select"
                        value={form.pro_estado}
                        onChange={handleFormChange}
                      >
                        <option value="true">Disponible (TRUE)</option>
                        <option value="false">No Disponible (FALSE)</option>
                      </select>
                    </div>
                  </div>
                </div>

                <div className="modal-footer border-0 pb-4 px-4">
                  <button type="button" className="btn btn-light rounded-pill px-4 fw-bold" onClick={closeModal}>
                    Cancelar
                  </button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm">
                    <i className="fas fa-save me-2" /> Guardar Producto
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
