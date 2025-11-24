import api from "./Api";

const DoacaoService = {
  criarDoacao: async (doacaoData) => {
    // Remove id se vier em objeto normal
    if (!(doacaoData instanceof FormData) && doacaoData.id !== undefined) {
      delete doacaoData.id;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("⚠️ Usuário não está logado.");
      const error = new Error("Usuário não está logado. Faça login novamente.");
      error.status = 401;
      throw error;
    }

    const config = {
      headers: {
        // Authorization vem do interceptor
        "Content-Type": doacaoData instanceof FormData
          ? "multipart/form-data"
          : "application/json",
      },
    };

    try {
      const response = await api.post("/doacoes", doacaoData, config);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao criar doação:", err.response?.data || err);
      throw err;
    }
  },

  listarDoacoes: async () => {
    try {
      const response = await api.get("/doacoes");
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao listar doações:", err.response?.data || err);
      throw err;
    }
  },

  buscarDoacaoPorId: async (id) => {
    try {
      const response = await api.get(`/doacoes/${id}`);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao buscar doação ${id}:`, err.response?.data || err);
      throw err;
    }
  },

  atualizarDoacao: async (id, doacaoData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("⚠️ Usuário não está logado.");
      const error = new Error("Usuário não está logado. Faça login novamente.");
      error.status = 401;
      throw error;
    }

    const config = {
      headers: {
        // Authorization vem do interceptor
        "Content-Type": doacaoData instanceof FormData
          ? "multipart/form-data"
          : "application/json",
      },
    };

    try {
      const response = await api.put(`/doacoes/${id}`, doacaoData, config);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao atualizar doação ${id}:`, err.response?.data || err);
      throw err;
    }
  },

  excluirDoacao: async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ Nenhum token encontrado no localStorage");
      const error = new Error("Usuário não está logado. Faça login novamente.");
      error.status = 401;
      throw error;
    }

    try {
      const response = await api.delete(`/doacoes/${id}`);
      return response.data;
    } catch (err) {
      const status = err.response?.status;
      console.error(`❌ Erro ao excluir doação ${id}:`, err.response?.data || err);

      if (status === 403) {
        const error = new Error("Você não tem permissão para excluir esta doação.");
        error.status = 403;
        error.response = err.response;
        throw error;
      }

      if (status === 404) {
        const error = new Error("Doação não encontrada ou já foi excluída.");
        error.status = 404;
        error.response = err.response;
        throw error;
      }

      throw err;
    }
  },
};

export default DoacaoService;
