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
        api.defaults.headers.common[
          "Authorization"
        ] = `Bearer ${response.data.token}`;
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

  // Atualiza apenas campos como nome, email, biografia e senha
  updatePerfil: async (userId, perfilData) => {
    if (!userId) throw new Error("ID do usuário não informado.");
    if (!perfilData || typeof perfilData !== "object") {
      throw new Error("Dados do perfil inválidos.");
    }

    const token = localStorage.getItem("token");
    if (!token) throw new Error("Usuário não autenticado.");

    // Verifica se precisa buscar os dados atuais do usuário
    const precisaBuscarDadosAtuais = 
      (perfilData.biografia !== undefined && perfilData.nome === undefined && perfilData.email === undefined) || // Apenas biografia
      (perfilData.novaSenha !== undefined && perfilData.nome === undefined && perfilData.email === undefined); // Apenas senha
    
    if (precisaBuscarDadosAtuais) {
      try {
        // Busca os dados atuais do usuário
        const currentUser = await api.get(`/usuarios/listar/${userId}`);
        
        // Cria o payload com os dados atuais + os campos que estão sendo atualizados
        const payload = {
          nome: currentUser.data.nome,
          email: currentUser.data.email
        };
        
        // Adiciona os campos que estão sendo atualizados
        if (perfilData.biografia !== undefined) payload.biografia = perfilData.biografia;
        if (perfilData.senhaAtual !== undefined) payload.senhaAtual = perfilData.senhaAtual;
        if (perfilData.novaSenha !== undefined) payload.novaSenha = perfilData.novaSenha;
        
        console.log('Enviando payload para atualização:', payload);
        const response = await api.patch(`/usuarios/atualizar/${userId}`, payload, {
          headers: {
            "Content-Type": "application/json",
          },
        });
        
        return response.data;
        
      } catch (error) {
        console.error('Erro ao buscar/atualizar dados do usuário:', error);
        throw error;
      }
    }

    // Para outros casos, mantém o comportamento original
    const payload = {};
    
    // Adiciona apenas os campos que têm valor
    if (perfilData.nome !== undefined) payload.nome = perfilData.nome;
    if (perfilData.email !== undefined) payload.email = perfilData.email;
    if (perfilData.biografia !== undefined) payload.biografia = perfilData.biografia;
    if (perfilData.senhaAtual !== undefined) payload.senhaAtual = perfilData.senhaAtual;
    if (perfilData.novaSenha !== undefined) payload.novaSenha = perfilData.novaSenha;

    console.log('Enviando payload para atualização:', payload); // Log para depuração

    try {
      const response = await api.patch(`/usuarios/atualizar/${userId}`, payload, {
        headers: {
          "Content-Type": "application/json",
        },
      });

      console.log('Resposta da API:', response.data); // Log para depuração
      return response.data; // Pode conter { usuario, token }
    } catch (error) {
      console.error('Erro ao atualizar perfil:', error.response?.data || error.message);
      throw error;
    }
  },

  // Atualiza apenas a foto
  updateFoto: async (userId, file) => {
    if (!userId) throw new Error("ID do usuário não informado.");
    if (!file) throw new Error("Arquivo de foto inválido.");

    const token = localStorage.getItem("token");
    if (!token) throw new Error("Usuário não autenticado.");

    const formData = new FormData();
    formData.append("file", file);

    const response = await api.patch(`/usuarios/${userId}/foto`, formData, {
      headers: {
        // Authorization vem do interceptor
        "Content-Type": "multipart/form-data",
      },
    });

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

  // Exclui a conta do usuário atual
  deleteAccount: async (senhaAtual) => {
    try {
      const response = await api.delete("/usuarios/deletar/minha-conta", {
        params: { senhaAtual },
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      // Limpa todos os dados locais de autenticação
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      localStorage.removeItem("userRole");
      localStorage.removeItem("email");
      
      // Remove o token do cabeçalho das requisições
      delete api.defaults.headers.common['Authorization'];
      
      // Limpa qualquer cache do axios
      if (api.defaults.headers.common['Cache-Control']) {
        delete api.defaults.headers.common['Cache-Control'];
      }
      if (api.defaults.headers.common['Pragma']) {
        delete api.defaults.headers.common['Pragma'];
      }
      
      // Limpa qualquer sessão ativa
      if (typeof window !== 'undefined') {
        sessionStorage.clear();
      }
      
      return response.data;
    } catch (error) {
      console.error('Erro ao deletar conta:', error);
      throw error;
    }
  },
};

export default AuthService;
