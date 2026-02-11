
import React, { useEffect, useState } from 'react';
import { getProductos, createProducto, updateProducto, deleteProducto } from './apiProducto';

const initialForm = { pro_nombre: '', pro_pvp: '', pro_estado: true };

export default function Productos() {
    const [productos, setProductos] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);

    const fetchProductos = React.useCallback(async () => {
        setLoading(true);
        try {
            const res = await getProductos();
            setProductos(res.data);
        } catch {
            console.error('Error al cargar productos');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProductos();
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
                await updateProducto(editId, form);
            } else {
                await createProducto(form);
            }
            setForm(initialForm);
            setEditId(null);
            setShowModal(false);
            fetchProductos();
        } catch {
            console.error('Error al guardar');
        }
        setLoading(false);
    };

    const handleEdit = producto => {
        setForm({
            pro_nombre: producto.pro_nombre,
            pro_pvp: producto.pro_pvp,
            pro_estado: producto.pro_estado,
        });
        setEditId(producto.pro_id);
        setShowModal(true);
    };

    const handleDelete = async id => {
        if (!window.confirm('¿Eliminar producto?')) return;
        setLoading(true);
        try {
            await deleteProducto(id);
            fetchProductos();
        } catch {
            console.error('Error al eliminar');
        }
        setLoading(false);
    };

    const filteredProductos = productos.filter(p =>
        p.pro_nombre.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="container py-5 animate__animated animate__fadeIn">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
            <link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" rel="stylesheet" />

            <div className="row align-items-center mb-5">
                <div className="col-md-7">
                    <h2 className="fw-bold text-dark mb-1">
                        <i className="fas fa-box text-primary me-2"></i>Inventario de Productos
                    </h2>
                    <p className="text-muted mb-0">Gestiona el catálogo de productos disponibles.</p>
                </div>
                <div className="col-md-5 text-md-end mt-4 mt-md-0">
                    <button className="btn btn-primary btn-lg shadow-sm fw-bold rounded-pill px-4 py-2" onClick={() => { setShowModal(true); setEditId(null); setForm(initialForm); }}>
                        <i className="fas fa-plus me-2"></i> Nuevo Producto
                    </button>
                </div>
            </div>

            <div className="table-container">
                <div className="p-4 border-bottom bg-white">
                    <div className="search-container">
                        <i className="fas fa-search search-icon"></i>
                        <input type="text" className="form-control" placeholder="Buscar producto..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th className="ps-4">ID</th>
                                <th>Producto (Nombre)</th>
                                <th>Precio (PVP)</th>
                                <th className="text-center">Estado</th>
                                <th className="text-center pe-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredProductos.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center py-5">
                                        <div className="py-4">
                                            <i className="fas fa-search fa-3x text-muted mb-3 opacity-25"></i>
                                            <h5 className="text-muted fw-bold">No se encontraron productos</h5>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredProductos.map(p => (
                                <tr className="animate__animated animate__fadeIn" key={p.pro_id}>
                                    <td className="ps-4 text-secondary fw-bold">#{p.pro_id}</td>
                                    <td className="fw-bold text-dark">{p.pro_nombre}</td>
                                    <td className="text-success fw-bold">${parseFloat(p.pro_pvp).toFixed(2)}</td>
                                    <td className="text-center">
                                        <span className={`status-badge ${p.pro_estado ? 'status-active' : 'status-inactive'}`}>
                                            {p.pro_estado ? <><i className="fas fa-check-circle me-1"></i>Activo</> : <><i className="fas fa-ban me-1"></i>Inactivo</>}
                                        </span>
                                    </td>
                                    <td className="text-center pe-4">
                                        <button type="button" className="btn btn-sm btn-outline-warning fw-bold px-3 py-1 me-2" onClick={() => handleEdit(p)}>
                                            <i className="fas fa-edit"></i> Editar
                                        </button>
                                        <button type="button" className="btn btn-sm btn-outline-danger fw-bold px-3 py-1" onClick={() => handleDelete(p.pro_id)}>
                                            <i className="fas fa-trash"></i> Eliminar
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Producto */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.2)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content shadow-lg">
                            <div className="modal-header border-0 pt-4 px-4">
                                <h5 className="modal-title fw-bold text-dark"><i className="fas fa-box-open text-primary me-2"></i>{editId ? 'Editar Producto' : 'Nuevo Producto'}</h5>
                                <button type="button" className="btn-close" onClick={() => { setShowModal(false); setEditId(null); setForm(initialForm); }}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">
                                    <div className="row g-3">
                                        <div className="col-12">
                                            <label className="form-label fw-bold small text-muted">Nombre del Producto <span className="text-danger">*</span></label>
                                            <input type="text" name="pro_nombre" className="form-control" placeholder="Ej: Pizza Familiar" required value={form.pro_nombre} onChange={handleChange} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-bold small text-muted">Precio PVP <span className="text-danger">*</span></label>
                                            <input type="number" step="0.01" name="pro_pvp" className="form-control" placeholder="0.00" required value={form.pro_pvp} onChange={handleChange} />
                                        </div>
                                        <div className="col-12">
                                            <label className="form-label fw-bold small text-muted">Estado</label>
                                            <select name="pro_estado" className="form-select" value={form.pro_estado ? 'true' : 'false'} onChange={e => setForm(f => ({ ...f, pro_estado: e.target.value === 'true' }))}>
                                                <option value="true">Activo</option>
                                                <option value="false">Inactivo</option>
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

            <style>{`
        .status-badge { font-size: 0.8rem; padding: 0.35em 0.8em; border-radius: 20px; font-weight: 600; }
        .status-active { background-color: rgba(25, 135, 84, 0.1); color: #198754; border: 1px solid rgba(25, 135, 84, 0.2); }
        .status-inactive { background-color: rgba(108, 117, 125, 0.1); color: #6c757d; border: 1px solid rgba(108, 117, 125, 0.2); }
        .table-container { background: white; border-radius: 1rem; box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075); overflow: hidden; }
        .search-container { position: relative; }
        .search-container .form-control { padding-left: 3rem; height: 3.5rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; background-color: #f8fafc; }
        .search-container .search-icon { position: absolute; left: 1.25rem; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 1.2rem; }
      `}</style>
        </div>
    );
}
