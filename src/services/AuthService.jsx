import api from "./api";

const AuthService = {
  register: (userData) => {
    return api.post("/usuarios/salvar", userData);
  },

  login: (credentials) => {
    return api.post("/auth/login", credentials).then((response) => {
      if (response.data.token) {
        localStorage.setItem("token", response.data.token);
      }
      return response.data;
    });
  },

  logout: () => {
    localStorage.removeItem("token");
  },

  getCurrentUser: () => {
    return localStorage.getItem("token");
  },
};

export default AuthService;
