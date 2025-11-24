import api from "./Api";

const VagaService = {
  criarVaga: async (vagaData) => {
    // Remove id quando vier em objeto normal
    if (!(vagaData instanceof FormData) && vagaData?.id !== undefined) {
      delete vagaData.id;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      const error = new Error("Usuário não está logado.");
      error.status = 401;
      throw error;
    }

    const config = {
      headers: {
        // Authorization vem do interceptor
        ...(vagaData instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
      },
    };

    try {
      const response = await api.post("/vagas", vagaData, config);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao criar vaga:", err.response?.data || err);
      throw err;
    }
  },

  listarVagas: async () => {
    try {
      const response = await api.get("/vagas");
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao listar vagas:", err.response?.data || err);
      throw err;
    }
  },

  buscarVagaPorId: async (id) => {
    try {
      const response = await api.get(`/vagas/${id}`);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao buscar vaga ${id}:`, err.response?.data || err);
      throw err;
    }
  },

  atualizarVaga: async (id, vagaData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      const error = new Error("Usuário não está logado.");
      error.status = 401;
      throw error;
    }

    const config = {
      headers: {
        // Authorization vem do interceptor
        ...(vagaData instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
      },
    };

    try {
      const response = await api.put(`/vagas/${id}`, vagaData, config);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao atualizar vaga ${id}:`, err.response?.data || err);
      throw err;
    }
  },

  excluirVaga: async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      const error = new Error("Usuário não está logado.");
      error.status = 401;
      throw error;
    }

    try {
      const response = await api.delete(`/vagas/${id}`);
      return response.data;
    } catch (err) {
      const status = err.response?.status;
      console.error(`❌ Erro ao excluir vaga ${id}:`, err.response?.data || err);

      if (status === 403) {
        const error = new Error("Você não tem permissão para excluir esta vaga.");
        error.status = 403;
        error.response = err.response;
        throw error;
      }

      if (status === 404) {
        const error = new Error("Vaga não encontrada ou já foi excluída.");
        error.status = 404;
        error.response = err.response;
        throw error;
      }

      throw err;
    }
  },
};

export default VagaService;
