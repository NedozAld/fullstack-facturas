import { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

const Dashboard = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    const [backendStatus, setBackendStatus] = useState('checking');

    useEffect(() => {
        const checkBackend = async () => {
            try {
                await fetch('http://localhost:3000/');
                setBackendStatus('connected');
            } catch (error) {
                console.error('Backend connection failed:', error);
                setBackendStatus('disconnected');
            }
        };
        checkBackend();
        const interval = setInterval(checkBackend, 5000);
        return () => clearInterval(interval);
    }, []);

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/login');
    };

    const isActive = (path) => location.pathname === path;

    const navItems = [
        { path: '/', icon: 'fas fa-users', label: 'Clientes' },
        { path: '/productos', icon: 'fas fa-box', label: 'Productos' },
        { path: '/facturas', icon: 'fas fa-receipt', label: 'Facturas' },
        ...(user.rol === 'admin' ? [{ path: '/usuarios', icon: 'fas fa-user-shield', label: 'Admin. Usuarios' }] : [])
    ];

    return (
        <div className="flex min-h-screen bg-gray-50 font-sans">

            <motion.div
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                transition={{ type: "spring", stiffness: 100 }}
                className="w-72 bg-white border-r border-gray-200 flex flex-col shadow-xl z-20"
            >
                <div className="p-8 pb-4">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="w-10 h-10 bg-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-indigo-200">
                            <i className="fas fa-file-invoice-dollar text-white text-lg"></i>
                        </div>
                        <h1 className="text-xl font-bold text-gray-800 tracking-tight">FacturaApp</h1>
                    </div>

                    <div className="space-y-1">
                        <p className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-3 px-3">Menú Principal</p>
                        {navItems.map((item) => (
                            <Link to={item.path} key={item.path} className="block">
                                <div className={`relative px-3 py-3 rounded-lg flex items-center transition-all duration-200 group ${isActive(item.path) ? 'bg-indigo-50 text-indigo-700' : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'}`}>
                                    {isActive(item.path) && (
                                        <motion.div
                                            layoutId="activeNav"
                                            className="absolute left-0 w-1 h-6 bg-indigo-600 rounded-r-full"
                                        />
                                    )}
                                    <i className={`${item.icon} w-6 text-center text-lg mr-3 ${isActive(item.path) ? 'text-indigo-600' : 'text-gray-400 group-hover:text-gray-600'}`}></i>
                                    <span className="font-medium">{item.label}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>

                <div className="mt-auto p-6 border-t border-gray-100">
                    <div className="flex items-center gap-3 mb-4 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center text-indigo-600 font-bold border-2 border-white shadow-sm relative">
                            {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                            <div className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${backendStatus === 'connected' ? 'bg-emerald-500' : backendStatus === 'disconnected' ? 'bg-red-500' : 'bg-amber-500'}`} title={backendStatus === 'connected' ? 'Conectado al servidor' : 'Sin conexión al servidor'}></div>
                        </div>
                        <div className="overflow-hidden">
                            <p className="text-sm font-bold text-gray-900 truncate">{user.username || 'Usuario'}</p>
                            <p className="text-xs text-gray-500 truncate">{user.rol || 'Rol Desconocido'}</p>
                        </div>
                    </div>

                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="w-full py-2.5 px-4 bg-white border border-red-200 text-red-600 rounded-lg text-sm font-medium hover:bg-red-50 hover:border-red-300 transition-colors flex items-center justify-center gap-2"
                    >
                        <i className="fas fa-sign-out-alt"></i>
                        <span>Cerrar Sesión</span>
                    </motion.button>
                </div>
            </motion.div>


            <div className="flex-1 flex flex-col h-screen overflow-hidden">

                <header className="bg-white/80 border-b border-gray-200 py-4 px-8 backdrop-blur-md sticky top-0 z-10 flex justify-between items-center">
                    <div>
                        <h2 className="text-2xl font-bold text-gray-800">
                            {isActive('/') && 'Gestión de Clientes'}
                            {isActive('/productos') && 'Inventario de Productos'}
                            {isActive('/facturas') && 'Historial de Facturas'}
                            {isActive('/usuarios') && 'Administración de Usuarios'}
                        </h2>
                        <p className="text-sm text-gray-500 mt-1">
                            {isActive('/') && 'Administra tu base de datos de clientes.'}
                            {isActive('/productos') && 'Gestiona tu catálogo de productos y precios.'}
                            {isActive('/facturas') && 'Consulta y crea nuevas facturas.'}
                            {isActive('/usuarios') && 'Control de acceso y roles del sistema.'}
                        </p>
                    </div>
                    <div className="flex items-center gap-4">
                        <button className="p-2 text-gray-400 hover:text-gray-600 transition-colors relative">
                            <i className="fas fa-bell text-xl"></i>
                            <span className="absolute top-1 right-1 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-white"></span>
                        </button>
                    </div>
                </header>

                <main className="flex-1 overflow-y-auto p-8 bg-gray-50 scroll-smooth">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default Dashboard;
