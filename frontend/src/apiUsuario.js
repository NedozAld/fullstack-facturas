import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

const getAuthHeaders = () => {
    const token = localStorage.getItem('token');
    return token ? { Authorization: `Bearer ${token}` } : {};
};

export const getUsuarios = () => axios.get(`${API_URL}/usuarios`, { headers: getAuthHeaders() });
export const getUsuarioById = (id) => axios.get(`${API_URL}/usuarios/${id}`, { headers: getAuthHeaders() });
export const createUsuario = (data) => axios.post(`${API_URL}/usuarios`, data, { headers: getAuthHeaders() });
export const updateUsuario = (id, data) => axios.put(`${API_URL}/usuarios/${id}`, data, { headers: getAuthHeaders() });
export const deleteUsuario = (id) => axios.delete(`${API_URL}/usuarios/${id}`, { headers: getAuthHeaders() });
