import api from "./Api";

const NoticiaService = {
  // Criar nova notícia
  criarNoticia: async (noticiaData) => {
    // Garante que nenhum id vai junto em criação
    if (!(noticiaData instanceof FormData) && noticiaData?.id !== undefined) {
      delete noticiaData.id;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      const error = new Error("Usuário não está logado. Faça login novamente.");
      error.status = 401;
      throw error;
    }

    // Configuração de headers (Authorization vem do interceptor)
    const config = {
      headers: {},
    };

    if (!(noticiaData instanceof FormData)) {
      config.headers["Content-Type"] = "application/json";
    }

    try {
      const response = await api.post("/noticias", noticiaData, config);
      return response.data;
    } catch (err) {
      const status = err.response?.status;
      console.error("❌ Erro ao criar notícia:", {
        status,
        data: err.response?.data,
        message: err.message,
      });

      if (status === 401) {
        const error = new Error("Sessão expirada. Faça login novamente.");
        error.status = 401;
        throw error;
      }

      if (status === 403) {
        const error = new Error("Você não tem permissão para criar notícias.");
        error.status = 403;
        throw error;
      }

      const error = new Error(
        err.response?.data?.message ||
          "Erro ao criar notícia. Tente novamente."
      );
      error.status = status;
      throw error;
    }
  },

  // Atualizar notícia
  atualizarNoticia: async (id, noticiaData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      const error = new Error("Usuário não está logado.");
      error.status = 401;
      throw error;
    }

    const config = {
      headers: {
        // Authorization vem do interceptor
        ...(noticiaData instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
      },
    };

    try {
      const response = await api.put(`/noticias/${id}`, noticiaData, config);
      return response.data;
    } catch (err) {
      const status = err.response?.status;
      console.error(
        `❌ Erro ao atualizar notícia ${id}:`,
        err.response?.data || err
      );

      if (status === 401) {
        const error = new Error("Sessão expirada. Faça login novamente.");
        error.status = 401;
        throw error;
      }

      if (status === 403) {
        const error = new Error("Você não tem permissão para atualizar esta notícia.");
        error.status = 403;
        throw error;
      }

      if (status === 404) {
        const error = new Error("Notícia não encontrada.");
        error.status = 404;
        throw error;
      }

      throw err;
    }
  },

  // Listar notícias (com filtro opcional por região)
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

  // Buscar notícia por ID
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

  // Excluir notícia
  excluirNoticia: async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      const error = new Error("Usuário não está logado.");
      error.status = 401;
      throw error;
    }

    try {
      const response = await api.delete(`/noticias/${id}`);
      return response.data;
    } catch (err) {
      const status = err.response?.status;
      console.error(
        `❌ Erro ao excluir notícia ${id}:`,
        err.response?.data || err
      );
      console.error(`❌ Status HTTP:`, status);

      if (status === 401) {
        const error = new Error("Sessão expirada. Faça login novamente.");
        error.status = 401;
        throw error;
      }

      if (status === 403) {
        const error = new Error(
          "Você não tem permissão para excluir esta notícia."
        );
        error.status = 403;
        error.response = err.response;
        throw error;
      }

      if (status === 404) {
        const error = new Error(
          "Notícia não encontrada ou já foi excluída."
        );
        error.status = 404;
        error.response = err.response;
        throw error;
      }

      throw err;
    }
  },
};

export default NoticiaService;
