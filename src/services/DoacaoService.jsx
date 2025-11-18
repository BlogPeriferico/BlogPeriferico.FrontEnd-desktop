import api from "./Api";

const DoacaoService = {
  criarDoacao: async (doacaoData) => {
    // Se for um objeto normal, removemos o campo id antes de enviar
    if (!(doacaoData instanceof FormData) && doacaoData.id !== undefined) {
      delete doacaoData.id;
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
          doacaoData instanceof FormData
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
      console.error(
        `❌ Erro ao buscar doação ${id}:`,
        err.response?.data || err
      );
      throw err;
    }
  },

  atualizarDoacao: async (id, doacaoData) => {
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("⚠️ Usuário não está logado.");
      throw new Error("Usuário não está logado.");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type":
          doacaoData instanceof FormData
            ? "multipart/form-data"
            : "application/json",
      },
    };

    try {
      const response = await api.put(`/doacoes/${id}`, doacaoData, config);
      return response.data;
    } catch (err) {
      console.error(
        `❌ Erro ao atualizar doação ${id}:`,
        err.response?.data || err
      );
      throw err;
    }
  },

  excluirDoacao: async (id) => {
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
      const response = await api.delete(`/doacoes/${id}`, config);
      return response.data;
    } catch (err) {
      console.error(
        `❌ Erro ao excluir doação ${id}:`,
        err.response?.data || err
      );
      throw err;
    }
  },
};

export default DoacaoService;
