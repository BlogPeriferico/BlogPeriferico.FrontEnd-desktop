import api from './Api';

export const buscarUsuarios = async (termoBusca) => {
  try {
    const response = await api.get(`/usuarios/listar?busca=${encodeURIComponent(termoBusca)}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    throw error;
  }
};

export const getUsuarioPorId = async (id) => {
  try {
    const response = await api.get(`/usuarios/listar/${id}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar usuário:', error);
    throw error;
  }
};
