import axios from "axios";

const API_URL = "http://localhost:8080";

const api = axios.create({
  baseURL: API_URL,
});

// Intercepta requisições e injeta o token JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken"); // usar mesma chave que Login.jsx
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log("🔑 Token enviado na requisição:", config.url);
      console.log(
        "=== API: Token adicionado à requisição ===",
        config.url,
        " - Token:",
        token.substring(0, 20) + "..."
      );
    } else {
      console.log("⚠️ Sem token para:", config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
