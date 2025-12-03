// src/services/Api.js
import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor de requisição (mantém igual)
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        if (decodedToken.exp < currentTime) {
          console.warn("⚠️ Token expirado");
          localStorage.removeItem("token");
          window.location.href = "/login?error=session_expired";
          return Promise.reject(new Error("Sessão expirada"));
        }

        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        localStorage.removeItem("token");
        return Promise.reject(error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// 🔧 Interceptor de resposta **ajustado**
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const status = error.response.status;
      const url = error.config?.url || "";

      // ❌ 401 global: só trata como sessão expirada
      // se NÃO for a rota de login/esqueci-senha/etc.
      if (
        status === 401 &&
        !url.includes("/auth/login") &&
        !url.includes("/auth/esqueci-senha") &&
        !url.includes("/auth/redefinir-senha")
      ) {
        console.error("⚠️ Erro 401 - Não autorizado (sessão expirada)");
        localStorage.removeItem("token");
        window.location.href = "/login?error=session_expired";
      } else {
        console.error(`Erro ${status}:`, error.response.data);
      }
    } else if (error.request) {
      console.error("Erro na requisição:", error.request);
    } else {
      console.error("Erro:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
