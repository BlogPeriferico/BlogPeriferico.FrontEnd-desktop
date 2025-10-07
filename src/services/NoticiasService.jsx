import api from "./Api";

const NoticiaService = {
  criarNoticia: async (noticiaData) => {
    console.log("📤 Criando notícia com dados:", noticiaData);

    // 🔥 Garante que nenhum id vai junto
    if (!(noticiaData instanceof FormData) && noticiaData?.id !== undefined) {
      delete noticiaData.id;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Usuário não está logado.");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        // ❌ não define Content-Type se for FormData
        ...(noticiaData instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
      },
    };

    try {
      const response = await api.post("/noticias", noticiaData, config);
      console.log("✅ Notícia criada:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao criar notícia:", err.response?.data || err);
      throw err;
    }
  },

  atualizarNoticia: async (id, noticiaData) => {
    console.log(`✏️ Atualizando notícia ${id} com dados:`, noticiaData);

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Usuário não está logado.");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(noticiaData instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
      },
    };

    try {
      const response = await api.put(`/noticias/${id}`, noticiaData, config);
      console.log(`✅ Notícia ${id} atualizada com sucesso:`, response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao atualizar notícia ${id}:`, err.response?.data || err);
      throw err;
    }
  },

  listarNoticias: async () => {
    console.log("📥 Carregando lista de notícias...");
    try {
      const response = await api.get("/noticias");
      console.log("✅ Lista de notícias recebida:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao listar notícias:", err.response?.data || err);
      throw err;
    }
  },

  buscarNoticiaPorId: async (id) => {
    console.log("🔍 Buscando notícia com ID:", id);
    try {
      const response = await api.get(`/noticias/${id}`);
      console.log("✅ Notícia recebida:", response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao buscar notícia ${id}:`, err.response?.data || err);
      throw err;
    }
  },

  excluirNoticia: async (id) => {
    console.log("🗑️ Excluindo notícia com ID:", id);

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Usuário não está logado.");
    }

    console.log("🔑 Token sendo enviado:", token.substring(0, 50) + "...");

    try {
      const response = await api.delete(`/noticias/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`✅ Notícia ${id} excluída.`, response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao excluir notícia ${id}:`, err.response?.data || err);
      console.error(`❌ Status HTTP:`, err.response?.status);
      console.error(`❌ Headers da resposta:`, err.response?.headers);
      throw err;
    }
  },
};

export default NoticiaService;
