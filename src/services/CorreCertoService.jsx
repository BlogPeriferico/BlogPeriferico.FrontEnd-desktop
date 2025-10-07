import api from "./Api";

const CorreCertoService = {
  // Criar item
  criarCorrecerto: async (correcertoData) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Usuário não está logado.");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type":
          correcertoData instanceof FormData ? "multipart/form-data" : "application/json",
      },
    };

    try {
      const response = await api.post("/vagas", correcertoData, config); // <- trocado
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Listar todos
  listarCorrecertos: async () => {
    try {
      const response = await api.get("/vagas"); // <- trocado
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Buscar por ID
  buscarCorrecertoPorId: async (id) => {
    try {
      const response = await api.get(`/vagas/${id}`); // <- trocado
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Atualizar
  atualizarCorrecerto: async (id, correcertoData) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Usuário não está logado.");

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type":
          correcertoData instanceof FormData ? "multipart/form-data" : "application/json",
      },
    };

    try {
      const response = await api.put(`/vagas/${id}`, correcertoData, config); // <- trocado
      return response.data;
    } catch (err) {
      throw err;
    }
  },

  // Excluir
  excluirVaga: async (id) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Usuário não está logado.");

    try {
      const response = await api.delete(`/vagas/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (err) {
      throw err;
    }
  },
};

export default CorreCertoService;