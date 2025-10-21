
import api from "./Api";
import {jwtDecode} from "jwt-decode";  

const AuthService = {
  register: async (userData) => {
    const response = await api.post("/usuarios/salvar", userData);
    return response.data;
  },

  login: async (credentials) => {
    const response = await api.post("/auth/login", credentials);
    if (response.data.token) localStorage.setItem("userToken", response.data.token);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem("userToken");
  },

  getCurrentUser: () => {
    const token = localStorage.getItem("userToken");
    if (!token) return null;
    try {
      return jwtDecode(token);
    } catch {
      return null;
    }
  },

  // Atualiza apenas campos como nome, email e senha
  updatePerfil: async (userId, perfilData) => {
    if (!userId) throw new Error("ID do usuário não informado.");
    if (!perfilData || typeof perfilData !== "object") throw new Error("Dados do perfil inválidos.");

    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("Usuário não autenticado.");

    const payload = {
      nome: perfilData.nome ?? undefined,
      email: perfilData.email ?? undefined,
      senhaAtual: perfilData.senhaAtual ?? undefined,
      novaSenha: perfilData.novaSenha ?? undefined,
    };

    const response = await api.patch(`/usuarios/atualizar/${userId}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
    });

    return response.data; // Pode conter { usuario, token }
  },

  // Atualiza apenas a foto
  updateFoto: async (userId, file) => {
    if (!userId) throw new Error("ID do usuário não informado.");
    if (!file) throw new Error("Arquivo de foto inválido.");

    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("Usuário não autenticado.");

    const formData = new FormData();
    formData.append("file", file);

    const response = await api.patch(`/usuarios/${userId}/foto`, formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data; // Retorna o usuário atualizado
  },
};

export default AuthService;
