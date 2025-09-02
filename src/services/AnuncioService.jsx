import api from "./Api";

const AnuncioService = {
  // Criar novo anúncio
  criarAnuncio: async (anuncioData) => {
    console.log("📤 Criando anúncio com dados (antes de limpar):", anuncioData);

    // Remove id caso seja um objeto normal
    if (!(anuncioData instanceof FormData) && anuncioData.id !== undefined) {
      delete anuncioData.id;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("⚠️ Usuário não está logado.");
      throw new Error("Usuário não está logado.");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type":
          anuncioData instanceof FormData
            ? "multipart/form-data"
            : "application/json",
      },
    };

    try {
      const response = await api.post("/vendas", anuncioData, config);
      console.log("✅ Resposta do backend ao criar anúncio:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao criar anúncio:", err.response?.data || err);
      throw err;
    }
  },

  // Listar todos os anúncios
  getAnuncios: async () => {
    console.log("📥 Carregando lista de anúncios...");
    try {
      const response = await api.get("/vendas");
      console.log("✅ Lista de anúncios recebida:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao listar anúncios:", err.response?.data || err);
      throw err;
    }
  },

  // Buscar anúncio por ID
  buscarAnuncioPorId: async (id) => {
    console.log("🔍 Buscando anúncio com ID:", id);
    try {
      const response = await api.get(`/vendas/${id}`);
      console.log("✅ Anúncio recebido:", response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao buscar anúncio ${id}:`, err.response?.data || err);
      throw err;
    }
  },

  // Atualizar anúncio
  atualizarAnuncio: async (id, anuncioData) => {
    console.log(`✏️ Atualizando anúncio ${id} com dados:`, anuncioData);

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("⚠️ Usuário não está logado.");
      throw new Error("Usuário não está logado.");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type":
          anuncioData instanceof FormData
            ? "multipart/form-data"
            : "application/json",
      },
    };

    try {
      const response = await api.put(`/vendas/${id}`, anuncioData, config);
      console.log(`✅ Anúncio ${id} atualizado com sucesso:`, response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao atualizar anúncio ${id}:`, err.response?.data || err);
      throw err;
    }
  },

  // Excluir anúncio
  excluirAnuncio: async (id) => {
    console.log("🗑️ Excluindo anúncio com ID:", id);

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("⚠️ Usuário não está logado.");
      throw new Error("Usuário não está logado.");
    }

    try {
      const response = await api.delete(`/vendas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`✅ Anúncio ${id} excluído com sucesso.`, response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao excluir anúncio ${id}:`, err.response?.data || err);
      throw err;
    }
  },
};

export default AnuncioService;
