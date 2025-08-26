// src/services/PostService.js
import api from "./api"; // já existente, configurado com baseURL do backend

const PostService = {
  criarPost: async (postData) => {
    const token = localStorage.getItem("userToken"); // pega o token do login
    if (!token) throw new Error("Usuário não está logado.");

    const response = await api.post("/posts/salvar", postData, {
      headers: { Authorization: "Bearer " + token },
    });
    return response.data;
  },

  listarPosts: async () => {
    const response = await api.get("/posts/listar");
    return response.data;
  },

  atualizarPost: async (id, postData) => {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("Usuário não está logado.");

    const response = await api.put(`/posts/atualizar/${id}`, postData, {
      headers: { Authorization: "Bearer " + token },
    });
    return response.data;
  },

  deletarPost: async (id) => {
    const token = localStorage.getItem("userToken");
    if (!token) throw new Error("Usuário não está logado.");

    const response = await api.delete(`/posts/deletar/${id}`, {
      headers: { Authorization: "Bearer " + token },
    });
    return response.data;
  },
};

export default PostService;
