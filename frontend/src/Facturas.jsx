
import React, { useEffect, useState } from 'react';
import { getFacturas, createFactura, updateFactura, deleteFactura, getClientes, addProductoToFactura, getFacturaProductos } from './apiFactura';
import { getProductos } from './apiProducto';

const initialForm = { cli_id: '', fac_fecha: new Date().toISOString().split('T')[0] };

export default function Facturas() {
    const [facturas, setFacturas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]); // List of available products
    const [form, setForm] = useState(initialForm);
    const [selectedProducts, setSelectedProducts] = useState([]); // Products added to the current invoice (creation)
    const [currentProduct, setCurrentProduct] = useState({ pro_id: '', facpro_cantidad: 1 }); // Temp product being added

    const [editId, setEditId] = useState(null);
    const [viewDetailsId, setViewDetailsId] = useState(null); // ID for viewing details
    const [invoiceDetails, setInvoiceDetails] = useState(null); // Details of the viewed invoice

    const [loading, setLoading] = useState(false);
    const [search, setSearch] = useState('');
    const [showModal, setShowModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);

    const fetchData = React.useCallback(async () => {
        setLoading(true);
        try {
            const [resFacturas, resClientes, resProductos] = await Promise.all([
                getFacturas(),
                getClientes(),
                getProductos()
            ]);
            setFacturas(resFacturas.data);
            setClientes(resClientes.data);
            setProductos(resProductos.data);
        } catch {
            console.error('Error al cargar datos');
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchData();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const handleChange = e => {
        const { name, value } = e.target;
        setForm(f => ({ ...f, [name]: value }));
    };

    const handleProductChange = e => {
        const { name, value } = e.target;
        setCurrentProduct(p => ({ ...p, [name]: value }));
    };

    const addProductToList = () => {
        if (!currentProduct.pro_id || currentProduct.facpro_cantidad <= 0) return;

        const productDetails = productos.find(p => p.pro_id.toString() === currentProduct.pro_id.toString());
        if (!productDetails) return;

        // Check if product is already in list
        const existingIndex = selectedProducts.findIndex(p => p.pro_id === productDetails.pro_id);

        if (existingIndex >= 0) {
            // Update quantity
            const updatedProducts = [...selectedProducts];
            const newQuantity = parseInt(updatedProducts[existingIndex].facpro_cantidad) + parseInt(currentProduct.facpro_cantidad);
            updatedProducts[existingIndex] = {
                ...updatedProducts[existingIndex],
                facpro_cantidad: newQuantity,
                total: parseFloat(productDetails.pro_pvp) * newQuantity
            };
            setSelectedProducts(updatedProducts);
        } else {
            // Add new
            setSelectedProducts(prev => [
                ...prev,
                {
                    ...productDetails,
                    facpro_cantidad: parseInt(currentProduct.facpro_cantidad, 10),
                    total: parseFloat(productDetails.pro_pvp) * parseInt(currentProduct.facpro_cantidad, 10)
                }
            ]);
        }

        setCurrentProduct({ pro_id: '', facpro_cantidad: 1 });
    };

    const removeProductFromList = (index) => {
        setSelectedProducts(prev => prev.filter((_, i) => i !== index));
    };

    const calculateTotal = (productsList) => {
        if (!productsList) return "0.00";
        return productsList.reduce((acc, curr) => {
            // Handle both structure types (creation vs fetched details)
            const total = curr.total !== undefined ? curr.total : (curr.FacturaProducto?.facpro_pvp * curr.FacturaProducto?.facpro_cantidad);
            return acc + total;
        }, 0).toFixed(2);
    };

    const handleSubmit = async e => {
        e.preventDefault();
        if (selectedProducts.length === 0 && !editId) {
            alert("Debe agregar al menos un producto a la factura.");
            return;
        }

        setLoading(true);
        try {
            let facId = editId;
            if (editId) {
                await updateFactura(editId, form);
            } else {
                const res = await createFactura(form);
                facId = res.data.fac_id;

                // Add products to the created invoice
                for (const prod of selectedProducts) {
                    await addProductoToFactura(facId, {
                        pro_id: prod.pro_id,
                        facpro_cantidad: prod.facpro_cantidad
                    });
                }
            }

            setForm(initialForm);
            setSelectedProducts([]);
            setEditId(null);
            setShowModal(false);
            fetchData();
            const res = await getFacturaProductos(factura.fac_id);
            setInvoiceDetails(res.data);
            setViewDetailsId(factura.fac_id);
            setShowDetailsModal(true);
        } catch (error) {
            console.error("Error fetching details", error);
        }
        setLoading(false);
    };

    const handleDelete = async id => {
        if (!window.confirm('¿Eliminar factura?')) return;
        setLoading(true);
        try {
            await deleteFactura(id);
            fetchData();
        } catch {
            console.error('Error al eliminar');
        }
        setLoading(false);
    };

    const filteredFacturas = facturas.filter(f =>
        (f.Cliente?.cli_nombre || '').toLowerCase().includes(search.toLowerCase()) ||
        f.fac_id.toString().includes(search)
    );

    return (
        <div className="container py-5 animate__animated animate__fadeIn">
            <link href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css" rel="stylesheet" />
            <link href="https://cdnjs.cloudflare.com/ajax/libs/animate.css/4.1.1/animate.min.css" rel="stylesheet" />

            <div className="row align-items-center mb-5">
                <div className="col-md-7">
                    <h2 className="fw-bold text-dark mb-1">
                        <i className="fas fa-file-invoice-dollar text-primary me-2"></i>Historial de Facturación
                    </h2>
                    <p className="text-muted mb-0">Gestiona las facturas y ventas del sistema.</p>
                </div>
                <div className="col-md-5 text-md-end mt-4 mt-md-0">
                    <button className="btn btn-primary btn-lg shadow-sm fw-bold rounded-pill px-4 py-2" onClick={() => { setShowModal(true); setEditId(null); setForm(initialForm); setSelectedProducts([]); }}>
                        <i className="fas fa-plus me-2"></i> Nueva Factura
                    </button>
                </div>
            </div>

            <div className="table-container">
                <div className="p-4 border-bottom bg-white">
                    <div className="search-container">
                        <i className="fas fa-search search-icon"></i>
                        <input type="text" className="form-control" placeholder="Buscar por ID o Cliente..." value={search} onChange={e => setSearch(e.target.value)} />
                    </div>
                </div>

                <div className="table-responsive">
                    <table className="table table-hover align-middle mb-0">
                        <thead>
                            <tr>
                                <th className="ps-4">No. Factura</th>
                                <th>Cliente</th>
                                <th>Fecha Emisión</th>
                                <th className="text-center pe-4">Acciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredFacturas.length === 0 ? (
                                <tr>
                                    <td colSpan={4} className="text-center py-5">
                                        <div className="py-4">
                                            <i className="fas fa-search fa-3x text-muted mb-3 opacity-25"></i>
                                            <h5 className="text-muted fw-bold">No se encontraron facturas</h5>
                                        </div>
                                    </td>
                                </tr>
                            ) : filteredFacturas.map(f => (
                                <tr className="animate__animated animate__fadeIn" key={f.fac_id}>
                                    <td className="ps-4 text-secondary fw-bold">#{f.fac_id}</td>
                                    <td>
                                        <div className="d-flex align-items-center">
                                            <div className="avatar-circle me-3 bg-light text-primary">
                                                <i className="fas fa-user"></i>
                                            </div>
                                            <span className="fw-bold text-dark">{f.Cliente ? f.Cliente.cli_nombre : 'Cliente Desconocido'}</span>
                                        </div>
                                    </td>
                                    <td><i className="far fa-calendar-alt me-2 text-muted"></i>{f.fac_fecha}</td>
                                    <td className="text-center pe-4">
                                        <button type="button" className="btn btn-sm btn-outline-info fw-bold px-3 py-1 me-2" onClick={() => handleViewDetails(f)} title="Ver Productos">
                                            <i className="fas fa-eye"></i>
                                        </button>
                                        <button type="button" className="btn btn-sm btn-outline-warning fw-bold px-3 py-1 me-2" onClick={() => handleEdit(f)} title="Editar Cabecera">
                                            <i className="fas fa-edit"></i>
                                        </button>
                                        <button type="button" className="btn btn-sm btn-outline-danger fw-bold px-3 py-1" onClick={() => handleDelete(f.fac_id)} title="Eliminar">
                                            <i className="fas fa-trash"></i>
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Modal Factura (Crear/Editar Cabecera) */}
            {showModal && (
                <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header border-0 pt-4 px-4 bg-light">
                                <h5 className="modal-title fw-bold text-dark"><i className="fas fa-file-invoice text-primary me-2"></i>{editId ? 'Editar Factura' : 'Nueva Factura'}</h5>
                                <button type="button" className="btn-close" onClick={() => { setShowModal(false); setEditId(null); setForm(initialForm); }}></button>
                            </div>
                            <form onSubmit={handleSubmit}>
                                <div className="modal-body p-4">

                                    {/* Cabecera Factura */}
                                    <div className="card border-0 shadow-sm mb-4">
                                        <div className="card-body bg-light rounded-3">
                                            <h6 className="fw-bold text-muted mb-3 text-uppercase small">Datos de la Factura</h6>
                                            <div className="row g-3">
                                                <div className="col-md-8">
                                                    <label className="form-label fw-bold small text-muted">Cliente <span className="text-danger">*</span></label>
                                                    <select name="cli_id" className="form-select" required value={form.cli_id} onChange={handleChange}>
                                                        <option value="">Seleccione un cliente...</option>
                                                        {clientes.map(c => (
                                                            <option key={c.cli_id} value={c.cli_id}>{c.cli_nombre} ({c.cli_correo})</option>
                                                        ))}
                                                    </select>
                                                </div>
                                                <div className="col-md-4">
                                                    <label className="form-label fw-bold small text-muted">Fecha de Emisión <span className="text-danger">*</span></label>
                                                    <input type="date" name="fac_fecha" className="form-control" required value={form.fac_fecha} onChange={handleChange} />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Detalle Productos - Sólo visible al crear */}
                                    {!editId && (
                                        <div className="card border-0 shadow-sm">
                                            <div className="card-body">
                                                <h6 className="fw-bold text-muted mb-3 text-uppercase small">Detalle de Productos</h6>

                                                {/* Selector de productos */}
                                                <div className="row g-2 align-items-end mb-3">
                                                    <div className="col-md-6">
                                                        <label className="form-label small text-muted">Producto</label>
                                                        <select name="pro_id" className="form-select form-select-sm" value={currentProduct.pro_id} onChange={handleProductChange}>
                                                            <option value="">Buscar producto...</option>
                                                            {productos.filter(p => p.pro_estado).map(p => (
                                                                <option key={p.pro_id} value={p.pro_id}>{p.pro_nombre} - ${p.pro_pvp}</option>
                                                            ))}
                                                        </select>
                                                    </div>
                                                    <div className="col-md-3">
                                                        <label className="form-label small text-muted">Cantidad</label>
                                                        <input type="number" name="facpro_cantidad" min="1" className="form-control form-control-sm" value={currentProduct.facpro_cantidad} onChange={handleProductChange} />
                                                    </div>
                                                    <div className="col-md-3">
                                                        <button type="button" className="btn btn-success btn-sm w-100 fw-bold" onClick={addProductToList}>
                                                            <i className="fas fa-plus me-1"></i> Agregar
                                                        </button>
                                                    </div>
                                                </div>

                                                {/* Lista de productos agregados */}
                                                <div className="table-responsive bg-light rounded-3 p-2 mb-2" style={{ maxHeight: '200px', overflowY: 'auto' }}>
                                                    <table className="table table-sm table-borderless mb-0 small">
                                                        <thead className="text-muted border-bottom">
                                                            <tr>
                                                                <th>Producto</th>
                                                                <th className="text-center">Cant.</th>
                                                                <th className="text-end">Precio</th>
                                                                <th className="text-end">Total</th>
                                                                <th></th>
                                                            </tr>
                                                        </thead>
                                                        <tbody>
                                                            {selectedProducts.length === 0 ? (
                                                                <tr><td colSpan="5" className="text-center text-muted py-3">No hay productos agregados</td></tr>
                                                            ) : selectedProducts.map((p, idx) => (
                                                                <tr key={idx}>
                                                                    <td>{p.pro_nombre}</td>
                                                                    <td className="text-center">{p.facpro_cantidad}</td>
                                                                    <td className="text-end">${p.pro_pvp}</td>
                                                                    <td className="text-end fw-bold">${p.total.toFixed(2)}</td>
                                                                    <td className="text-end">
                                                                        <button type="button" className="btn btn-link text-danger p-0" onClick={() => removeProductFromList(idx)}>
                                                                            <i className="fas fa-times"></i>
                                                                        </button>
                                                                    </td>
                                                                </tr>
                                                            ))}
                                                        </tbody>
                                                    </table>
                                                </div>

                                                <div className="text-end">
                                                    <h5 className="fw-bold text-dark">Total: <span className="text-primary">${calculateTotal(selectedProducts)}</span></h5>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                    {editId && <div className="alert alert-warning"><i className="fas fa-info-circle me-2"></i>Para modificar productos, elimine la factura y cree una nueva.</div>}

                                </div>
                                <div className="modal-footer border-0 pb-4 px-4 bg-light">
                                    <button type="button" className="btn btn-white border rounded-pill px-4 fw-bold" onClick={() => { setShowModal(false); setEditId(null); setForm(initialForm); }}>Cancelar</button>
                                    <button type="submit" className="btn btn-primary rounded-pill px-5 fw-bold shadow-sm" disabled={loading}>
                                        <i className="fas fa-save me-2"></i> Guardar Factura
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Ver Detalles */}
            {showDetailsModal && invoiceDetails && (
                <div className="modal fade show" style={{ display: 'block', background: 'rgba(0,0,0,0.5)' }} tabIndex="-1">
                    <div className="modal-dialog modal-dialog-centered modal-lg">
                        <div className="modal-content shadow-lg border-0">
                            <div className="modal-header border-0 pt-4 px-4 bg-light">
                                <h5 className="modal-title fw-bold text-dark">
                                    <i className="fas fa-receipt text-primary me-2"></i>
                                    Factura #{viewDetailsId}
                                </h5>
                                <button type="button" className="btn-close" onClick={() => setShowDetailsModal(false)}></button>
                            </div>
                            <div className="modal-body p-4">
                                <div className="d-flex justify-content-between mb-4">
                                    <div>
                                        <small className="text-muted d-block uppercase fw-bold">Fecha de Emisión</small>
                                        <span className="fw-bold text-dark">{invoiceDetails.fac_fecha}</span>
                                    </div>
                                </div>

                                <h6 className="fw-bold text-muted mb-3 text-uppercase small">Productos Facturados</h6>
                                <div className="table-responsive bg-white border rounded-3 p-0">
                                    <table className="table table-hover mb-0">
                                        <thead className="bg-light text-muted small">
                                            <tr>
                                                <th className="ps-3 py-3">Producto</th>
                                                <th className="text-center py-3">Cantidad</th>
                                                <th className="text-end py-3">Precio Unit.</th>
                                                <th className="text-end pe-3 py-3">Subtotal</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {(!invoiceDetails.Productos || invoiceDetails.Productos.length === 0) ? (
                                                <tr><td colSpan="4" className="text-center py-4 text-muted">Esta factura no tiene productos registrados.</td></tr>
                                            ) : invoiceDetails.Productos.map((prod, idx) => (
                                                <tr key={idx}>
                                                    <td className="ps-3">{prod.pro_nombre}</td>
                                                    <td className="text-center">{prod.FacturaProducto.facpro_cantidad}</td>
                                                    <td className="text-end">${parseFloat(prod.FacturaProducto.facpro_pvp).toFixed(2)}</td>
                                                    <td className="text-end pe-3 fw-bold">${(prod.FacturaProducto.facpro_pvp * prod.FacturaProducto.facpro_cantidad).toFixed(2)}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                        <tfoot className="bg-light border-top">
                                            <tr>
                                                <td colSpan="3" className="text-end py-3 fw-bold text-dark">TOTAL GENERAL:</td>
                                                <td className="text-end pe-3 py-3 fw-bold text-primary fs-5">
                                                    ${calculateTotal(invoiceDetails.Productos.map(p => ({
                                                        total: p.FacturaProducto.facpro_pvp * p.FacturaProducto.facpro_cantidad
                                                    })))}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>
                            </div>
                            <div className="modal-footer border-0 pb-4 px-4 bg-light">
                                <button type="button" className="btn btn-primary rounded-pill px-4 fw-bold" onClick={() => setShowDetailsModal(false)}>Cerrar</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .table-container { background: white; border-radius: 1rem; box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075); overflow: hidden; }
        .search-container { position: relative; }
        .search-container .form-control { padding-left: 3rem; height: 3.5rem; border-radius: 0.75rem; border: 1px solid #e2e8f0; background-color: #f8fafc; }
        .search-container .search-icon { position: absolute; left: 1.25rem; top: 50%; transform: translateY(-50%); color: #94a3b8; font-size: 1.2rem; }
        .avatar-circle { width: 35px; height: 35px; display: flex; align-items: center; justify-content: center; border-radius: 50%; }
      `}</style>
        </div>
    );
}
