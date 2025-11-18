import api from "./Api";

const AnuncioService = {
  // Criar novo anúncio
  criarAnuncio: async (anuncioData) => {
    // Remove id caso seja um objeto normal
    if (!(anuncioData instanceof FormData) && anuncioData.id !== undefined) {
      delete anuncioData.id;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("⚠️ Usuário não está logado.");
      throw new Error("Usuário não está logado. Faça login novamente.");
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
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao criar anúncio:", err.response?.data || err);
      throw err;
    }
  },

  // Listar todos os anúncios
  getAnuncios: async () => {
    try {
      const response = await api.get("/vendas");
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao listar anúncios:", err.response?.data || err);
      throw err;
    }
  },

  // Buscar anúncio por ID
  buscarAnuncioPorId: async (id) => {
    try {
      const response = await api.get(`/vendas/${id}`);
      return response.data;
    } catch (err) {
      console.error(
        `❌ Erro ao buscar anúncio ${id}:`,
        err.response?.data || err
      );
      throw err;
    }
  },

  // Atualizar anúncio
  atualizarAnuncio: async (id, anuncioData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("⚠️ Usuário não está logado.");
      throw new Error("Usuário não está logado. Faça login novamente.");
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
      return response.data;
    } catch (err) {
      console.error(
        `❌ Erro ao atualizar anúncio ${id}:`,
        err.response?.data || err
      );
      throw err;
    }
  },

  // Excluir anúncio
  excluirAnuncio: async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ Nenhum token encontrado no localStorage");
      throw new Error("Usuário não está logado. Faça login novamente.");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await api.delete(`/vendas/${id}`, config);
      return response.data;
    } catch (err) {
      // Melhora a mensagem de erro para o usuário
      if (err.response?.status === 403) {
        throw new Error("Você não tem permissão para excluir este anúncio.");
      } else if (err.response?.status === 404) {
        throw new Error("Anúncio não encontrado ou já foi excluído.");
      }
      throw err;
    }
  },
};

export default AnuncioService;
