import api from "./Api";

const ComentariosService = {
  criarComentario: async (comentarioData) => {
    console.log("📤 Criando comentário:", comentarioData);

    const token = localStorage.getItem("token");
    if (!token) throw new Error("Usuário não está logado.");

    try {
      const response = await api.post("/comentarios", comentarioData, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });
      console.log("✅ Comentário criado:", response.data);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao criar comentário:", err.response?.data || err);
      throw err;
    }
  },

  listarComentariosNoticia: async (idNoticia) => {
    try {
      const response = await api.get(`/comentarios/noticia/${idNoticia}`);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao listar comentários:", err.response?.data || err);
      throw err;
    }
  },

  excluirComentario: async (idComentario) => {
    const token = localStorage.getItem("token");
    if (!token) throw new Error("Usuário não está logado.");

    try {
      await api.delete(`/comentarios/${idComentario}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      console.log(`✅ Comentário ${idComentario} excluído.`);
    } catch (err) {
      console.error(`❌ Erro ao excluir comentário ${idComentario}:`, err.response?.data || err);
      throw err;
    }
  },
};

export default ComentariosService;
