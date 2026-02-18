import React, { useEffect, useState } from 'react';
import { getProductos, createProducto, updateProducto, deleteProducto } from './apiProducto';
import { motion, AnimatePresence } from 'framer-motion';

const initialForm = { pro_nombre: '', pro_pvp: '', pro_impuesto: 15, pro_estado: true };

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
        } catch (error) {
            console.error('Error loading products:', error);
            if (error.response) {
                console.error('Error response:', error.response.status, error.response.data);
            } else if (error.request) {
                console.error('No response received:', error.request);
            } else {
                console.error('Error setting up request:', error.message);
            }
        }
        setLoading(false);
    }, []);

    useEffect(() => {
        fetchProductos();

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
            pro_impuesto: producto.pro_impuesto || 15,
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

            <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Inventario de Productos</h1>
                    <p className="text-gray-500 mt-1">Gestiona el catálogo de productos disponibles.</p>
                </div>
                <div className="flex gap-3 w-full md:w-auto">
                    <div className="relative flex-1 md:w-64">
                        <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                        <input
                            type="text"
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
                            placeholder="Buscar producto..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => { setShowModal(true); setEditId(null); setForm(initialForm); }}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-200 flex items-center gap-2 whitespace-nowrap transition-colors"
                    >
                        <i className="fas fa-plus"></i> Nuevo Producto
                    </motion.button>
                </div>
            </div>


            <motion.div
                initial={{ opacity: 1 }}
                animate={{ opacity: 1 }}
                className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100"
            >


                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead className="bg-gray-50 border-b border-gray-100">
                            <tr>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">ID</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Producto (Nombre)</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Precio (PVP)</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-500 uppercase tracking-wider">Impuesto %</th>
                                <th className="px-6 py-4 text-center text-xs font-semibold text-gray-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {filteredProductos.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <div className="flex flex-col items-center justify-center">
                                            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                                                <i className="fas fa-box-open text-2xl"></i>
                                            </div>
                                            <p className="text-lg font-medium text-gray-900">No se encontraron productos</p>
                                            <p className="text-sm">Agrega uno nuevo para comenzar.</p>
                                        </div>
                                    </td>
                                </tr>
                            ) : (
                                filteredProductos.map((p) => (
                                    <motion.tr
                                        key={p.pro_id}
                                        variants={itemVariants}
                                        className="hover:bg-gray-50 transition-colors group"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            #{p.pro_id}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-bold text-gray-900">{p.pro_nombre}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm font-semibold text-emerald-600">${parseFloat(p.pro_pvp).toFixed(2)}</div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {p.pro_impuesto ? `${parseFloat(p.pro_impuesto).toFixed(0)}%` : '0%'}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-center">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${p.pro_estado ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'}`}>
                                                {p.pro_estado ? (
                                                    <><i className="fas fa-check-circle mr-1"></i>Activo</>
                                                ) : (
                                                    <><i className="fas fa-ban mr-1"></i>Inactivo</>
                                                )}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                                <button onClick={() => handleEdit(p)} className="text-amber-600 hover:text-amber-900 p-2 hover:bg-amber-50 rounded-lg transition-colors" title="Editar">
                                                    <i className="fas fa-edit"></i>
                                                </button>
                                                <button onClick={() => handleDelete(p.pro_id)} className="text-red-600 hover:text-red-900 p-2 hover:bg-red-50 rounded-lg transition-colors" title="Eliminar">
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
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden relative z-50"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <i className="fas fa-box text-indigo-600"></i>
                                    {editId ? 'Editar Producto' : 'Nuevo Producto'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <i className="fas fa-times text-xl"></i>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Producto <span className="text-red-500">*</span></label>
                                        <input
                                            type="text"
                                            name="pro_nombre"
                                            className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 p-2.5 transition-all"
                                            placeholder="Ej: Pizza Familiar"
                                            required
                                            value={form.pro_nombre}
                                            onChange={handleChange}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Precio PVP <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
                                                <input
                                                    type="number"
                                                    step="0.01"
                                                    name="pro_pvp"
                                                    className="w-full pl-8 pr-4 py-2.5 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all"
                                                    placeholder="0.00"
                                                    required
                                                    value={form.pro_pvp}
                                                    onChange={handleChange}
                                                />
                                            </div>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Impuesto % <span className="text-red-500">*</span></label>
                                            <input
                                                type="number"
                                                step="0.01"
                                                name="pro_impuesto"
                                                className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 p-2.5 transition-all"
                                                placeholder="15"
                                                required
                                                value={form.pro_impuesto}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
                                        <select
                                            name="pro_estado"
                                            className="w-full rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 p-2.5 transition-all"
                                            value={form.pro_estado ? 'true' : 'false'}
                                            onChange={e => setForm(f => ({ ...f, pro_estado: e.target.value === 'true' }))}
                                        >
                                            <option value="true">Activo</option>
                                            <option value="false">Inactivo</option>
                                        </select>
                                    </div>
                                </div>

                                <div className="mt-8 flex justify-end gap-3">
                                    <button
                                        type="button"
                                        onClick={() => setShowModal(false)}
                                        className="px-6 py-2.5 rounded-xl border border-gray-300 text-gray-700 font-medium hover:bg-white hover:border-gray-400 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-8 py-2.5 rounded-xl bg-indigo-600 text-white font-medium hover:bg-indigo-700 shadow-lg shadow-indigo-200 transition-all transform hover:-translate-y-0.5 disabled:opacity-70 disabled:cursor-not-allowed"
                                    >
                                        {loading ? 'Guardando...' : 'Guardar'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}
