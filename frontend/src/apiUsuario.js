import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export const getUsuarios = () => axios.get(`${API_URL}/usuarios`);
export const getUsuarioById = (id) => axios.get(`${API_URL}/usuarios/${id}`);
export const createUsuario = (data) => axios.post(`${API_URL}/usuarios`, data);
export const updateUsuario = (id, data) => axios.put(`${API_URL}/usuarios/${id}`, data);
export const deleteUsuario = (id) => axios.delete(`${API_URL}/usuarios/${id}`);
