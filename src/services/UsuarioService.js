import api from "./Api";

/**
 * Busca usuários pelo termo (nome, email, etc.).
 * Mantém a mesma rota `/usuarios/listar?busca=`.
 */
export const buscarUsuarios = async (termoBusca) => {
  try {
    const response = await api.get("/usuarios/listar", {
      params: {
        busca: termoBusca ?? "",
      },
    });
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao buscar usuários:", {
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

/**
 * Busca um usuário específico pelo ID.
 */
export const getUsuarioPorId = async (id) => {
  try {
    const response = await api.get(`/usuarios/listar/${id}`);
    return response.data;
  } catch (error) {
    console.error("❌ Erro ao buscar usuário por ID:", {
      id,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};

/**
 * Deleta um usuário pelo ID.
 */
export const deletarUsuario = async (id) => {
  try {
    await api.delete(`/usuarios/deletar/${id}`);
  } catch (error) {
    console.error("❌ Erro ao deletar usuário:", {
      id,
      status: error.response?.status,
      data: error.response?.data,
      message: error.message,
    });
    throw error;
  }
};
