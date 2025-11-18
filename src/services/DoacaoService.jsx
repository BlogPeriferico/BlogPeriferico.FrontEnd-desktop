import api from "./Api";

const TOKEN_KEY = "token";

/** Pega o token ou lança erro amigável */
const getTokenOrThrow = () => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (!token) {
    console.error("⚠️ Usuário não está logado.");
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

const DoacaoService = {
  criarDoacao: async (doacaoData) => {
    // Evita mandar id no corpo (sem mutar o objeto original)
    let payload = doacaoData;

    if (
      !(doacaoData instanceof FormData) &&
      doacaoData &&
      typeof doacaoData === "object" &&
      "id" in doacaoData
    ) {
      const { id: _ignoredId, ...rest } = doacaoData;
      payload = rest;
    }

    const isFormData = payload instanceof FormData;
    const config = buildAuthConfig({ isFormData });

    try {
      const response = await api.post("/doacoes", payload, config);
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao criar doação:", err.response?.data || err);
      throw err;
    }
  },

  listarDoacoes: async () => {
    try {
      const response = await api.get("/doacoes");
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao listar doações:", err.response?.data || err);
      throw err;
    }
  },

  buscarDoacaoPorId: async (id) => {
    try {
      const response = await api.get(`/doacoes/${id}`);
      return response.data;
    } catch (err) {
      console.error(
        `❌ Erro ao buscar doação ${id}:`,
        err.response?.data || err
      );
      throw err;
    }
  },

  atualizarDoacao: async (id, doacaoData) => {
    const isFormData = doacaoData instanceof FormData;
    const config = buildAuthConfig({ isFormData });

    try {
      const response = await api.put(`/doacoes/${id}`, doacaoData, config);
      return response.data;
    } catch (err) {
      console.error(
        `❌ Erro ao atualizar doação ${id}:`,
        err.response?.data || err
      );
      throw err;
    }
  },

  excluirDoacao: async (id) => {
    const config = buildAuthConfig({ withContentType: false });

    try {
      const response = await api.delete(`/doacoes/${id}`, config);
      return response.data;
    } catch (err) {
      console.error(
        `❌ Erro ao excluir doação ${id}:`,
        err.response?.data || err
      );
      throw err;
    }
  },
};

export default DoacaoService;
