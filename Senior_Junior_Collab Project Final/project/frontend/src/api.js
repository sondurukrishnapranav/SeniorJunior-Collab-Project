// src/api.js
import axios from 'axios';

// Automatically uses the environment variable in production, or localhost in development
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_URL,
});

export default api;