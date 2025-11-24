import api from "./Api";
import { jwtDecode } from "jwt-decode";

const AuthService = {
  register: async (userData) => {
    const response = await api.post("/usuarios/salvar", userData);
    return response.data;
  },

  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);

      if (response.data.token) {
        // Salva o token no localStorage
        localStorage.setItem("token", response.data.token);
        // Opcional: já configura o header padrão também
        api.defaults.headers.common["Authorization"] =
          `Bearer ${response.data.token}`;
      }

      return response.data;
    } catch (error) {
      console.error("Erro no login:", error);
      throw error;
    }
  },

  logout: () => {
    // Limpa tudo relacionado ao usuário
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    localStorage.removeItem("userRole");
    localStorage.removeItem("email");
  },

  getCurrentUser: () => {
    const token = localStorage.getItem("token");
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
    if (!perfilData || typeof perfilData !== "object") {
      throw new Error("Dados do perfil inválidos.");
    }

    const token = localStorage.getItem("token");
    if (!token) throw new Error("Usuário não autenticado.");

    const payload = {
      nome: perfilData.nome ?? undefined,
      email: perfilData.email ?? undefined,
      senhaAtual: perfilData.senhaAtual ?? undefined,
      novaSenha: perfilData.novaSenha ?? undefined,
    };

    const response = await api.patch(
      `/usuarios/atualizar/${userId}`,
      payload,
      {
        headers: {
          // Authorization vem do interceptor
          "Content-Type": "application/json",
        },
      }
    );

    return response.data; // Pode conter { usuario, token }
  },

  // Atualiza apenas a foto
  updateFoto: async (userId, file) => {
    if (!userId) throw new Error("ID do usuário não informado.");
    if (!file) throw new Error("Arquivo de foto inválido.");

    const token = localStorage.getItem("token");
    if (!token) throw new Error("Usuário não autenticado.");

    const formData = new FormData();
    formData.append("file", file);

    const response = await api.patch(
      `/usuarios/${userId}/foto`,
      formData,
      {
        headers: {
          // Authorization vem do interceptor
          "Content-Type": "multipart/form-data",
        },
      }
    );

    return response.data; // Retorna o usuário atualizado
  },

  // Solicita um código de redefinição de senha
  solicitarCodigoRedefinicao: async (email) => {
    if (!email) throw new Error("E-mail é obrigatório");
    const response = await api.post("/auth/esqueci-senha", { email });
    return response.data;
  },

  // Redefine a senha usando o código recebido
  redefinirSenha: async (email, codigo, novaSenha) => {
    if (!email || !codigo || !novaSenha) {
      throw new Error("E-mail, código e nova senha são obrigatórios");
    }
    const response = await api.post("/auth/redefinir-senha", {
      email,
      codigo,
      novaSenha,
    });
    return response.data;
  },
};

export default AuthService;
