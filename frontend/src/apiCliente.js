import axios from 'axios';

const API_URL = (import.meta.env.VITE_API_URL || 'http://localhost:3000') + '/clientes';

export const getClientes = () => axios.get(API_URL);
export const getClienteById = (id) => axios.get(`${API_URL}/${id}`);
export const createCliente = (data) => axios.post(API_URL, data);
export const updateCliente = (id, data) => axios.put(`${API_URL}/${id}`, data);
export const deleteCliente = (id) => axios.delete(`${API_URL}/${id}`);
