import api from "./Api";

const CorreCertoService = {
  // Criar vaga
  criarCorrecerto: async (vagaData) => {
    // Remove id se existir
    if (!(vagaData instanceof FormData) && vagaData.id !== undefined) {
      delete vagaData.id;
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
        // Authorization vem do interceptor (Api.js)
        "Content-Type": vagaData instanceof FormData
          ? "multipart/form-data"
          : "application/json",
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

  // Listar todas as vagas
  listarCorrecertos: async () => {
    try {
      const response = await api.get("/vagas");
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao listar vagas:", err.response?.data || err);
      throw err;
    }
  },

  // Buscar vaga por ID
  buscarCorrecertoPorId: async (id) => {
    try {
      const response = await api.get(`/vagas/${id}`);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao buscar vaga ${id}:`, err.response?.data || err);
      throw err;
    }
  },

  // Atualizar vaga
  atualizarCorrecerto: async (id, vagaData) => {
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
        "Content-Type": vagaData instanceof FormData
          ? "multipart/form-data"
          : "application/json",
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

  // Excluir vaga
  excluirVaga: async (id) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ Nenhum token encontrado no localStorage");
      const error = new Error("Usuário não está logado. Faça login novamente.");
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

export default CorreCertoService;
