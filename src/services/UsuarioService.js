import api from "./Api";

export const buscarUsuarios = async (termoBusca) => {
  try {
    const response = await api.get(
      `/usuarios/listar?busca=${encodeURIComponent(termoBusca)}`
    );
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao buscar usuários:", error.response?.data || error);
    throw error;
  }
};

export const getUsuarioPorId = async (id) => {
  try {
    const response = await api.get(`/usuarios/listar/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao buscar usuário:", error.response?.data || error);
    throw error;
  }
};

export const deletarUsuario = async (id) => {
  const token = localStorage.getItem("token");
  if (!token) {
    const err = new Error("Usuário não está logado. Faça login novamente.");
    err.status = 401;
    throw err;
  }

  try {
    await api.delete(`/usuarios/deletar/${id}`);
  } catch (error) {
    const status = error.response?.status;
    console.error("❌ Erro ao deletar usuário:", error.response?.data || error);

    if (status === 403) {
      const err = new Error("Você não tem permissão para deletar este usuário.");
      err.status = 403;
      err.response = error.response;
      throw err;
    }

    if (status === 404) {
      const err = new Error("Usuário não encontrado ou já foi deletado.");
      err.status = 404;
      err.response = error.response;
      throw err;
    }

    throw error;
  }
};
