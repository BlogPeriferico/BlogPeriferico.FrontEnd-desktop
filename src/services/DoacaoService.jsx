import api from "./Api";

const DoacaoService = {
  criarDoacao: async (doacaoData) => {
    console.log("Criando doação com dados:", doacaoData);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Usuário não está logado.");
      throw new Error("Usuário não está logado.");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": doacaoData instanceof FormData ? "multipart/form-data" : "application/json",
      },
    };

    try {
      const response = await api.post("/doacoes", doacaoData, config);
      console.log("Resposta do backend ao criar doação:", response.data);
      return response.data;
    } catch (err) {
      console.error("Erro ao criar doação:", err);
      throw err;
    }
  },

  listarDoacoes: async () => {
    console.log("Carregando lista de doações...");
    try {
      const response = await api.get("/doacoes");
      console.log("Lista de doações recebida:", response.data);
      return response.data;
    } catch (err) {
      console.error("Erro ao listar doações:", err);
      throw err;
    }
  },

  buscarDoacaoPorId: async (id) => {
    console.log("Buscando doação com ID:", id);
    try {
      const response = await api.get(`/doacoes/${id}`);
      console.log("Doação recebida:", response.data);
      return response.data;
    } catch (err) {
      console.error(`Erro ao buscar doação ${id}:`, err);
      throw err;
    }
  },

  atualizarDoacao: async (id, doacaoData) => {
    console.log(`Atualizando doação ${id} com dados:`, doacaoData);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Usuário não está logado.");
      throw new Error("Usuário não está logado.");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": doacaoData instanceof FormData ? "multipart/form-data" : "application/json",
      },
    };

    try {
      const response = await api.put(`/doacoes/${id}`, doacaoData, config);
      console.log(`Doação ${id} atualizada com sucesso:`, response.data);
      return response.data;
    } catch (err) {
      console.error(`Erro ao atualizar doação ${id}:`, err);
      throw err;
    }
  },

  excluirDoacao: async (id) => {
    console.log("Excluindo doação com ID:", id);
    const token = localStorage.getItem("token");
    if (!token) {
      console.error("Usuário não está logado.");
      throw new Error("Usuário não está logado.");
    }

    try {
      const response = await api.delete(`/doacoes/${id}`, {
        headers: { Authorization: "Bearer " + token },
      });
      console.log(`Doação ${id} excluída com sucesso.`, response.data);
      return response.data;
    } catch (err) {
      console.error(`Erro ao excluir doação ${id}:`, err);
      throw err;
    }
  },
};

export default DoacaoService;
