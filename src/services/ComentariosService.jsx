import api from "./Api";

const ComentariosService = {
  criarComentario: async (comentarioData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Usuário não está logado. Faça login novamente.");
    }

    try {
      const response = await api.post("/comentarios", comentarioData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
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
      console.error("❌ Erro ao listar comentários:", err.response?.data || err);
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

  criarComentarioDoacao: async (comentarioData) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Usuário não está logado. Faça login novamente.");

    try {
      const response = await api.post("/comentarios", comentarioData);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao criar comentário na doação:", err.response?.data || err);
      throw err;
    }
  },

  criarComentarioVaga: async (comentarioData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Usuário não está logado. Faça login novamente.");
    }

    try {
      const response = await api.post("/comentarios", comentarioData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
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
      throw new Error("Usuário não está logado. Faça login novamente.");
    }

    try {
      const response = await api.delete(`/comentarios/${idComentario}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao excluir comentário ${idComentario}:`, err.response?.data || err);
      console.error(`❌ Status HTTP:`, err.response?.status);
      throw err;
    }
  },
};

export default ComentariosService;
