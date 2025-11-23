import api from './Api';

export const buscarPosts = async (termo, page = 0, size = 10) => {
  try {
    const response = await api.get(`/api/busca`, {
      params: {
        termo: termo,
        page: page,
        size: size
      }
    });
    return response.data.content; // Ajuste para retornar apenas o conteúdo da página
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    throw error;
  }
};

export default {
  buscarPosts
};
