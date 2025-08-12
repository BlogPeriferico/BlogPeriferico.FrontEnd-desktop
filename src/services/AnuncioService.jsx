
import api from "./Api";

export const getAnuncios = async () => {
  try {
    const response = await api.get("/anuncios");
    return response.data;
  } catch (error) {
    console.error("Erro ao buscar anúncios:", error);
    throw error;
  }
};

export const criarAnuncio = async (anuncioData) => {
  try {
    const formData = new FormData();

    for (const key in anuncioData) {
      formData.append(key, anuncioData[key]);
    }

    const response = await api.post("/anuncios", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Erro ao criar anúncio:", error);
    throw error;
  }
};
