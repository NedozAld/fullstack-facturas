import React, { useEffect, useState } from 'react';
import { getFacturas, createFactura, updateFactura, deleteFactura, getClientes, addProductoToFactura, getFacturaProductos, removeProductoFromFactura } from './apiFactura';
import { getProductos } from './apiProducto';
import { motion, AnimatePresence } from 'framer-motion';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

const initialForm = { cli_id: '', fac_fecha: new Date().toISOString().split('T')[0] };

export default function Facturas() {
    const [facturas, setFacturas] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [productos, setProductos] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [selectedProducts, setSelectedProducts] = useState([]);
    const [currentProduct, setCurrentProduct] = useState({ pro_id: '', facpro_cantidad: 1 });

    const [editId, setEditId] = useState(null);
    const [viewDetailsId, setViewDetailsId] = useState(null);
    const [invoiceDetails, setInvoiceDetails] = useState(null);

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

        const existingIndex = selectedProducts.findIndex(p => p.pro_id === productDetails.pro_id);

        if (existingIndex >= 0) {
            const updatedProducts = [...selectedProducts];
            const newQuantity = parseInt(updatedProducts[existingIndex].facpro_cantidad) + parseInt(currentProduct.facpro_cantidad);
            const pvp = parseFloat(productDetails.pro_pvp);
            const taxRate = parseFloat(productDetails.pro_impuesto || 0);
            const subtotal = pvp * newQuantity;
            const tax = subtotal * (taxRate / 100);

            updatedProducts[existingIndex] = {
                ...updatedProducts[existingIndex],
                facpro_cantidad: newQuantity,
                subtotal: subtotal,
                tax: tax,
                total: subtotal + tax
            };
            setSelectedProducts(updatedProducts);
        } else {
            const quantity = parseInt(currentProduct.facpro_cantidad, 10);
            const pvp = parseFloat(productDetails.pro_pvp);
            const taxRate = parseFloat(productDetails.pro_impuesto || 0);
            const subtotal = pvp * quantity;
            const tax = subtotal * (taxRate / 100);

            setSelectedProducts(prev => [
                ...prev,
                {
                    ...productDetails,
                    facpro_cantidad: quantity,
                    subtotal: subtotal,
                    tax: tax,
                    total: subtotal + tax
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
            let total = 0;
            if (curr.total !== undefined) {
                total = curr.total;
            } else {
                const qty = curr.FacturaProducto?.facpro_cantidad || 0;
                const pvp = curr.FacturaProducto?.facpro_pvp || 0;
                const sub = qty * pvp;
                const taxRate = curr.pro_impuesto || 0;
                const tax = sub * (taxRate / 100);
                total = sub + tax;
            }
            return acc + total;
        }, 0).toFixed(2);
    };

    const handleViewDetails = async (factura) => {
        setLoading(true);
        try {
            const res = await getFacturaProductos(factura.fac_id);
            setInvoiceDetails(res.data);
            setViewDetailsId(factura.fac_id);
            setShowDetailsModal(true);
        } catch (error) {
            console.error("Error fetching details", error);
        }
        setLoading(false);
    };

    const handleEdit = async (factura) => {
        setEditId(factura.fac_id);
        setForm({
            cli_id: factura.cli_id,
            fac_fecha: factura.fac_fecha
        });

        setLoading(true);
        try {
            const res = await getFacturaProductos(factura.fac_id);
            if (res.data && res.data.Productos) {
                const existingProducts = res.data.Productos.map(p => {
                    const qty = p.FacturaProducto.facpro_cantidad;
                    const pvp = p.FacturaProducto.facpro_pvp;
                    const sub = qty * pvp;
                    const taxRate = p.pro_impuesto || 0;
                    const tax = sub * (taxRate / 100);
                    return {
                        ...p,
                        facpro_cantidad: qty,
                        subtotal: sub,
                        tax: tax,
                        total: sub + tax
                    }
                });
                setSelectedProducts(existingProducts);
            }
        } catch (error) {
            console.error("Error loading products for edit", error);
        }
        setLoading(false);

        setShowModal(true);
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
                facId = editId;

                const currentRes = await getFacturaProductos(editId);
                if (currentRes.data && currentRes.data.Productos) {
                    for (const p of currentRes.data.Productos) {
                        await removeProductoFromFactura(editId, p.pro_id);
                    }
                }

                for (const prod of selectedProducts) {
                    await addProductoToFactura(facId, {
                        pro_id: prod.pro_id,
                        facpro_cantidad: prod.facpro_cantidad
                    });
                }

            } else {
                const res = await createFactura(form);
                facId = res.data.fac_id;

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
            const res = await getFacturaProductos(facId);
            setInvoiceDetails(res.data);
            setViewDetailsId(facId);
            setShowDetailsModal(true);
        } catch (error) {
            console.error("Error saving invoice", error);
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

    const generateInvoicePDF = async (factura) => {
        try {
            setLoading(true);
            const res = await getFacturaProductos(factura.fac_id);
            const details = res.data;
            const doc = new jsPDF();

            // Header
            doc.setFontSize(20);
            doc.text('FACTURA', 105, 20, { align: 'center' });

            doc.setFontSize(10);
            doc.text(`N° Factura: ${factura.fac_id}`, 14, 30);
            doc.text(`Fecha: ${factura.fac_fecha}`, 14, 36);
            doc.text(`Cliente: ${factura.Cliente?.cli_nombre || 'Desconocido'}`, 14, 42);
            doc.text(`Correo: ${factura.Cliente?.cli_correo || 'N/A'}`, 14, 48);

            // Table
            const tableColumn = ["Producto", "Cant.", "Precio Unit.", "Impuesto %", "Total"];
            const tableRows = [];

            let grandTotal = 0;

            if (details.Productos) {
                details.Productos.forEach(product => {
                    const productData = [
                        product.pro_nombre,
                        product.FacturaProducto.facpro_cantidad,
                        `$${parseFloat(product.FacturaProducto.facpro_pvp).toFixed(2)}`,
                        `${parseFloat(product.pro_impuesto || 0)}%`,
                        `$${(product.FacturaProducto.facpro_cantidad * product.FacturaProducto.facpro_pvp * (1 + (product.pro_impuesto || 0) / 100)).toFixed(2)}`
                    ];
                    tableRows.push(productData);

                    const sub = product.FacturaProducto.facpro_cantidad * product.FacturaProducto.facpro_pvp;
                    const tax = sub * ((product.pro_impuesto || 0) / 100);
                    grandTotal += sub + tax;
                });
            }

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 55,
            });

            const finalY = doc.lastAutoTable.finalY || 55;
            doc.setFontSize(12);
            doc.text(`TOTAL A PAGAR: $${grandTotal.toFixed(2)}`, 140, finalY + 10);

            doc.save(`factura_${factura.fac_id}.pdf`);
        } catch (error) {
            console.error("Error generating PDF", error);
            alert("Error al generar el reporte PDF: " + (error.message || error));
        }
        setLoading(false);
    };

    const generateGeneralReport = () => {
        try {
            const doc = new jsPDF();

            doc.setFontSize(18);
            doc.text('REPORTE GENERAL DE FACTURAS', 14, 20);
            doc.setFontSize(10);
            doc.text(`Fecha de generación: ${new Date().toLocaleDateString()}`, 14, 28);

            const tableColumn = ["N° Factura", "Cliente", "Fecha"];
            const tableRows = [];

            filteredFacturas.forEach(factura => {
                const invoiceData = [
                    factura.fac_id,
                    factura.Cliente?.cli_nombre || 'Desconocido',
                    factura.fac_fecha,
                ];
                tableRows.push(invoiceData);
            });

            autoTable(doc, {
                head: [tableColumn],
                body: tableRows,
                startY: 35,
            });

            doc.save('reporte_general_facturas.pdf');
        } catch (error) {
            console.error("Error generating General PDF", error);
            alert("Error al generar el reporte general: " + (error.message || error));
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.05
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { type: 'spring', stiffness: 100 }
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Header with Search and Action */}
            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Historial de Facturación</h1>
                    <p className="text-gray-500 mt-1">Gestiona las facturas y controla tus ventas.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                            placeholder="Buscar factura..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button
                        onClick={generateGeneralReport}
                        className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-emerald-200 flex items-center gap-2 whitespace-nowrap transition-colors"
                    >
                        <i className="fas fa-file-pdf"></i> Reporte General
                    </button>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setShowModal(true); setEditId(null); setForm(initialForm); setSelectedProducts([]); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-200 flex items-center gap-2 whitespace-nowrap transition-colors"
                    >
                        <i className="fas fa-plus"></i> Nueva Factura
                    </motion.button>
                </div>
            </div>

            {/* Invoices Grid/List */}
            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
            >
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">No. Factura</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Cliente</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredFacturas.length === 0 ? (
                                <tr>
                                    <td colSpan="4" className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                                <i className="fas fa-search text-2xl"></i>
                                            </div>
                                            <p className="text-lg font-medium text-gray-900">No se encontraron facturas</p>
                                            <p className="text-sm">Intenta con otra búsqueda o crea una nueva.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredFacturas.map((f) => (
                                    <motion.tr
                                        key={f.fac_id}
                                        variants={itemVariants}
                                        className="hover:bg-gray-50 transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                #{f.fac_id}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-8 w-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs mr-3 shadow-sm">
                                                    {f.Cliente?.cli_nombre.charAt(0).toUpperCase()}
                                                </div>
                                                <div className="text-sm font-medium text-gray-900">{f.Cliente ? f.Cliente.cli_nombre : 'Desconocido'}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            <div className="flex items-center gap-2">
                                                <i className="far fa-calendar text-gray-400"></i>
                                                {f.fac_fecha}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => generateInvoicePDF(f)} className="text-gray-600 hover:text-gray-900 p-2 hover:bg-gray-100 rounded-lg transition-colors" title="Descargar PDF">
                                                    <i className="fas fa-file-pdf"></i>
                                                </button>
                                                <button onClick={() => handleViewDetails(f)} className="text-indigo-600 hover:text-indigo-900 p-2 hover:bg-indigo-50 rounded-lg transition-colors" title="Ver Detalles">
                                                    <i className="fas fa-eye"></i>
                                                </button>
                                                <button onClick={() => handleEdit(f)} className="text-amber-600 hover:text-amber-900 p-2 hover:bg-amber-50 rounded-lg transition-colors" title="Editar">
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button onClick={() => handleDelete(f.fac_id)} className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
                                                    <i className="fas fa-trash"></i>
                                                </button>
                                            </div>
                                        </td>
                                    </motion.tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

            {/* Modal Form */}
            <AnimatePresence>
                {showModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                            onClick={() => setShowModal(false)}
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col relative z-50"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <i className="fas fa-file-invoice text-indigo-600"></i>
                                    {editId ? 'Editar Factura' : 'Nueva Factura'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <i className="fas fa-times text-xl"></i>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Cliente</label>
                                        <select
                                            name="cli_id"
                                            className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 p-2.5 transition-all"
                                            required
                                            value={form.cli_id}
                                            onChange={handleChange}
                                        >
                                            <option value="">Seleccione un cliente...</option>
                                            {clientes.map(c => (
                                                <option key={c.cli_id} value={c.cli_id}>{c.cli_nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-semibold text-gray-700">Fecha de Emisión</label>
                                        <input
                                            type="date"
                                            name="fac_fecha"
                                            className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 p-2.5 transition-all"
                                            required
                                            value={form.fac_fecha}
                                            onChange={handleChange}
                                        />
                                    </div>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                                    <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Detalle de Productos</h4>

                                    <div className="flex flex-col md:flex-row gap-3 items-end mb-6">
                                        <div className="flex-1 w-full">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Producto</label>
                                            <select
                                                name="pro_id"
                                                className="w-full rounded-lg border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                value={currentProduct.pro_id}
                                                onChange={handleProductChange}
                                            >
                                                <option value="">Buscar producto...</option>
                                                {productos.filter(p => p.pro_estado).map(p => (
                                                    <option key={p.pro_id} value={p.pro_id}>{p.pro_nombre} - ${p.pro_pvp}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="w-24">
                                            <label className="block text-xs font-medium text-gray-500 mb-1">Cantidad</label>
                                            <input
                                                type="number"
                                                name="facpro_cantidad"
                                                min="1"
                                                className="w-full rounded-lg border-gray-200 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                                                value={currentProduct.facpro_cantidad}
                                                onChange={handleProductChange}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            className="bg-emerald-500 hover:bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors shadow-lg shadow-emerald-200 flex items-center gap-2 h-[38px]"
                                            onClick={addProductToList}
                                        >
                                            <i className="fas fa-plus"></i> Agregar
                                        </button>
                                    </div>

                                    <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
                                        <table className="w-full text-sm">
                                            <thead className="bg-gray-50 text-gray-500 border-b border-gray-100">
                                                <tr>
                                                    <th className="px-4 py-3 text-left font-medium">Descripción</th>
                                                    <th className="px-4 py-3 text-center font-medium">Cant.</th>
                                                    <th className="px-4 py-3 text-right font-medium">Precio</th>
                                                    <th className="px-4 py-3 text-right font-medium">Impuesto</th>
                                                    <th className="px-4 py-3 text-right font-medium">Total</th>
                                                    <th className="px-4 py-3 text-center"></th>
                                                </tr>
                                            </thead>
                                            <tbody className="divide-y divide-gray-50">
                                                {selectedProducts.length === 0 ? (
                                                    <tr>
                                                        <td colSpan="6" className="px-4 py-8 text-center text-gray-400 italic">No hay productos agregados</td>
                                                    </tr>
                                                ) : (
                                                    selectedProducts.map((p, idx) => (
                                                        <tr key={idx} className="group hover:bg-gray-50">
                                                            <td className="px-4 py-3 text-gray-900 font-medium">{p.pro_nombre}</td>
                                                            <td className="px-4 py-3 text-center text-gray-600">{p.facpro_cantidad}</td>
                                                            <td className="px-4 py-3 text-right text-gray-600">${parseFloat(p.pro_pvp).toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-right text-gray-500 text-xs">
                                                                <div className="flex flex-col items-end">
                                                                    <span>${(p.tax).toFixed(2)}</span>
                                                                    <span className="text-gray-400">({parseFloat(p.pro_impuesto || 0)}%)</span>
                                                                </div>
                                                            </td>
                                                            <td className="px-4 py-3 text-right font-bold text-gray-900">${p.total.toFixed(2)}</td>
                                                            <td className="px-4 py-3 text-center">
                                                                <button
                                                                    type="button"
                                                                    className="text-gray-400 hover:text-red-500 transition-colors"
                                                                    onClick={() => removeProductFromList(idx)}
                                                                >
                                                                    <i className="fas fa-times"></i>
                                                                </button>
                                                            </td>
                                                        </tr>
                                                    ))
                                                )}
                                            </tbody>
                                        </table>
                                    </div>
                                    <div className="mt-4 flex justify-end">
                                        <div className="text-right">
                                            <p className="text-sm text-gray-500 uppercase tracking-wide">Total General</p>
                                            <p className="text-3xl font-bold text-indigo-600">${calculateTotal(selectedProducts)}</p>
                                        </div>
                                    </div>
                                </div>
                            </form>

                            <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end gap-3">
                                <button
                                    type="button"
                                    onClick={() => setShowModal(false)}
                                    className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-white hover:border-gray-400 transition-all"
                                >
                                    Cancelar
                                </button>
                                <button
                                    type="button"
                                    onClick={handleSubmit}
                                    disabled={loading}
                                    className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                                >
                                    {loading ? 'Guardando...' : 'Guardar Factura'}
                                </button>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>

            {/* Details Modal */}
            <AnimatePresence>
                {showDetailsModal && invoiceDetails && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 bg-gray-900/60 backdrop-blur-sm"
                            onClick={() => setShowDetailsModal(false)}
                        ></motion.div>
                        <motion.div
                            initial={{ scale: 0.95, opacity: 0, y: 20 }}
                            animate={{ scale: 1, opacity: 1, y: 0 }}
                            exit={{ scale: 0.95, opacity: 0, y: 20 }}
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl overflow-hidden relative z-50"
                        >
                            <div className="bg-indigo-600 px-8 py-6 text-white relative overflow-hidden">
                                <div className="absolute top-0 right-0 p-4 opacity-10">
                                    <i className="fas fa-file-invoice text-9xl transform rotate-12 translate-x-4 -translate-y-4"></i>
                                </div>
                                <div className="relative z-10 flex justify-between items-start">
                                    <div>
                                        <p className="text-indigo-200 text-sm font-medium uppercase tracking-wider mb-1">Factura de Venta</p>
                                        <h2 className="text-3xl font-bold">#{viewDetailsId}</h2>
                                    </div>
                                    <button onClick={() => setShowDetailsModal(false)} className="text-white/80 hover:text-white transition-colors">
                                        <i className="fas fa-times text-xl"></i>
                                    </button>
                                </div>
                                <div className="mt-8 flex gap-8 relative z-10">
                                    <div>
                                        <p className="text-indigo-200 text-xs uppercase tracking-wide mb-1">Fecha Emisión</p>
                                        <p className="font-semibold text-lg">{invoiceDetails.fac_fecha}</p>
                                    </div>
                                    <div>
                                        <p className="text-indigo-200 text-xs uppercase tracking-wide mb-1">Cliente</p>
                                        <p className="font-semibold text-lg flex items-center gap-2">
                                            <i className="fas fa-user-circle text-indigo-300"></i>
                                            {invoiceDetails.Cliente?.cli_nombre || 'Desconocido'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            <div className="p-8">
                                <h4 className="text-sm font-bold text-gray-900 uppercase tracking-wide mb-4">Productos Facturados</h4>
                                <div className="border border-gray-100 rounded-xl overflow-hidden">
                                    <table className="w-full text-sm">
                                        <thead className="bg-gray-50 text-gray-500">
                                            <tr>
                                                <th className="px-6 py-3 text-left font-medium">Producto</th>
                                                <th className="px-6 py-3 text-center font-medium">Cant.</th>
                                                <th className="px-6 py-3 text-right font-medium">Precio Unit.</th>
                                                <th className="px-6 py-3 text-right font-medium">Total</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-gray-50">
                                            {(!invoiceDetails.Productos || invoiceDetails.Productos.length === 0) ? (
                                                <tr><td colSpan="4" className="px-6 py-8 text-center text-gray-400">Sin productos</td></tr>
                                            ) : (
                                                invoiceDetails.Productos.map((prod, idx) => (
                                                    <tr key={idx}>
                                                        <td className="px-6 py-3 text-gray-900 font-medium">{prod.pro_nombre}</td>
                                                        <td className="px-6 py-3 text-center text-gray-600">{prod.FacturaProducto.facpro_cantidad}</td>
                                                        <td className="px-6 py-3 text-right text-gray-600">${parseFloat(prod.FacturaProducto.facpro_pvp).toFixed(2)}</td>
                                                        <td className="px-6 py-3 text-right font-bold text-gray-900">
                                                            ${(prod.FacturaProducto.facpro_cantidad * prod.FacturaProducto.facpro_pvp * (1 + (prod.pro_impuesto || 0) / 100)).toFixed(2)}
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                        <tfoot className="bg-gray-50 border-t border-gray-100">
                                            <tr>
                                                <td colSpan="3" className="px-6 py-4 text-right font-bold text-gray-600">Total a Pagar:</td>
                                                <td className="px-6 py-4 text-right font-bold text-xl text-indigo-600">
                                                    ${calculateTotal(invoiceDetails.Productos)}
                                                </td>
                                            </tr>
                                        </tfoot>
                                    </table>
                                </div>

                                <div className="mt-8 flex justify-end">
                                    <button
                                        onClick={() => setShowDetailsModal(false)}
                                        className="px-6 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-colors"
                                    >
                                        Cerrar Detalle
                                    </button>
                                </div>
                            </div>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
