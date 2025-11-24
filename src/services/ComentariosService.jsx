import api from "./Api";

const ComentariosService = {
  // Criar comentário genérico (VENDA / NOTÍCIA / DOAÇÃO / VAGA via DTO)
  criarComentario: async (comentarioData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      const error = new Error("Usuário não está logado. Faça login novamente.");
      error.status = 401;
      throw error;
    }

    try {
      const response = await api.post("/comentarios", comentarioData);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao criar comentário:", err.response?.data || err);
      console.error("❌ Status HTTP:", err.response?.status);
      throw err;
    }
  },

  listarComentariosNoticia: async (idNoticia) => {
    try {
      const response = await api.get(`/comentarios/noticia/${idNoticia}`);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao listar comentários da notícia:", err.response?.data || err);
      throw err;
    }
  },

  listarComentariosProduto: async (idProduto) => {
    try {
      const response = await api.get(`/comentarios/venda/${idProduto}`);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao listar comentários do produto:", err.response?.data || err);
      throw err;
    }
  },

  listarComentariosDoacao: async (idDoacao) => {
    try {
      const response = await api.get(`/comentarios/doacao/${idDoacao}`);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao listar comentários da doação:", err.response?.data || err);
      throw err;
    }
  },

  listarComentariosVaga: async (idVaga) => {
    try {
      const response = await api.get(`/comentarios/vaga/${idVaga}`);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao listar comentários da vaga:", err.response?.data || err);
      throw err;
    }
  },

  // Versão específica pra doação (você já usa em algumas telas)
  criarComentarioDoacao: async (comentarioData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      const error = new Error("Usuário não está logado. Faça login novamente.");
      error.status = 401;
      throw error;
    }

    try {
      const response = await api.post("/comentarios", comentarioData);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao criar comentário na doação:", err.response?.data || err);
      throw err;
    }
  },

  // Versão específica pra vaga (usada em VagaInfo)
  criarComentarioVaga: async (comentarioData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      const error = new Error("Usuário não está logado. Faça login novamente.");
      error.status = 401;
      throw error;
    }

    try {
      const response = await api.post("/comentarios", comentarioData);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao criar comentário na vaga:", err.response?.data || err);
      console.error("❌ Status HTTP:", err.response?.status);
      throw err;
    }
  },

  excluirComentario: async (idComentario) => {
    const token = localStorage.getItem("token");
    if (!token) {
      const error = new Error("Usuário não está logado. Faça login novamente.");
      error.status = 401;
      throw error;
    }

    try {
      const response = await api.delete(`/comentarios/${idComentario}`);
      return response.data;
    } catch (err) {
      const status = err.response?.status;
      console.error(`❌ Erro ao excluir comentário ${idComentario}:`, err.response?.data || err);
      console.error("❌ Status HTTP:", status);

      if (status === 403) {
        const error = new Error("Você não tem permissão para excluir este comentário.");
        error.status = 403;
        error.response = err.response;
        throw error;
      }

      if (status === 404) {
        const error = new Error("Comentário não encontrado ou já foi excluído.");
        error.status = 404;
        error.response = err.response;
        throw error;
      }

      throw err;
    }
  },
};

export default ComentariosService;
