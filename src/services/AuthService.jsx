import api from "./Api";

const AuthService = {
  register: (userData) => {
    console.log("Tentando registrar usuário:", userData);
    return api
      .post("/usuarios/salvar", userData)
      .then((response) => {
        console.log("Resposta do backend ao registrar:", response.data);
        return response.data;
      })
      .catch((err) => {
        console.error("Erro ao registrar usuário:", err);
        throw err;
      });
  },

  login: (credentials) => {
    console.log("Tentando login com:", credentials);
    return api
      .post("/auth/login", credentials)
      .then((response) => {
        console.log("Resposta do backend ao logar:", response.data);
        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          console.log("Token armazenado no localStorage:", response.data.token);
        }
        return response.data;
      })
      .catch((err) => {
        console.error("Erro ao logar:", err);
        throw err;
      });
  },

  logout: () => {
    console.log("Deslogando usuário");
    localStorage.removeItem("token");
  },

  getCurrentUser: () => {
    const token = localStorage.getItem("token");
    console.log("Token atual no localStorage:", token);
    return token;
  },
};

export default AuthService;
