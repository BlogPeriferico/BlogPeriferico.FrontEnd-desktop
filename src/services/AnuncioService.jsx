import api from "./Api";

// Helper para pegar token e montar config de headers
const getTokenOrThrow = () => {
  const token = localStorage.getItem("token");
  if (!token) {
    console.error("⚠️ Usuário não está logado.");
    throw new Error("Usuário não está logado. Faça login novamente.");
  }
  return token;
};

const buildAuthConfig = ({
  isFormData = false,
  withContentType = true,
} = {}) => {
  const token = getTokenOrThrow();

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (withContentType) {
    headers["Content-Type"] = isFormData
      ? "multipart/form-data"
      : "application/json";
  }

  return { headers };
};

const AnuncioService = {
  // Criar novo anúncio
  criarAnuncio: async (anuncioData) => {
    // Garante que não mandamos id no corpo em requisições "normais"
    let payload = anuncioData;

    if (
      !(anuncioData instanceof FormData) &&
      anuncioData &&
      typeof anuncioData === "object" &&
      "id" in anuncioData
    ) {
      const { id: _ignoredId, ...rest } = anuncioData;
      payload = rest;
    }

    const isFormData = payload instanceof FormData;
    const config = buildAuthConfig({ isFormData });

    try {
      const response = await api.post("/vendas", payload, config);
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
    const isFormData = anuncioData instanceof FormData;
    const config = buildAuthConfig({ isFormData });

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
    const token = getTokenOrThrow();

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
      console.error(
        `❌ Erro ao excluir anúncio ${id}:`,
        err.response?.data || err
      );
      throw err;
    }
  },
};

export default AnuncioService;
