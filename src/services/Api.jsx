import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = "https://backblog.azurewebsites.net";
const TOKEN_KEY = "token";

const isBrowser = typeof window !== "undefined";

const api = axios.create({
  baseURL: API_URL,
});

// Helper pra pegar token com segurança
const getToken = () => {
  if (!isBrowser) return null;
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

// Helper pra limpar sessão e redirecionar
const clearSessionAndRedirect = (reason = "session_expired") => {
  if (!isBrowser) return;
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    // se der erro no localStorage, só ignora
  }
  const currentPath = window.location.pathname || "";
  const target = `/login?error=${encodeURIComponent(reason)}`;
  if (currentPath !== "/login") {
    window.location.href = target;
  }
};

// Interceptor de requisição
api.interceptors.request.use(
  (config) => {
    const token = getToken();

    if (token) {
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;

        // Pequena folga de 10s pra evitar bater em limite exato
        if (decodedToken.exp && decodedToken.exp < currentTime - 10) {
          console.warn("⚠️ Token expirado");
          clearSessionAndRedirect("session_expired");
          return Promise.reject(new Error("Sessão expirada"));
        }

        // Garante que headers exista
        config.headers = config.headers || {};
        config.headers.Authorization = `Bearer ${token}`;
      } catch (error) {
        console.error("⚠️ Erro ao decodificar token, limpando sessão.", error);
        clearSessionAndRedirect("invalid_token");
        return Promise.reject(error);
      }
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// Interceptor de resposta
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, data } = error.response;

      // Erro 401 - Não autorizado
      if (status === 401) {
        console.error("⚠️ Erro 401 - Não autorizado");
        clearSessionAndRedirect("session_expired");
      }

      console.error(`Erro ${status}:`, data);
    } else if (error.request) {
      console.error(
        "Erro na requisição (sem resposta do servidor):",
        error.request
      );
    } else {
      console.error("Erro ao configurar requisição:", error.message);
    }

    return Promise.reject(error);
  }
);

export default api;
