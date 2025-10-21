import api from "./Api";

const DoacaoService = {
  criarDoacao: async (doacaoData) => {
    console.log("📤 Criando doação com dados (antes de limpar):", doacaoData);

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
      console.log("✅ Resposta do backend ao criar doação:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao criar doação:", err.response?.data || err);
      throw err;
    }
  },

  listarDoacoes: async () => {
    console.log("📥 Carregando lista de doações...");
    try {
      const response = await api.get("/doacoes");
      console.log("✅ Lista de doações recebida:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao listar doações:", err.response?.data || err);
      throw err;
    }
  },

  buscarDoacaoPorId: async (id) => {
    console.log("🔍 Buscando doação com ID:", id);
    try {
      const response = await api.get(`/doacoes/${id}`);
      console.log("✅ Doação recebida:", response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao buscar doação ${id}:`, err.response?.data || err);
      throw err;
    }
  },

  atualizarDoacao: async (id, doacaoData) => {
    console.log(`✏️ Atualizando doação ${id} com dados:`, doacaoData);

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
      console.log(`✅ Doação ${id} atualizada com sucesso:`, response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao atualizar doação ${id}:`, err.response?.data || err);
      throw err;
    }
  },

  excluirDoacao: async (id) => {
    console.log("🗑️ Excluindo doação com ID:", id);

    // Usando a mesma lógica do UserContext para buscar o token
    const token = localStorage.getItem("userToken") || localStorage.getItem("token");
    if (!token) {
      console.error("❌ Nenhum token encontrado no localStorage");
      throw new Error("Usuário não está logado.");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    try {
      const response = await api.delete(`/doacoes/${id}`, config);
      console.log(`✅ Doação ${id} excluída com sucesso.`, response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao excluir doação ${id}:`, err.response?.data || err);
      throw err;
    }
  },
};

export default DoacaoService;
