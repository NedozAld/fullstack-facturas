import React, { useEffect, useState } from 'react';
import { getUsuarios, createUsuario, updateUsuario, deleteUsuario } from './apiUsuario';
import { getClientes } from './apiCliente';
import { motion, AnimatePresence } from 'framer-motion';

const initialForm = { usu_username: '', usu_password: '', usu_rol: 'cliente', cli_id: '' };

export default function Usuarios() {
    const [usuarios, setUsuarios] = useState([]);
    const [clientes, setClientes] = useState([]);
    const [form, setForm] = useState(initialForm);
    const [editId, setEditId] = useState(null);
    const [loading, setLoading] = useState(false);
    const [showModal, setShowModal] = useState(false);
    const [errorMsg, setErrorMsg] = useState(null);

    const fetchUsuarios = async () => {
        try {
            setErrorMsg(null);
            const res = await getUsuarios();
            setUsuarios(res.data);
        } catch (error) {
            console.error(error);
            setErrorMsg("Error al cargar usuarios: " + (error.response?.data?.error || error.message));
        }
    };

    const fetchClientes = async () => {
        try {
            const res = await getClientes();
            setClientes(res.data);
        } catch (error) {
            console.error(error);
        }
    };

    useEffect(() => {
        fetchUsuarios();
        fetchClientes();
    }, []);

    const handleChange = e => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async e => {
        e.preventDefault();
        setLoading(true);
        setErrorMsg(null);
        try {
            const payload = { ...form };
            if (payload.usu_rol === 'admin') {
                payload.cli_id = null;
            } else if (payload.usu_rol === 'cliente' && !payload.cli_id) {
            }

            if (editId) {
                await updateUsuario(editId, payload);
            } else {
                await createUsuario(payload);
            }
            setForm(initialForm);
            setEditId(null);
            setShowModal(false);
            fetchUsuarios();
        } catch (error) {
            console.error(error);
            setErrorMsg(error.response?.data?.error || 'Error al guardar usuario');
        }
        setLoading(false);
    };

    const handleEdit = user => {
        setForm({
            ...user,
            usu_password: '',
            usu_rol: user.usu_rol ? user.usu_rol.toLowerCase() : 'cliente',
            cli_id: user.cli_id || ''
        });
        setEditId(user.usu_id);
        setShowModal(true);
    };

    const handleDelete = async id => {
        if (!window.confirm('¿Eliminar usuario?')) return;
        try {
            await deleteUsuario(id);
            fetchUsuarios();
        } catch (error) {
            console.error(error);
            setErrorMsg("Error al eliminar: " + (error.response?.data?.error || error.message));
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1
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
                    <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Usuarios</h1>
                    <p className="text-gray-500 mt-1">Administra el acceso y roles del sistema.</p>
                </div>
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => { setShowModal(true); setEditId(null); setForm(initialForm); }}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-xl font-medium shadow-lg shadow-indigo-200 flex items-center gap-2 whitespace-nowrap transition-colors"
                >
                    <i className="fas fa-user-plus"></i> Nuevo Usuario
                </motion.button>
            </div>

            {errorMsg && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4" role="alert">
                    <strong className="font-bold">Error:</strong>
                    <span className="block sm:inline"> {errorMsg}</span>
                    <span className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setErrorMsg(null)}>
                        <svg className="fill-current h-6 w-6 text-red-500" role="button" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><title>Close</title><path d="M14.348 14.849a1.2 1.2 0 0 1-1.697 0L10 11.819l-2.651 3.029a1.2 1.2 0 1 1-1.697-1.697l2.758-3.15-2.759-3.152a1.2 1.2 0 1 1 1.697-1.697L10 8.183l2.651-3.031a1.2 1.2 0 1 1 1.697 1.697l-2.758 3.152 2.758 3.15a1.2 1.2 0 0 1 0 1.698z" /></svg>
                    </span>
                </div>
            )}


            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

                {usuarios.length === 0 ? (
                    <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
                            <i className="fas fa-users-slash text-2xl"></i>
                        </div>
                        <p className="text-lg font-medium text-gray-900">No hay usuarios registrados</p>
                    </div>
                ) : (
                    usuarios.map(u => (
                        <div
                            key={u.usu_id}
                            className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 group"
                        >
                            <div className="p-6">
                                <div className="flex justify-between items-start mb-4">
                                    <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-xl text-white shadow-lg ${u.usu_rol?.toLowerCase() === 'admin' ? 'bg-indigo-600 shadow-indigo-200' : 'bg-emerald-500 shadow-emerald-200'}`}>
                                        <i className={`fas ${u.usu_rol?.toLowerCase() === 'admin' ? 'fa-user-shield' : 'fa-user'}`}></i>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${u.usu_rol?.toLowerCase() === 'admin' ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' : 'bg-emerald-50 text-emerald-700 border border-emerald-100'}`}>
                                        {u.usu_rol || 'cliente'}
                                    </span>
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-1">{u.usu_username}</h3>
                                <p className="text-gray-500 text-sm mb-6 flex items-center gap-2">
                                    <i className="fas fa-id-badge text-gray-400"></i> ID: {u.usu_id}
                                    {u.Cliente && <span className="text-xs bg-gray-100 px-2 py-0.5 rounded-full ml-1 text-gray-600 font-medium"><i className="fas fa-building mr-1"></i>{u.Cliente.cli_nombre}</span>}
                                </p>

                                <div className="flex gap-2 pt-4 border-t border-gray-100">
                                    <button
                                        onClick={() => handleEdit(u)}
                                        className="flex-1 py-2 rounded-lg bg-gray-50 text-gray-600 font-medium hover:bg-amber-50 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <i className="fas fa-edit"></i> Editar
                                    </button>
                                    <button
                                        onClick={() => handleDelete(u.usu_id)}
                                        className="flex-1 py-2 rounded-lg bg-gray-50 text-gray-600 font-medium hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <i className="fas fa-trash"></i> Eliminar
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>


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
                            className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-50"
                        >
                            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <i className="fas fa-user-circle text-indigo-600"></i>
                                    {editId ? 'Editar Usuario' : 'Nuevo Usuario'}
                                </h3>
                                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                                    <i className="fas fa-times text-xl"></i>
                                </button>
                            </div>

                            <form onSubmit={handleSubmit} className="p-6">
                                <div className="space-y-4">
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Usuario <span className="text-red-500">*</span></label>
                                        <div className="relative">
                                            <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                            <input
                                                type="text"
                                                name="usu_username"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all"
                                                placeholder="Ej: jsmith"
                                                required
                                                value={form.usu_username}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>

                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Contraseña {editId && <span className="text-xs font-normal text-gray-500">(Dejar en blanco para mantener)</span>}</label>
                                        <div className="relative">
                                            <i className="fas fa-lock absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                            <input
                                                type="password"
                                                name="usu_password"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all"
                                                placeholder="••••••••"
                                                required={!editId}
                                                value={form.usu_password}
                                                onChange={handleChange}
                                            />
                                        </div>
                                    </div>
                                    <div>
                                        <label className="block text-sm font-semibold text-gray-700 mb-1">Rol</label>
                                        <div className="relative">
                                            <i className="fas fa-user-tag absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                            <select
                                                name="usu_rol"
                                                className="w-full pl-10 pr-4 py-2.5 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all appearance-none"
                                                value={form.usu_rol}
                                                onChange={handleChange}
                                            >
                                                <option value="cliente">Cliente</option>
                                                <option value="admin">Administrador</option>
                                            </select>
                                            <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                                        </div>
                                    </div>

                                    {form.usu_rol === 'cliente' && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                        >
                                            <label className="block text-sm font-semibold text-gray-700 mb-1">Cliente Asociado <span className="text-red-500">*</span></label>
                                            <div className="relative">
                                                <i className="fas fa-building absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                                                <select
                                                    name="cli_id"
                                                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all appearance-none"
                                                    value={form.cli_id}
                                                    onChange={handleChange}
                                                    required={form.usu_rol === 'cliente'}
                                                >
                                                    <option value="">Seleccione un cliente...</option>
                                                    {clientes.map(cli => (
                                                        <option key={cli.cli_id} value={cli.cli_id}>
                                                            {cli.cli_nombre}
                                                        </option>
                                                    ))}
                                                </select>
                                                <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                                            </div>
                                        </motion.div>
                                    )}
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
