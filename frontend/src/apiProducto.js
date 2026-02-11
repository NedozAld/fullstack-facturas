
import axios from 'axios';

const API_URL = 'http://localhost:3000';

export const getProductos = () => axios.get(`${API_URL}/productos`);
export const createProducto = (data) => axios.post(`${API_URL}/productos`, data);
export const updateProducto = (id, data) => axios.put(`${API_URL}/productos/${id}`, data);
export const deleteProducto = (id) => axios.delete(`${API_URL}/productos/${id}`);
