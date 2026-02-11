
import React, { useEffect, useState } from 'react';
import { getClientes, createCliente, updateCliente, deleteCliente } from './apiCliente';

const initialForm = { cli_nombre: '', cli_correo: '', cli_estado: true };

export default function ClienteCrud() {
  const [clientes, setClientes] = useState([]);
  const [form, setForm] = useState(initialForm);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);

  const fetchClientes = React.useCallback(async () => {
    setLoading(true);
    try {
      const res = await getClientes();
      setClientes(res.data);
    } catch {
      console.error('Error al cargar clientes');
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchClientes();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = e => {
    const { name, value, type, checked } = e.target;
    setForm(f => ({ ...f, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await updateCliente(editId, form);
      } else {
        await createCliente(form);
      }
      setForm(initialForm);
      setEditId(null);
      setShowModal(false);
      fetchClientes();
    } catch {
      console.error('Error al guardar');
    }
    setLoading(false);
  };

  const handleEdit = cliente => {
    setForm({
      cli_nombre: cliente.cli_nombre,
      cli_correo: cliente.cli_correo,
      cli_estado: cliente.cli_estado,
    });
    setEditId(cliente.cli_id);
    setShowModal(true);
  };

  const handleDelete = async id => {
    if (!window.confirm('¿Eliminar cliente?')) return;
    setLoading(true);
    try {
      await deleteCliente(id);
      fetchClientes();
    } catch {
      console.error('Error al eliminar');
    }
    setLoading(false);
  };

  const filteredClientes = clientes.filter(c =>
    c.cli_nombre.toLowerCase().includes(search.toLowerCase()) ||
    c.cli_correo.toLowerCase().includes(search.toLowerCase())
  );

  const getAvatar = nombre => nombre ? nombre[0].toUpperCase() : '?';

  return (
    <div className="container py-5 animate__animated animate__fadeIn">
      <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.2/dist/css/bootstrap.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
      <link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" rel="stylesheet" />

      <div className="row align-items-center mb-5">
        <div className="col-md-7">
          <h2 className="fw-bold text-dark mb-1">
            <i className="fas fa-users text-primary me-2"></i>Cartera de Clientes
          </h2>
          <p className="text-muted mb-0">Gestiona y selecciona los clientes para los pedidos actuales.</p>
        </div>
        <div className="col-md-5 text-md-end mt-4 mt-md-0">
          <button className="btn btn-success btn-lg shadow-sm fw-bold rounded-pill px-4 py-2" onClick={() => { setShowModal(true); setEditId(null); setForm(initialForm); }}>
            <i className="fas fa-user-plus me-2"></i> Nuevo Cliente
          </button>
        </div>
      </div>

      <div className="table-container">
        <div className="p-4 border-bottom bg-white">
          <div className="search-container">
            <i className="fas fa-search search-icon"></i>
            <input type="text" className="form-control" placeholder="Busca por nombre o correo electrónico..." value={search} onChange={e => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="table-responsive">
          <table className="table table-hover align-middle mb-0" id="tablaClientes">
            <thead>
              <tr>
                <th className="ps-4">ID</th>
                <th>Cliente (Nombre / Correo)</th>
                <th className="text-center">Estado</th>
                <th className="text-center pe-4">Acción</th>
              </tr>
            </thead>
            <tbody>
              {filteredClientes.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-center py-5">
                    <div className="py-4">
                      <i className="fas fa-search fa-3x text-muted mb-3 opacity-25"></i>
                      <h5 className="text-muted fw-bold">No se encontraron coincidencias</h5>
                      <p className="text-muted small">Intenta con otros términos de búsqueda.</p>
                    </div>
                  </td>
                </tr>
              ) : filteredClientes.map(c => (
                <tr className="animate__animated animate__fadeIn" key={c.cli_id}>
                  <td className="ps-4 text-secondary fw-bold">#{c.cli_id}</td>
                  <td className="py-3">
                    <div className="d-flex align-items-center">
                      <div className="avatar-circle me-3">{getAvatar(c.cli_nombre)}</div>
                      <div className="d-flex flex-column">
                        <span className="text-dark fw-bold mb-0">{c.cli_nombre}</span>
                        <span className="text-xs text-muted small">{c.cli_correo}</span>
                      </div>
                    </div>
                  </td>
                  <td className="text-center">
                    <span className={`status-badge ${c.cli_estado ? 'status-active' : 'status-inactive'}`}>
                      {c.cli_estado ? <><i className="fas fa-check-circle me-1"></i>Activo</> : <><i className="fas fa-ban me-1"></i>Inactivo</>}
                    </span>
                  </td>
                  <td className="text-center pe-4">
                    <button type="button" className="btn btn-sm btn-outline-primary fw-bold btn-select-client px-3 py-1 seleccionar-cliente me-2"
                      onClick={() => window.alert(`Cliente #${c.cli_id} (${c.cli_nombre}) seleccionado.`)}>
                      Seleccionar <i className="fas fa-arrow-right ms-1"></i>
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-warning fw-bold px-3 py-1 me-2" onClick={() => handleEdit(c)}>
                      <i className="fas fa-edit"></i> Editar
                    </button>
                    <button type="button" className="btn btn-sm btn-outline-danger fw-bold px-3 py-1" onClick={() => handleDelete(c.cli_id)}>
                      <i className="fas fa-trash"></i> Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Cliente */}
      {showModal && (
        <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.2)' }} tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content shadow-lg">
              <div className="modal-header border-0 pt-4 px-4">
                <h5 className="modal-title fw-bold text-dark"><i className="fas fa-user-plus text-primary me-2"></i>{editId ? 'Editar Cliente' : 'Nuevo Cliente'}</h5>
                <button type="button" className="btn-close" onClick={() => { setShowModal(false); setEditId(null); setForm(initialForm); }}></button>
              </div>
              <form onSubmit={handleSubmit}>
                <div className="modal-body p-4">
                  <div className="alert alert-info border-0 bg-light d-flex align-items-center mb-4">
                    <i className="fas fa-database me-2"></i>
                    <small>Registrando Cliente</small>
                  </div>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-bold small text-muted">Nombre del Cliente (cli_nombre) <span className="text-danger">*</span></label>
                      <input type="text" name="cli_nombre" className="form-control" placeholder="Ej: Juan Pérez" required value={form.cli_nombre} onChange={handleChange} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold small text-muted">Correo Electrónico (cli_correo) <span className="text-danger">*</span></label>
                      <input type="email" name="cli_correo" className="form-control" placeholder="juan@correo.com" required value={form.cli_correo} onChange={handleChange} />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold small text-muted">Estado del Cliente (cli_estado) <span className="text-danger">*</span></label>
                      <select name="cli_estado" className="form-select" value={form.cli_estado ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, cli_estado: e.target.value === 'true' }))}>
                        <option value="true">Activo (TRUE)</option>
                        <option value="false">Inactivo (FALSE)</option>
                      </select>
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-0 pb-4 px-4">
                  <button type="button" className="btn btn-light rounded-pill px-4 fw-bold" onClick={() => { setShowModal(false); setEditId(null); setForm(initialForm); }}>Cancelar</button>
                  <button type="submit" className="btn btn-primary rounded-pill px-4 fw-bold shadow-sm" disabled={loading}>
                    <i className="fas fa-save me-2"></i> Guardar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Custom styles for Bootstrap and table */}
      <style>{`
        :root {
            --pizzeria-primary: #0d6efd;
            --pizzeria-success: #198754;
            --pizzeria-bg: #f4f7f6;
        }
        body {
            background-color: var(--pizzeria-bg);
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        }
        .rounded-4 { border-radius: 1rem !important; }
        .table-container {
            background: white;
            border-radius: 1rem;
            box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
            overflow: hidden;
        }
        .table thead th {
            background-color: #f8f9fa;
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            font-weight: 700;
            color: #6c757d;
            border-bottom: 1px solid #edf2f7;
            padding: 1rem;
        }
        .table tbody tr {
            transition: background-color 0.2s ease;
        }
        .table tbody tr:hover {
            background-color: #fdfdfd;
        }
        .avatar-circle {
            width: 42px;
            height: 42px;
            display: flex;
            align-items: center;
            justify-content: center;
            border-radius: 50%;
            background-color: rgba(13, 110, 253, 0.1);
            color: var(--pizzeria-primary);
            font-weight: 700;
            font-size: 0.9rem;
        }
        .search-container {
            position: relative;
        }
        .search-container .form-control {
            padding-left: 3rem;
            height: 3.5rem;
            border-radius: 0.75rem;
            border: 1px solid #e2e8f0;
            background-color: #f8fafc;
        }
        .search-container .search-icon {
            position: absolute;
            left: 1.25rem;
            top: 50%;
            transform: translateY(-50%);
            color: #94a3b8;
            font-size: 1.2rem;
        }
        .btn-select-client {
            transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
            border-radius: 50px;
        }
        .btn-select-client:hover {
            transform: translateX(5px);
            background-color: var(--pizzeria-primary);
            color: white;
        }
        .modal-content {
            border: none;
            border-radius: 1.25rem;
        }
        .status-badge {
            font-size: 0.8rem;
            padding: 0.35em 0.8em;
            border-radius: 20px;
            font-weight: 600;
        }
        .status-active {
            background-color: rgba(25, 135, 84, 0.1);
            color: #198754;
            border: 1px solid rgba(25, 135, 84, 0.2);
        }
        .status-inactive {
            background-color: rgba(108, 117, 125, 0.1);
            color: #6c757d;
            border: 1px solid rgba(108, 117, 125, 0.2);
        }
      `}</style>
    </div>
  );
}
