
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getFacturas = () => axios.get(`${API_URL}/consultas/clientes-facturas`);
export const createFactura = (data) => axios.post(`${API_URL}/facturas`, data);
export const updateFactura = (id, data) => axios.put(`${API_URL}/facturas/${id}`, data);
export const deleteFactura = (id) => axios.delete(`${API_URL}/facturas/${id}`);

// Helper function to get clients for the dropdown
export const getClientes = () => axios.get(`${API_URL}/clientes`);
export const addProductoToFactura = (facId, data) => axios.post(`${API_URL}/facturas/${facId}/productos`, data);
export const getFacturaProductos = (facId) => axios.get(`${API_URL}/consultas/factura/${facId}/productos`);
export const removeProductoFromFactura = (facId, proId) => axios.delete(`${API_URL}/facturas/${facId}/productos/${proId}`);
