import api from "./Api";

const CorreCertoService = {
  // Criar vaga
  criarCorrecerto: async (vagaData) => {
    console.log("📤 Criando vaga com dados:", vagaData);

    // Remove id se existir
    if (vagaData.id !== undefined) {
      delete vagaData.id;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("⚠️ Usuário não está logado.");
      throw new Error("Usuário não está logado. Faça login novamente.");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": vagaData instanceof FormData ? "multipart/form-data" : "application/json",
      },
    };

    try {
      const response = await api.post("/vagas", vagaData, config);
      console.log("✅ Vaga criada com sucesso:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao criar vaga:", err.response?.data || err);
      throw err;
    }
  },

  // Listar todas as vagas
  listarCorrecertos: async () => {
    console.log("📥 Carregando lista de vagas...");
    try {
      const response = await api.get("/vagas");
      console.log(`✅ ${response.data.length} vagas carregadas`);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao listar vagas:", err.response?.data || err);
      throw err;
    }
  },

  // Buscar vaga por ID
  buscarCorrecertoPorId: async (id) => {
    console.log(`🔍 Buscando vaga com ID: ${id}`);
    try {
      const response = await api.get(`/vagas/${id}`);
      console.log("✅ Dados da vaga recebidos:", response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao buscar vaga ${id}:`, err.response?.data || err);
      throw err;
    }
  },

  // Atualizar vaga
  atualizarCorrecerto: async (id, vagaData) => {
    console.log(`✏️ Atualizando vaga ${id} com dados:`, vagaData);
    
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("⚠️ Usuário não está logado.");
      throw new Error("Usuário não está logado. Faça login novamente.");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type":
          vagaData instanceof FormData ? "multipart/form-data" : "application/json",
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

  // Excluir vaga
  excluirVaga: async (id) => {
    console.log(`🗑️ Excluindo vaga com ID: ${id}`);
    
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
      const response = await api.delete(`/vagas/${id}`, config);
      console.log(`✅ Vaga ${id} excluída com sucesso`);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao excluir vaga ${id}:`, err.response?.data || err);
      // Melhora a mensagem de erro para o usuário
      if (err.response?.status === 403) {
        throw new Error("Você não tem permissão para excluir esta vaga.");
      } else if (err.response?.status === 404) {
        throw new Error("Vaga não encontrada ou já foi excluída.");
      }
      throw err;
    }
  },
};

export default CorreCertoService;