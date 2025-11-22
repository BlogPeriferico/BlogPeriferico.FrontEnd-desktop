import api from './Api';

export const buscarPosts = async (termo) => {
  try {
    const response = await api.get(`/posts/buscar?termo=${encodeURIComponent(termo)}`);
    return response.data;
  } catch (error) {
    console.error('Erro ao buscar posts:', error);
    throw error;
  }
};

export default {
  buscarPosts
};
