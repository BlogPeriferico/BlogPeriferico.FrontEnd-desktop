import api from "./Api";
import { jwtDecode } from "jwt-decode";

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

  updatePerfil: async (perfilData) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Token não encontrado. Faça login novamente.");
      }

      // Decodificar token para obter identificador
      const decoded = jwtDecode(token);
      console.log("Payload do token decodificado:", decoded); // Debug: veja o payload exato

      // 'sub' é o identificador principal (pode ser email ou ID)
      let userId = decoded.sub;
      if (typeof userId === 'string' && userId.includes('@')) {
        // Se 'sub' for email, buscar ID via API
        const response = await api.get("/usuarios/listar");
        const usuarios = response.data;
        const usuarioEncontrado = usuarios.find((u) => u.email === userId);
        userId = usuarioEncontrado ? usuarioEncontrado.id : null;
      } else if (typeof userId === 'number') {
        // Se 'sub' for número, usar diretamente
        userId = userId;
      } else {
        throw new Error("Identificador do usuário inválido no token.");
      }

      if (!userId || isNaN(userId)) {
        console.error("ID inválido no token:", decoded);
        throw new Error("ID do usuário não encontrado ou inválido no token. Verifique o payload do JWT.");
      }

      console.log("ID do usuário obtido:", userId); // Debug

      // Se houver foto, envie separadamente primeiro
      if (perfilData.fotoPerfil) {
        const fotoFormData = new FormData();
        fotoFormData.append("file", perfilData.fotoPerfil);
        await api.patch(`/usuarios/${userId}/foto`, fotoFormData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        console.log("Foto atualizada com sucesso");
      }

      // Preparar dados para atualização
      const updateData = {
        nome: perfilData.dto.nome,
        email: perfilData.dto.email,
      };

      // Só inclua senha se foi fornecida
      if (perfilData.dto.senha && perfilData.dto.senha.trim()) {
        updateData.senha = perfilData.dto.senha;
      }

      // Atualize os dados usando o endpoint correto
      const response = await api.patch(`/usuarios/atualizar/${userId}`, updateData, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log("Dados atualizados com sucesso");
      return response.data;
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      throw err;
    }
  },
};

export default AuthService;
