import axios from 'axios';

const BASE_URL = 'http://localhost:3000';

export const createFactura = (data) => axios.post(`${BASE_URL}/facturas`, data);
export const updateFactura = (id, data) => axios.put(`${BASE_URL}/facturas/${id}`, data);
export const deleteFactura = (id) => axios.delete(`${BASE_URL}/facturas/${id}`);
export const getFacturas = () => axios.get(`${BASE_URL}/facturas`);
export const getFacturaById = (id) => axios.get(`${BASE_URL}/facturas/${id}`);
export const addProductoToFactura = (facId, data) => axios.post(`${BASE_URL}/facturas/${facId}/productos`, data);
export const removeProductoFromFactura = (facId, proId) => axios.delete(`${BASE_URL}/facturas/${facId}/productos/${proId}`);
export const getFacturaConProductos = (facId) => axios.get(`${BASE_URL}/consultas/factura/${facId}/productos`);
export const getFacturasPorCliente = (cliId) => axios.get(`${BASE_URL}/consultas/cliente/${cliId}/facturas-productos`);
