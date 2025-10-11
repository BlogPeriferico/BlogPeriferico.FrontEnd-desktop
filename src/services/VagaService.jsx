import api from "./Api";

const VagaService = {
  criarVaga: async (vagaData) => {
    console.log("📤 Criando vaga com dados:", vagaData);

    if (!(vagaData instanceof FormData) && vagaData?.id !== undefined) {
      delete vagaData.id;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Usuário não está logado.");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(vagaData instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
      },
    };

    try {
      const response = await api.post("/vagas", vagaData, config);
      console.log("✅ Vaga criada:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao criar vaga:", err.response?.data || err);
      throw err;
    }
  },

  listarVagas: async () => {
    console.log("📥 Carregando lista de vagas...");
    try {
      const response = await api.get("/vagas");
      console.log("✅ Lista de vagas recebida:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao listar vagas:", err.response?.data || err);
      throw err;
    }
  },

  buscarVagaPorId: async (id) => {
    console.log("🔍 Buscando vaga com ID:", id);
    try {
      const response = await api.get(`/vagas/${id}`);
      console.log("✅ Vaga recebida:", response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao buscar vaga ${id}:`, err.response?.data || err);
      throw err;
    }
  },

  atualizarVaga: async (id, vagaData) => {
    console.log(`✏️ Atualizando vaga ${id} com dados:`, vagaData);

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Usuário não está logado.");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(vagaData instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
      },
    };

    try {
      const response = await api.put(`/vagas/${id}`, vagaData, config);
      console.log(`✅ Vaga ${id} atualizada com sucesso:`, response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao atualizar vaga ${id}:`, err.response?.data || err);
      throw err;
    }
  },

  excluirVaga: async (id) => {
    console.log("🗑️ Excluindo vaga com ID:", id);

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Usuário não está logado.");
    }

    try {
      const response = await api.delete(`/vagas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`✅ Vaga ${id} excluída.`, response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao excluir vaga ${id}:`, err.response?.data || err);
      throw err;
    }
  },
};

export default VagaService;
