import api from "./Api";

const ComentariosService = {
  criarComentario: async (comentarioData) => {
    console.log("📤 Criando comentário:", comentarioData);

    // Usando a mesma lógica do UserContext para buscar o token
    const token = localStorage.getItem("userToken") || localStorage.getItem("token");
    if (!token) {
      console.error("❌ Nenhum token encontrado no localStorage");
      throw new Error("Usuário não está logado.");
    }

    console.log("🔑 Token sendo usado:", token.substring(0, 10) + "...");

    try {
      const response = await api.post("/comentarios", comentarioData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("✅ Comentário criado:", response.data);
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

  criarComentarioDoacao: async (comentarioData) => {
    console.log("📤 Criando comentário na doação:", comentarioData);

    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("Usuário não está logado.");

    try {
      const response = await api.post("/comentarios", comentarioData);
      console.log("✅ Comentário criado na doação:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao criar comentário na doação:", err.response?.data || err);
      throw err;
    }
  },

  criarComentarioVaga: async (comentarioData) => {
    console.log("📤 Criando comentário na vaga:", comentarioData);

    // Usando a mesma lógica do UserContext para buscar o token
    const token = localStorage.getItem("userToken") || localStorage.getItem("token");
    if (!token) {
      console.error("❌ Nenhum token encontrado no localStorage");
      throw new Error("Usuário não está logado.");
    }

    console.log("🔑 Token sendo usado:", token.substring(0, 10) + "...");

    try {
      const response = await api.post("/comentarios", comentarioData, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      console.log("✅ Comentário criado na vaga:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao criar comentário na vaga:", err.response?.data || err);
      console.error("❌ Status HTTP:", err.response?.status);
      throw err;
    }
  },

  excluirComentario: async (idComentario) => {
    console.log("🗑️ Excluindo comentário com ID:", idComentario);
    
    // Usando a mesma lógica do UserContext para buscar o token
    const token = localStorage.getItem("userToken") || localStorage.getItem("token");
    if (!token) {
      console.error("❌ Nenhum token encontrado no localStorage");
      throw new Error("Usuário não está logado.");
    }

    console.log("🔑 Token sendo usado:", token.substring(0, 10) + "...");

    try {
      const response = await api.delete(`/comentarios/${idComentario}`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      console.log(`✅ Comentário ${idComentario} excluído.`, response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao excluir comentário ${idComentario}:`, err.response?.data || err);
      console.error(`❌ Status HTTP:`, err.response?.status);
      throw err;
    }
  },
};

export default ComentariosService;
