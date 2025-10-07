import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import NoticiaService from "../../services/NoticiasService";
import ComentariosService from "../../services/ComentariosService";
import AuthService from "../../services/AuthService";
import api from "../../services/Api";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import { FaTimes } from "react-icons/fa";
import ModalConfirmacao from "../../components/modals/ModalConfirmacao";

export default function NoticiasInfo() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";

  const [noticia, setNoticia] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [comentLoading, setComentLoading] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState({ id: null, email: null, nome: "Visitante" });
  const [modalDeletar, setModalDeletar] = useState({ isOpen: false, comentarioId: null });

  // Carregar perfil do usuário
  useEffect(() => {
    const carregarPerfil = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuário não está logado");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const email = decoded.sub;
        console.log("📧 Email do token:", email);

        // Buscar usuário na lista de todos os usuários
        try {
          const response = await api.get('/usuarios/listar');
          const usuarios = response.data;
          const usuarioEncontrado = usuarios.find(u => u.email === email);
          
          if (usuarioEncontrado) {
            setUsuarioLogado({ 
              id: usuarioEncontrado.id, 
              email: email, 
              nome: usuarioEncontrado.nome 
            });
            console.log("✅ Usuário encontrado:", usuarioEncontrado);
          } else {
            console.error("⚠️ Usuário não encontrado na lista");
            alert("Erro: Usuário não encontrado. Faça login novamente.");
          }
        } catch (err) {
          console.error("❌ Erro ao buscar lista de usuários:", err);
          alert("Erro ao carregar perfil. Verifique sua conexão.");
        }
      } catch (err) {
        console.error("❌ Erro geral ao carregar perfil:", err);
      }
    };
    carregarPerfil();
  }, []);

  // Carregar notícia e comentários
  useEffect(() => {
    window.scrollTo(0, 0);

    if (!noticia) {
      setLoading(true);
      NoticiaService.buscarNoticiaPorId(id)
        .then((data) => setNoticia(data))
        .catch((err) => {
          console.error("❌ Erro ao buscar notícia:", err);
          setNoticia(null);
        })
        .finally(() => setLoading(false));
    }

    const carregarComentarios = async () => {
      try {
        const dados = await ComentariosService.listarComentariosNoticia(id);
        setComentarios(dados);
      } catch (err) {
        console.error("❌ Erro ao buscar comentários:", err);
        setComentarios([]);
      }
    };

    carregarComentarios();
  }, [id]);

  // Publicar comentário
  const handlePublicarComentario = async () => {
    if (!novoComentario.trim()) return;

    // Aguardar o carregamento do ID do usuário
    if (!usuarioLogado.id) {
      alert("Aguarde o carregamento do perfil ou faça login novamente.");
      return;
    }

    setComentLoading(true);

    try {
      const dto = {
        texto: novoComentario,
        idNoticia: Number(id),
        idUsuario: usuarioLogado.id,
      };

      console.log("📤 Enviando comentário:", dto);

      const comentarioCriado = await ComentariosService.criarComentario(dto);

      if (!comentarioCriado.nomeUsuario) {
        comentarioCriado.nomeUsuario = usuarioLogado.nome || "Você";
        comentarioCriado.dataHoraCriacao = new Date().toISOString();
      }

      setComentarios(prev => [...prev, comentarioCriado]);
      setNovoComentario("");
    } catch (err) {
      console.error("❌ Erro ao publicar comentário:", err);
      alert("Erro ao publicar comentário, tente novamente.");
    } finally {
      setComentLoading(false);
    }
  };

  // Deletar comentário
  const handleDeletarComentario = async () => {
    try {
      await ComentariosService.excluirComentario(modalDeletar.comentarioId);
      setComentarios(prev => prev.filter(c => c.id !== modalDeletar.comentarioId));
    } catch (err) {
      console.error("Erro ao deletar comentário:", err);
      alert("Não foi possível excluir o comentário.");
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 mt-[80px]">
        <p className="text-gray-600">Carregando notícia...</p>
      </div>
    );
  }

  if (!noticia) {
    return (
      <div className="max-w-6xl mx-auto p-6 mt-[80px]">
        <button onClick={() => navigate(-1)} className="text-blue-600">Voltar</button>
        <p className="text-gray-600">Notícia não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 mt-[80px]">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate("/quebrada-informa")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200 group"
        >
          <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"></path>
          </svg>
          <span className="font-medium">Voltar para notícias</span>
        </button>

        {/* Card Principal da Notícia */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Imagem de Capa */}
          <div className="relative h-[300px] lg:h-[500px] overflow-hidden">
            <img
              src={noticia.imagem}
              alt={noticia.titulo}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
            
            {/* Badge da Zona */}
            <div 
              className="absolute top-6 right-6 px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg backdrop-blur-sm"
              style={{ backgroundColor: corPrincipal }}
            >
              {noticia.zona}
            </div>

            {/* Autor */}
            <div className="absolute bottom-6 left-6 flex items-center gap-4">
              <img
                src={noticia.fotoAutor || "https://i.pravatar.cc/80"}
                alt={noticia.autor}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div className="text-white">
                <p className="text-sm font-medium opacity-90">Publicado por</p>
                <p className="text-lg font-bold">{noticia.autor || "Autor"}</p>
              </div>
            </div>
          </div>

          {/* Conteúdo */}
          <div className="p-6 lg:p-10">
            {/* Título */}
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
              {noticia.titulo}
            </h1>

            {/* Subtítulo */}
            {noticia.subtitulo && (
              <p className="text-xl text-gray-600 mb-6 font-medium">{noticia.subtitulo}</p>
            )}

            {/* Metadados */}
            <div className="flex flex-wrap items-center gap-4 pb-6 mb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                </svg>
                <span className="text-sm font-medium">{noticia.local}</span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span className="text-sm font-medium">{noticia.dataPublicacao || "Hoje"}</span>
              </div>
            </div>

            {/* Texto da Notícia */}
            <div className="prose prose-lg max-w-none">
              <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                {noticia.conteudo}
              </p>
            </div>
          </div>
        </div>

      {/* Comentários */}
      <div className="mt-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-200">
        <div className="flex items-center gap-3 mb-6">
          <div 
            className="w-1 h-8 rounded-full"
            style={{ backgroundColor: corPrincipal }}
          ></div>
          <h2 className="text-2xl font-bold text-gray-800">
            Comentários ({comentarios.length})
          </h2>
        </div>

        {/* Formulário de Comentário */}
        <div className="mb-8 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4">
            <img
              src="https://i.pravatar.cc/40"
              alt="Seu avatar"
              className="w-10 h-10 rounded-full border-2 hidden sm:block"
              style={{ borderColor: corPrincipal }}
            />
            <div className="flex-1 w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
              <input
                type="text"
                placeholder="Escreva um comentário..."
                value={novoComentario}
                onChange={(e) => setNovoComentario(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && !comentLoading && !e.shiftKey && handlePublicarComentario()}
                className="flex-1 px-4 py-3 bg-gray-50 rounded-lg outline-none text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:ring-2 transition-all duration-200"
                style={{ 
                  focusRingColor: corPrincipal,
                }}
              />
              <button
                onClick={handlePublicarComentario}
                disabled={comentLoading || !novoComentario.trim()}
                className="w-full sm:w-auto px-6 py-3 text-white text-sm font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md"
                style={{
                  backgroundColor: corPrincipal,
                }}
              >
                {comentLoading ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Enviando...
                  </span>
                ) : "Publicar"}
              </button>
            </div>
          </div>
        </div>

        {/* Lista de Comentários */}
        {comentarios.length === 0 ? (
          <div className="text-center py-12">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"></path>
              </svg>
            </div>
            <p className="text-gray-500 text-lg font-medium">Nenhum comentário ainda</p>
            <p className="text-gray-400 text-sm mt-1">Seja o primeiro a comentar!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {comentarios.map((coment) => (
              <div
                key={coment.id}
                className="bg-white rounded-xl p-5 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 relative group"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={coment.avatar || "https://i.pravatar.cc/40"}
                    alt={coment.nomeUsuario || "Usuário"}
                    className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-base font-bold text-gray-800">
                          {coment.nomeUsuario || "Usuário"}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {coment.dataHoraCriacao ? new Date(coment.dataHoraCriacao).toLocaleString('pt-BR', {
                            day: '2-digit',
                            month: 'short',
                            year: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : "agora"}
                        </p>
                      </div>
                      {(coment.idUsuario === usuarioLogado.id || coment.emailUsuario === usuarioLogado.email) && (
                        <button
                          onClick={() => setModalDeletar({ isOpen: true, comentarioId: coment.id })}
                          className="p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-all duration-200"
                          title="Excluir comentário"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>
                          </svg>
                        </button>
                      )}
                    </div>
                    <div className="bg-gray-50 rounded-lg p-4 text-gray-700 text-sm leading-relaxed break-words">
                      {coment.texto}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

        {/* Modal de Confirmação de Exclusão */}
        <ModalConfirmacao
          isOpen={modalDeletar.isOpen}
          onClose={() => setModalDeletar({ isOpen: false, comentarioId: null })}
          onConfirm={handleDeletarComentario}
          titulo="Excluir Comentário"
          mensagem="Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita."
          textoBotaoConfirmar="Excluir"
          textoBotaoCancelar="Cancelar"
          corBotaoConfirmar="#ef4444"
        />
      </div>
    </div>
  );
}
