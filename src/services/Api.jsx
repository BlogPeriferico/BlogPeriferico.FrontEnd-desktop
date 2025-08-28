import axios from "axios";

const API_URL = "http://localhost:8080"; // ou sua URL da nuvem

const api = axios.create({
  baseURL: API_URL,
  // removemos Content-Type fixo para permitir FormData
});

// Intercepta requisições e injeta o token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
