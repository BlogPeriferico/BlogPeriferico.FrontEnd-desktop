import axios from "axios";
import { jwtDecode } from "jwt-decode";

const API_URL = "https://backblog.azurewebsites.net";

const api = axios.create({
  baseURL: API_URL,
});

// Interceptor de requisição
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("token");
    
    if (token) {
      // Verifica se o token está expirado
      try {
        const decodedToken = jwtDecode(token);
        const currentTime = Date.now() / 1000;
        
        if (decodedToken.exp < currentTime) {
          console.warn("⚠️ Token expirado");
          // Remove o token expirado
          localStorage.removeItem("token");
          window.location.href = "/login";
          return Promise.reject(new Error("Sessão expirada"));
        }
        
        // Adiciona o token ao cabeçalho
        config.headers.Authorization = `Bearer ${token}`;
        console.log("🔑 Token válido para:", config.url);
        
      } catch (error) {
        console.error("Erro ao decodificar token:", error);
        localStorage.removeItem("token");
        window.location.href = "/login";
        return Promise.reject(error);
      }
    } else {
      console.log("ℹ️ Nenhum token encontrado para:", config.url);
    }
    
    return config;
  },
  (error) => {
    console.error("Erro no interceptor de requisição:", error);
    return Promise.reject(error);
  }
);

// Interceptor de resposta
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    if (error.response) {
      // Erro 401 - Não autorizado
      if (error.response.status === 401) {
        console.error("⚠️ Erro 401 - Não autorizado");
        localStorage.removeItem("token");
        window.location.href = "/login?error=session_expired";
      }
      // Outros erros
      console.error(`Erro ${error.response.status}:`, error.response.data);
    } else if (error.request) {
      console.error("Erro na requisição:", error.request);
    } else {
      console.error("Erro:", error.message);
    }
    
    return Promise.reject(error);
  }
);

export default api;
