// src/services/DoacaoService.js
import api from "./api"; // seu axios configurado

const DoacaoService = {
  criarDoacao: async (doacaoData) => {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("Usuário não está logado.");

    const response = await api.post("/doacoes", doacaoData, {
      headers: { Authorization: "Bearer " + token },
    });
    return response.data;
  },

  listarDoacoes: async () => {
    const response = await api.get("/doacoes");
    return response.data;
  },

  buscarDoacaoPorId: async (id) => {
    const response = await api.get(`/doacoes/${id}`);
    return response.data;
  },

  atualizarDoacao: async (id, doacaoData) => {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("Usuário não está logado.");

    const response = await api.put(`/doacoes/${id}`, doacaoData, {
      headers: { Authorization: "Bearer " + token },
    });
    return response.data;
  },

  excluirDoacao: async (id) => {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("Usuário não está logado.");

    const response = await api.delete(`/doacoes/${id}`, {
      headers: { Authorization: "Bearer " + token },
    });
    return response.data;
  },
};

export default DoacaoService;
