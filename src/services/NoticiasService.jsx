import api from "./Api";

const TOKEN_KEY = "token";

/** Pega o token ou lança erro amigável */
const getTokenOrThrow = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    throw new Error("Usuário não está logado. Faça login novamente.");
  }
  return token;
};

/** Monta headers com Authorization e, opcionalmente, Content-Type */
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

const NoticiaService = {
  criarNoticia: async (noticiaData) => {
    // Garante que nenhum id vai junto sem mutar o objeto original
    let payload = noticiaData;

    if (
      !(noticiaData instanceof FormData) &&
      noticiaData &&
      typeof noticiaData === "object" &&
      "id" in noticiaData
    ) {
      const { id: _ignoredId, ...rest } = noticiaData;
      payload = rest;
    }

    const isFormData = payload instanceof FormData;
    const config = buildAuthConfig({ isFormData });

    try {
      const response = await api.post("/noticias", payload, config);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao criar notícia:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message,
      });

      const status = err.response?.status;

      if (status === 401 || status === 403) {
        // Mantém mensagem amigável de sessão/permissão
        throw new Error(
          "Sessão expirada ou sem permissão. Faça login novamente."
        );
      }

      const errorMessage =
        err.response?.data?.message ||
        "Erro ao criar notícia. Tente novamente.";
      throw new Error(errorMessage);
    }
  },

  atualizarNoticia: async (id, noticiaData) => {
    const isFormData = noticiaData instanceof FormData;
    const config = buildAuthConfig({ isFormData });

    try {
      const response = await api.put(`/noticias/${id}`, noticiaData, config);
      return response.data;
    } catch (err) {
      console.error(
        `❌ Erro ao atualizar notícia ${id}:`,
        err.response?.data || err
      );
      throw err;
    }
  },

  listarNoticias: async (regiao) => {
    try {
      const params = {};
      if (regiao) {
        params.regiao = regiao;
      }

      const response = await api.get("/noticias", { params });
      return response.data || [];
    } catch (err) {
      console.error("❌ Erro ao buscar notícias:", err.response?.data || err);
      // Se der erro, retorna array vazio para não quebrar a interface
      return [];
    }
  },

  buscarNoticiaPorId: async (id) => {
    try {
      const response = await api.get(`/noticias/${id}`);
      return response.data;
    } catch (err) {
      console.error(
        `❌ Erro ao buscar notícia ${id}:`,
        err.response?.data || err
      );
      throw err;
    }
  },

  excluirNoticia: async (id) => {
    const config = buildAuthConfig({ withContentType: false });

    try {
      const response = await api.delete(`/noticias/${id}`, config);
      return response.data;
    } catch (err) {
      console.error(
        `❌ Erro ao excluir notícia ${id}:`,
        err.response?.data || err
      );
      console.error("❌ Status HTTP:", err.response?.status);
      console.error("❌ Headers da resposta:", err.response?.headers);
      throw err;
    }
  },
};

export default NoticiaService;
