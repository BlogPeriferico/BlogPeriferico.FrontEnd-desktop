import api from "./Api";
import { jwtDecode } from "jwt-decode";

const TOKEN_KEY = "token";

/* ===== helpers de token ===== */
const getToken = () => {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

const setToken = (token) => {
  try {
    localStorage.setItem(TOKEN_KEY, token);
    // mantém por compatibilidade, mesmo com o interceptor cuidando disso
    api.defaults.headers.common.Authorization = `Bearer ${token}`;
  } catch (err) {
    console.error("Erro ao salvar token:", err);
  }
};

const clearToken = () => {
  try {
    localStorage.removeItem(TOKEN_KEY);
    delete api.defaults.headers.common.Authorization;
  } catch (err) {
    console.error("Erro ao limpar token:", err);
  }
};

const AuthService = {
  // Cadastro
  register: async (userData) => {
    const response = await api.post("/usuarios/salvar", userData);
    return response.data;
  },

  // Login
  login: async (credentials) => {
    try {
      const response = await api.post("/auth/login", credentials);
      const data = response.data;

      if (data?.token) {
        setToken(data.token);
      }

      return data;
    } catch (error) {
      console.error("Erro no login:", error?.response?.data || error);
      throw error;
    }
  },

  // Logout
  logout: () => {
    clearToken();
  },

  // Usuário atual (decodificado do JWT)
  getCurrentUser: () => {
    const token = getToken();
    if (!token) return null;

    try {
      return jwtDecode(token);
    } catch (err) {
      console.warn("Token inválido, limpando sessão.", err);
      clearToken();
      return null;
    }
  },

  // Atualiza nome / email / senha
  updatePerfil: async (userId, perfilData) => {
    if (!userId) throw new Error("ID do usuário não informado.");
    if (!perfilData || typeof perfilData !== "object") {
      throw new Error("Dados do perfil inválidos.");
    }

    const token = getToken();
    if (!token) throw new Error("Usuário não autenticado.");

    // monta payload só com campos enviados
    const payload = {
      ...(perfilData.nome !== undefined && { nome: perfilData.nome }),
      ...(perfilData.email !== undefined && { email: perfilData.email }),
      ...(perfilData.senhaAtual !== undefined && {
        senhaAtual: perfilData.senhaAtual,
      }),
      ...(perfilData.novaSenha !== undefined && {
        novaSenha: perfilData.novaSenha,
      }),
    };

    const response = await api.patch(`/usuarios/atualizar/${userId}`, payload, {
      headers: {
        Authorization: `Bearer ${token}`, // redundante, mas seguro
        "Content-Type": "application/json",
      },
    });

    // se o back devolver token novo, já atualiza
    if (response.data?.token) {
      setToken(response.data.token);
    }

    return response.data; // ex: { usuario, token }
  },

  // Atualiza apenas a foto
  updateFoto: async (userId, file) => {
    if (!userId) throw new Error("ID do usuário não informado.");
    if (!file) throw new Error("Arquivo de foto inválido.");

    const token = getToken();
    if (!token) throw new Error("Usuário não autenticado.");

    const formData = new FormData();
    formData.append("file", file);

    const response = await api.patch(`/usuarios/${userId}/foto`, formData, {
      headers: {
        Authorization: `Bearer ${token}`, // redundante, mas compatível
        "Content-Type": "multipart/form-data",
      },
    });

    return response.data; // usuário atualizado
  },

  // Solicita um código de redefinição de senha
  solicitarCodigoRedefinicao: async (email) => {
    if (!email) throw new Error("E-mail é obrigatório.");
    const response = await api.post("/auth/esqueci-senha", { email });
    return response.data;
  },

  // Redefine a senha usando o código recebido
  redefinirSenha: async (email, codigo, novaSenha) => {
    if (!email || !codigo || !novaSenha) {
      throw new Error("E-mail, código e nova senha são obrigatórios.");
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
