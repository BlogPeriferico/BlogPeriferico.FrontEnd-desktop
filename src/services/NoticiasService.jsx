import api from "./Api";
import { jwtDecode } from "jwt-decode";

const NoticiaService = {
  criarNoticia: async (noticiaData) => {
    console.log("📤 Criando notícia com dados:", noticiaData);

    // 🔥 Garante que nenhum id vai junto
    if (!(noticiaData instanceof FormData) && noticiaData?.id !== undefined) {
      delete noticiaData.id;
    }

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Usuário não está logado. Faça login novamente.");
    }

    // Verifica se o token é válido
    try {
      const decoded = jwtDecode(token);
      const currentTime = Date.now() / 1000;
      
      if (decoded.exp < currentTime) {
        console.warn("⚠️ Token expirado");
        localStorage.removeItem("token");
        window.location.href = "/login?error=session_expired";
        throw new Error("Sessão expirada. Faça login novamente.");
      }
    } catch (error) {
      console.error("❌ Erro ao verificar token:", error);
      localStorage.removeItem("token");
      window.location.href = "/login?error=invalid_token";
      throw new Error("Erro de autenticação. Faça login novamente.");
    }

    // Configuração do cabeçalho
    const config = {};
    if (!(noticiaData instanceof FormData)) {
      config.headers = { 'Content-Type': 'application/json' };
    }

    try {
      const response = await api.post("/noticias", noticiaData, config);
      console.log("✅ Notícia criada com sucesso!");
      return response.data;
    } catch (err) {
      console.error("❌ Erro ao criar notícia:", {
        status: err.response?.status,
        data: err.response?.data,
        message: err.message
      });
      
      if (err.response?.status === 401 || err.response?.status === 403) {
        // Token inválido ou expirado
        localStorage.removeItem("token");
        window.location.href = "/login?error=session_expired";
        throw new Error("Sessão expirada. Faça login novamente.");
      }
      
      // Outros erros
      const errorMessage = err.response?.data?.message || "Erro ao criar notícia. Tente novamente.";
      throw new Error(errorMessage);
    }
  },

  atualizarNoticia: async (id, noticiaData) => {
    console.log(`✏️ Atualizando notícia ${id} com dados:`, noticiaData);

    const token = localStorage.getItem("token");
    if (!token) {
      throw new Error("Usuário não está logado.");
    }

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
        ...(noticiaData instanceof FormData
          ? {}
          : { "Content-Type": "application/json" }),
      },
    };

    try {
      const response = await api.put(`/noticias/${id}`, noticiaData, config);
      console.log(`✅ Notícia ${id} atualizada com sucesso:`, response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao atualizar notícia ${id}:`, err.response?.data || err);
      throw err;
    }
  },

  listarNoticias: async (regiao) => {
    console.log(`📥 Buscando notícias${regiao ? ` para a região: ${regiao}` : ' de todas as regiões'}...`);
    try {
      const params = {};
      if (regiao) {
        params.regiao = regiao;
      }
      
      const response = await api.get("/noticias", { params });
      console.log(`✅ ${response.data?.length || 0} notícias encontradas`);
      return response.data || [];
    } catch (err) {
      console.error("❌ Erro ao buscar notícias:", err.response?.data || err);
      // Se der erro, retorna array vazio para não quebrar a interface
      return [];
    }
  },

  buscarNoticiaPorId: async (id) => {
    console.log("🔍 Buscando notícia com ID:", id);
    try {
      const response = await api.get(`/noticias/${id}`);
      console.log("✅ Notícia recebida:", response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao buscar notícia ${id}:`, err.response?.data || err);
      throw err;
    }
  },

  excluirNoticia: async (id) => {
    console.log("🗑️ Excluindo notícia com ID:", id);

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("❌ Nenhum token encontrado no localStorage");
      throw new Error("Usuário não está logado.");
    }

    console.log("🔑 Token sendo enviado:", token.substring(0, 10) + "...");

    try {
      const response = await api.delete(`/noticias/${id}`, {
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
      });
      console.log(`✅ Notícia ${id} excluída.`, response.data);
      return response.data;
    } catch (err) {
      console.error(`❌ Erro ao excluir notícia ${id}:`, err.response?.data || err);
      console.error(`❌ Status HTTP:`, err.response?.status);
      console.error(`❌ Headers da resposta:`, err.response?.headers);
      throw err;
    }
  },
};

export default NoticiaService;
