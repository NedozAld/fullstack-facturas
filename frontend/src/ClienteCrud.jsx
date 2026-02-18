import React, { useEffect, useState } from 'react';
import { getClientes, createCliente, updateCliente, deleteCliente } from './apiCliente';
import { motion, AnimatePresence } from 'framer-motion';

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
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Gestión de Clientes</h1>
          <p className="text-gray-500 mt-1">Gestiona y selecciona los clientes para los pedidos.</p>
        </div>
        <div className="flex gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <i className="fas fa-search absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
            <input
              type="text"
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all shadow-sm"
              placeholder="Buscar cliente..."
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
            <i className="fas fa-user-plus"></i> Nuevo Cliente
          </motion.button>
        </div>
      </div>


      <motion.div
        initial={{ opacity: 1 }}
        animate={{ opacity: 1 }}
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
      >
        {filteredClientes.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-2xl shadow-sm border border-gray-100">
            <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4 text-gray-400">
              <i className="fas fa-users-slash text-2xl"></i>
            </div>
            <p className="text-lg font-medium text-gray-900">No se encontraron clientes</p>
            <p className="text-sm text-gray-500">Intenta con otros términos de búsqueda.</p>
          </div>
        ) : (
          filteredClientes.map(c => (
            <motion.div
              key={c.cli_id}
              variants={itemVariants}
              className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-100 hover:shadow-2xl transition-all duration-300 group"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div className="w-12 h-12 rounded-xl bg-indigo-100 text-indigo-600 flex items-center justify-center text-xl font-bold shadow-sm">
                    {getAvatar(c.cli_nombre)}
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold ${c.cli_estado ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-gray-100 text-gray-600 border border-gray-200'}`}>
                    {c.cli_estado ? 'Activo' : 'Inactivo'}
                  </span>
                </div>

                <h3 className="text-lg font-bold text-gray-900 mb-1">{c.cli_nombre}</h3>
                <p className="text-gray-500 text-sm mb-6 flex items-center gap-2">
                  <i className="fas fa-envelope text-gray-400"></i> {c.cli_correo}
                </p>

                <div className="flex gap-2 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => handleEdit(c)}
                    className="flex-1 py-2 rounded-lg bg-gray-50 text-gray-600 font-medium hover:bg-amber-50 hover:text-amber-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-edit"></i> Editar
                  </button>
                  <button
                    onClick={() => handleDelete(c.cli_id)}
                    className="flex-1 py-2 rounded-lg bg-gray-50 text-gray-600 font-medium hover:bg-red-50 hover:text-red-600 transition-colors flex items-center justify-center gap-2"
                  >
                    <i className="fas fa-trash"></i> Eliminar
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        )}
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
              className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative z-50"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                  <i className="fas fa-user-circle text-indigo-600"></i>
                  {editId ? 'Editar Cliente' : 'Nuevo Cliente'}
                </h3>
                <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 transition-colors">
                  <i className="fas fa-times text-xl"></i>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="p-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre del Cliente <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <i className="fas fa-user absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      <input
                        type="text"
                        name="cli_nombre"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all"
                        placeholder="Ej: Juan Pérez"
                        required
                        value={form.cli_nombre}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Electrónico <span className="text-red-500">*</span></label>
                    <div className="relative">
                      <i className="fas fa-envelope absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      <input
                        type="email"
                        name="cli_correo"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all"
                        placeholder="juan@correo.com"
                        required
                        value={form.cli_correo}
                        onChange={handleChange}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Estado</label>
                    <div className="relative">
                      <i className="fas fa-toggle-on absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
                      <select
                        name="cli_estado"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border-gray-200 focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-gray-50 transition-all appearance-none"
                        value={form.cli_estado ? 'true' : 'false'}
                        onChange={e => setForm(f => ({ ...f, cli_estado: e.target.value === 'true' }))}
                      >
                        <option value="true">Activo</option>
                        <option value="false">Inactivo</option>
                      </select>
                      <i className="fas fa-chevron-down absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 pointer-events-none text-xs"></i>
                    </div>
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
