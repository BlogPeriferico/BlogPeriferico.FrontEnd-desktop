import api from "./Api";

const TOKEN_KEY = "token";

/** Pega o token ou lança erro amigável */
const getTokenOrThrow = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    throw new Error("Usuário não está logado.");
  }
  return token;
};

/** Monta headers com Authorization e, opcionalmente, Content-Type */
const buildAuthConfig = ({
  isFormData = false,
  withContentType = true,
} = {}) => {
  const token = getTokenOrThrow();

  const headers = {
    Authorization: `Bearer ${token}`,
  };

  if (withContentType) {
    headers["Content-Type"] = isFormData
      ? "multipart/form-data"
      : "application/json";
  }

  return { headers };
};

const VagaService = {
  criarVaga: async (vagaData) => {
    // Evita mandar id no corpo sem mutar o objeto original
    let payload = vagaData;

    if (
      !(vagaData instanceof FormData) &&
      vagaData &&
      typeof vagaData === "object" &&
      "id" in vagaData
    ) {
      const { id: _ignoredId, ...rest } = vagaData;
      payload = rest;
    }

    const isFormData = payload instanceof FormData;
    const config = buildAuthConfig({ isFormData });

    try {
      const response = await api.post("/vagas", payload, config);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao criar vaga:", err.response?.data || err);
      throw err;
    }
  },

  listarVagas: async () => {
    try {
      const response = await api.get("/vagas");
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao listar vagas:", err.response?.data || err);
      throw err;
    }
  },

  buscarVagaPorId: async (id) => {
    try {
      const response = await api.get(`/vagas/${id}`);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao buscar vaga ${id}:`, err.response?.data || err);
      throw err;
    }
  },

  atualizarVaga: async (id, vagaData) => {
    const isFormData = vagaData instanceof FormData;
    const config = buildAuthConfig({ isFormData });

    try {
      const response = await api.put(`/vagas/${id}`, vagaData, config);
      return response.data;
    } catch (err) {
      console.error(
        `❌ Erro ao atualizar vaga ${id}:`,
        err.response?.data || err
      );
      throw err;
    }
  },

  excluirVaga: async (id) => {
    const config = buildAuthConfig({ withContentType: false });

    try {
      const response = await api.delete(`/vagas/${id}`, config);
      return response.data;
    } catch (err) {
      console.error(
        `❌ Erro ao excluir vaga ${id}:`,
        err.response?.data || err
      );
      throw err;
    }
  },
};

export default VagaService;
