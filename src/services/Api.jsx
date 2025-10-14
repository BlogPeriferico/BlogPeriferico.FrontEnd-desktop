import axios from "axios";

const API_URL = "https://backblog.azurewebsites.net";

const api = axios.create({
  baseURL: API_URL,
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("userToken"); 
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
      console.log(" Sem token para:", config.url);
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export default api;
