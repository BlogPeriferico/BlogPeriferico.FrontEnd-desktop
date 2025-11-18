import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import DoacaoService from "../../services/DoacaoService";
import ComentariosService from "../../services/ComentariosService";
import AuthService from "../../services/AuthService";
import api from "../../services/Api";
import { useRegiao } from "../../contexts/RegionContext";
import { useUser } from "../../contexts/UserContext.jsx";
import { regionColors } from "../../utils/regionColors";
import { FaTrash } from "react-icons/fa";
import ModalConfirmacao from "../../components/modals/ModalConfirmacao";
import NoPicture from "../../assets/images/NoPicture.webp";

export default function DoacaoInfo() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { regiao } = useRegiao();
  const { user } = useUser();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";

  const [doacao, setDoacao] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [comentLoading, setComentLoading] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState({
    id: null,
    email: null,
    nome: "Visitante",
    papel: null,
  });
  const [modalDeletar, setModalDeletar] = useState({
    isOpen: false,
    comentarioId: null,
  });
  const [modalDeletarDoacao, setModalDeletarDoacao] = useState(false);
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [nomeAutor, setNomeAutor] = useState(null);

  // Carregar perfil do usuário usando UserContext
  useEffect(() => {
    if (user && user.id) {
      const userData = {
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role || user.roles || user.papel,
        roles: user.roles || user.role || user.papel,
        papel: user.papel || user.role || user.roles,
        fotoPerfil: user.fotoPerfil,
      };

      setUsuarioLogado(userData);
    }
  }, [user]);

  // Carregar doação e comentários
  useEffect(() => {
    window.scrollTo(0, 0);

    if (!doacao) {
      setLoading(true);

      const carregarDoacao = async () => {
        try {
          const data = await DoacaoService.buscarDoacaoPorId(id);

          // Buscar dados do usuário junto com a doação
          if (data.idUsuario) {
            try {
              const response = await api.get("/usuarios/listar");
              const doador = response.data.find((u) => u.id === data.idUsuario);

              if (doador) {
                data.autor = doador.nome;
                data.fotoPerfil = doador.fotoPerfil;
                data.idUsuario = doador.id;
              } else if (data.autor) {
                // Usa o nome do autor diretamente da doação
              }
            } catch (err) {
              // Erro ao buscar dados do doador, continua com os dados que tem
              if (data.autor) {
                // Usa o nome do autor diretamente da doação
              }
            }
          }

          setDoacao(data);

          // Carrega os comentários
          try {
            const comentariosData =
              await ComentariosService.listarComentariosDoacao(id);

            // Buscar todos os usuários para obter as fotos de perfil
            const response = await api.get("/usuarios/listar");
            const usuarios = response.data;

            // Mapear comentários e adicionar avatar
            const comentariosComAvatar = comentariosData.map((coment) => {
              const usuarioComentario = usuarios.find(
                (u) =>
                  u.id === coment.idUsuario || u.email === coment.emailUsuario
              );

              if (usuarioComentario?.fotoPerfil) {
                return { ...coment, avatar: usuarioComentario.fotoPerfil };
              }

              if (
                (coment.idUsuario === user?.id ||
                  coment.emailUsuario === user?.email) &&
                user?.fotoPerfil
              ) {
                return { ...coment, avatar: user.fotoPerfil };
              }

              return { ...coment, avatar: coment.avatar || NoPicture };
            });

            setComentarios(comentariosComAvatar);
          } catch (err) {
            setComentarios([]);
          }
        } catch (err) {
          setDoacao(null);
        } finally {
          setLoading(false);
        }
      };

      carregarDoacao();
    }

    const carregarComentarios = async () => {
      try {
        const comentarios = await ComentariosService.listarComentariosDoacao(
          id
        );

        const response = await api.get("/usuarios/listar");
        const usuarios = response.data;

        const comentariosComAvatar = comentarios.map((coment) => {
          const usuarioComentario = usuarios.find(
            (u) => u.id === coment.idUsuario || u.email === coment.emailUsuario
          );

          if (usuarioComentario?.fotoPerfil) {
            return { ...coment, avatar: usuarioComentario.fotoPerfil };
          }

          if (
            (coment.idUsuario === user?.id ||
              coment.emailUsuario === user?.email) &&
            user?.fotoPerfil
          ) {
            return { ...coment, avatar: user.fotoPerfil };
          }

          return { ...coment, avatar: coment.avatar || NoPicture };
        });

        setComentarios(comentariosComAvatar);
      } catch (err) {
        setComentarios([]);
      }
    };

    carregarComentarios();
  }, [id, doacao, user?.email, user?.fotoPerfil, user?.id]);

  // Força o recarregamento da doação quando o componente é montado
  useEffect(() => {
    setDoacao(null);
  }, [id]);

  // Atualiza fotoPerfil da doação quando foto do usuário muda
  useEffect(() => {
    if (doacao && user?.id && doacao.idUsuario === user.id) {
      const novaFoto = user.fotoPerfil || NoPicture;

      if (novaFoto !== doacao.fotoPerfil) {
        setDoacao((prevDoacao) => ({
          ...prevDoacao,
          fotoPerfil: novaFoto,
        }));
      }
    }
  }, [user?.fotoPerfil, doacao?.id, doacao?.idUsuario, user?.id, doacao]);

  // Sincroniza fotoPerfil inicial
  useEffect(() => {
    if (
      doacao &&
      user?.id &&
      doacao.idUsuario === user.id &&
      user.fotoPerfil &&
      !doacao.fotoPerfil
    ) {
      setDoacao((prevDoacao) => ({
        ...prevDoacao,
        fotoPerfil: user.fotoPerfil,
      }));
    }
  }, [doacao, user]);

  // Atualiza avatar dos comentários existentes quando foto do usuário muda
  useEffect(() => {
    if (user?.id && comentarios.length > 0) {
      setComentarios((prevComentarios) => {
        return prevComentarios.map((coment) => {
          const isUserComment =
            coment.idUsuario === user.id || coment.emailUsuario === user.email;

          if (isUserComment) {
            return {
              ...coment,
              avatar: user.fotoPerfil || NoPicture,
            };
          }
          return coment;
        });
      });
    }
  }, [user?.fotoPerfil, user?.id, user?.email, comentarios.length]);

  // Buscar nome do autor da doação
  useEffect(() => {
    const buscarAutor = async () => {
      if (doacao && doacao.idUsuario) {
        try {
          const response = await api.get("/usuarios/listar");
          const usuarios = response.data;
          const autor = usuarios.find((u) => u.id === doacao.idUsuario);
          if (autor) {
            setNomeAutor(autor.nome);
          }
        } catch (err) {
          console.error(
            "❌ Erro ao buscar autor (403 - backend bloqueando):",
            err
          );
          setNomeAutor(doacao.autor || "Autor");
        }
      } else if (doacao && doacao.autor) {
        setNomeAutor(doacao.autor);
      }
    };
    buscarAutor();
  }, [doacao]);

  // Publicar comentário
  const handlePublicarComentario = async () => {
    if (!user?.id) {
      setShowLoginAlert(true);
      return;
    }

    if (!novoComentario.trim()) return;

    if (!usuarioLogado.id) {
      alert("Aguarde o carregamento do perfil ou faça login novamente.");
      return;
    }

    setComentLoading(true);

    try {
      const dto = {
        texto: novoComentario,
        idDoacao: Number(id),
        idUsuario: usuarioLogado.id,
        tipo: "DOACAO",
      };

      const comentarioCriado = await ComentariosService.criarComentarioDoacao(
        dto
      );

      if (!comentarioCriado.nomeUsuario) {
        comentarioCriado.nomeUsuario = user.nome || "Você";
        comentarioCriado.dataHoraCriacao = new Date().toISOString();
        comentarioCriado.avatar = user.fotoPerfil || NoPicture;
      }

      setComentarios((prev) => [...prev, comentarioCriado]);
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
      setComentarios((prev) =>
        prev.filter((c) => c.id !== modalDeletar.comentarioId)
      );
    } catch (err) {
      console.error("Erro ao deletar comentário:", err);
      alert("Não foi possível excluir o comentário.");
    }
  };

  // Verificação de permissões da doação
  const userRole =
    usuarioLogado?.role || usuarioLogado?.roles || usuarioLogado?.papel || "";
  const roleNormalizado = String(userRole).toUpperCase();

  const isAdmin =
    roleNormalizado.includes("ADMIN") ||
    roleNormalizado.includes("ADMINISTRADOR");
  const isDoador =
    doacao &&
    (doacao.idUsuario === usuarioLogado?.id ||
      doacao.emailUsuario === usuarioLogado?.email ||
      doacao.autor === usuarioLogado?.nome);

  const podeExcluirDoacao = Boolean(
    doacao && usuarioLogado && (isAdmin || isDoador)
  );

  // Deletar doação
  const handleDeletarDoacao = async () => {
    try {
      await DoacaoService.excluirDoacao(id);
      setModalDeletarDoacao(false);
      alert("Doação excluída com sucesso.");
      navigate("/doacoes");
    } catch (err) {
      console.error("❌ Erro ao excluir doação:", err);
      console.error("❌ Resposta do servidor:", err.response?.data);
      const status = err?.response?.status;
      if (status === 403 || status === 401) {
        alert(
          "❌ ERRO DE AUTORIZAÇÃO NO BACKEND\n\n" +
            "O servidor está negando a exclusão desta doação.\n\n" +
            "Possíveis causas:\n" +
            "1. Você não é o doador\n" +
            "2. Seu token JWT não tem o papel ADMIN\n" +
            "3. O backend precisa ajustar a lógica de autorização\n\n" +
            "O endpoint DELETE /doacoes/{id} no backend precisa permitir:\n" +
            "- ADMIN pode deletar qualquer doação\n" +
            "- Doador pode deletar apenas sua própria doação"
        );
      } else {
        alert("Não foi possível excluir a doação. Tente novamente.");
      }
    }
  };

  if (loading) {
    return (
      <div
        className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100"
        role="main"
        aria-label="Carregando informações da doação"
        aria-busy="true"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 mt-[80px]">
          {/* Botão Voltar */}
          <button
            type="button"
            onClick={() => navigate("/doacoes")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200 group"
            aria-label="Voltar para a lista de doações"
          >
            <svg
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
            <span className="font-medium">Voltar para doações</span>
          </button>

          {/* Loading Elaborado */}
          <div className="flex flex-col items-center justify-center py-20">
            <div
              className="animate-spin rounded-full h-16 w-16 border-b-4 mb-6"
              style={{ borderColor: corPrincipal }}
              role="status"
              aria-live="polite"
              aria-label="Carregando doação"
            ></div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">
                Carregando doação...
              </h2>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                Aguarde enquanto buscamos todos os detalhes desta doação
              </p>
              <div className="mt-6 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                <div
                  className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"
                  style={{ animationDelay: "0.2s" }}
                ></div>
                <div
                  className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"
                  style={{ animationDelay: "0.4s" }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!doacao) {
    return (
      <div
        className="max-w-6xl mx-auto p-6 mt-[80px]"
        role="main"
        aria-label="Doação não encontrada"
      >
        <button
          type="button"
          onClick={() => navigate(-1)}
          className="text-blue-600 hover:underline"
          aria-label="Voltar para a página anterior"
        >
          Voltar
        </button>
        <p className="text-gray-600 mt-4">Doação não encontrada.</p>
      </div>
    );
  }

  return (
    <main
      className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100"
      role="main"
      aria-label={`Detalhes da doação ${doacao.titulo}`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 mt-[80px]">
        {/* Botão Voltar */}
        <button
          type="button"
          onClick={() => navigate("/doacoes")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200 group"
          aria-label="Voltar para a lista de doações"
        >
          <svg
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
          <span className="font-medium">Voltar para doações</span>
        </button>

        {/* Card Principal da Doação */}
        <article className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Imagem de Capa */}
          <div className="relative h-[300px] lg:h-[500px] overflow-hidden">
            <img
              src={doacao.imagem}
              alt={`Imagem da doação: ${doacao.titulo}`}
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

            {/* Badge da Zona */}
            <div
              className="absolute top-6 right-6 px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg backdrop-blur-sm"
              style={{ backgroundColor: corPrincipal }}
              aria-label={`Zona ${doacao.zona}`}
            >
              {doacao.zona}
            </div>

            {/* Doador */}
            <div className="absolute top-6 left-6 flex items-center gap-4">
              <img
                src={doacao.fotoPerfil || NoPicture}
                alt={
                  nomeAutor
                    ? `Foto de perfil de ${nomeAutor}`
                    : "Foto de perfil do doador"
                }
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = NoPicture;
                }}
              />
              <div>
                <p
                  className="text-sm font-medium text-black"
                  style={{ color: corPrincipal }}
                >
                  Doado por
                </p>
                <p
                  className="text-lg font-bold text-black"
                  style={{ color: corPrincipal }}
                >
                  {nomeAutor || "Carregando..."}
                </p>
              </div>
            </div>

            {/* Botão Excluir Doação */}
            {podeExcluirDoacao && (
              <div className="absolute bottom-6 right-6">
                <button
                  type="button"
                  onClick={() => setModalDeletarDoacao(true)}
                  className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-110 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                  title="Excluir doação"
                  aria-label="Excluir esta doação"
                >
                  <FaTrash size={16} aria-hidden="true" />
                </button>
              </div>
            )}
          </div>

          {/* Conteúdo */}
          <div className="p-6 lg:p-10">
            {/* Título */}
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
              {doacao.titulo}
            </h1>

            {/* Resumo / Descrição */}
            {(doacao.resumo || doacao.descricao) && (
              <p className="text-xl text-gray-600 mb-6 font-medium leading-relaxed">
                {doacao.resumo || doacao.descricao}
              </p>
            )}

            {/* Metadados */}
            <div className="flex flex-wrap items-center gap-4 pb-6 mb-6 border-b border-gray-200">
              <div className="flex items-center gap-2 text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  ></path>
                </svg>
                <span className="text-sm font-medium">
                  {doacao.categoria || "Categoria não informada"}
                </span>
              </div>
              <div className="flex items-center gap-2 text-gray-600">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                <span className="text-sm font-medium">
                  {doacao.dataHoraCriacao
                    ? `Publicado em ${new Date(
                        doacao.dataHoraCriacao
                      ).toLocaleDateString("pt-BR")} às ${new Date(
                        doacao.dataHoraCriacao
                      ).toLocaleTimeString("pt-BR")}`
                    : "Hoje"}
                </span>
              </div>
            </div>

            {/* Botão de Contato */}
            {doacao.telefone && (
              <a
                href={`https://wa.me/${doacao.telefone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                aria-label={`Entrar em contato pelo WhatsApp sobre a doação ${doacao.titulo}`}
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Entrar em contato
              </a>
            )}
          </div>
        </article>

        {/* Comentários */}
        <section
          className="mt-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-200"
          aria-label="Seção de comentários da doação"
        >
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-1 h-8 rounded-full"
              style={{ backgroundColor: corPrincipal }}
            ></div>
            <h2 className="text-2xl font-bold text-gray-800">
              Comentários ({comentarios.length})
            </h2>
          </div>

          {/* Aviso para login */}
          {!user?.id && (
            <div
              className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4"
              role="status"
              aria-live="polite"
            >
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg
                    className="h-5 w-5 text-yellow-400"
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      fillRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Você precisa estar logado para comentar.{" "}
                    <a
                      href="/login"
                      className="font-medium text-yellow-700 underline hover:text-yellow-600"
                    >
                      Faça login
                    </a>{" "}
                    ou{" "}
                    <a
                      href="/cadastro"
                      className="font-medium text-yellow-700 underline hover:text-yellow-600"
                    >
                      cadastre-se
                    </a>{" "}
                    para participar da conversa.
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Formulário de Comentário */}
          <div className="mb-8 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4">
              <img
                src={user?.fotoPerfil || NoPicture}
                alt="Seu avatar"
                className="w-10 h-10 rounded-full border-2 hidden sm:block object-cover"
                style={{ borderColor: corPrincipal }}
                loading="lazy"
                decoding="async"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = NoPicture;
                }}
              />
              <div className="flex-1 w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <label htmlFor="novo-comentario" className="sr-only">
                  Escreva um comentário
                </label>
                <input
                  id="novo-comentario"
                  type="text"
                  placeholder="Escreva um comentário..."
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    !comentLoading &&
                    !e.shiftKey &&
                    handlePublicarComentario()
                  }
                  className="flex-1 px-4 py-3 bg-gray-50 rounded-lg outline-none text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:ring-2 focus:ring-offset-0 focus:ring-blue-500 transition-all duration-200"
                />
                <button
                  type="button"
                  onClick={handlePublicarComentario}
                  disabled={comentLoading || !novoComentario.trim()}
                  className="w-full sm:w-auto px-6 py-3 text-white text-sm font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{
                    backgroundColor: corPrincipal,
                  }}
                  aria-label="Publicar comentário"
                >
                  {comentLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    "Publicar"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Comentários */}
          {comentarios.length === 0 ? (
            <div
              className="text-center py-12"
              aria-label="Nenhum comentário ainda"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  aria-hidden="true"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  ></path>
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">
                Nenhum comentário ainda
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Seja o primeiro a comentar!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comentarios.map((coment) => (
                <article
                  key={coment.id}
                  className="bg-white rounded-xl p-5 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 relative group"
                  aria-label={`Comentário de ${
                    coment.nomeUsuario || "Usuário"
                  }`}
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={coment.avatar || NoPicture}
                      alt={
                        coment.nomeUsuario
                          ? `Foto de perfil de ${coment.nomeUsuario}`
                          : "Foto de perfil do usuário"
                      }
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                      loading="lazy"
                      decoding="async"
                      onError={(e) => {
                        e.target.onerror = null;
                        e.target.src = NoPicture;
                      }}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-base font-bold text-gray-800">
                            {coment.nomeUsuario || "Usuário"}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {coment.dataHoraCriacao
                              ? new Date(coment.dataHoraCriacao).toLocaleString(
                                  "pt-BR",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "agora"}
                          </p>
                        </div>
                        {(coment.idUsuario === usuarioLogado.id ||
                          coment.emailUsuario === usuarioLogado.email ||
                          isAdmin) && (
                          <button
                            type="button"
                            onClick={() =>
                              setModalDeletar({
                                isOpen: true,
                                comentarioId: coment.id,
                              })
                            }
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            title="Excluir comentário"
                            aria-label="Excluir este comentário"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                              aria-hidden="true"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              ></path>
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-gray-700 text-sm leading-relaxed break-words">
                        {coment.texto}
                      </div>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Modal de Confirmação de Exclusão de Comentário */}
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

        {/* Modal de Confirmação para Excluir Doação */}
        <ModalConfirmacao
          isOpen={modalDeletarDoacao}
          onClose={() => setModalDeletarDoacao(false)}
          onConfirm={handleDeletarDoacao}
          titulo="Excluir Doação"
          mensagem="Tem certeza que deseja excluir esta doação? Esta ação não pode ser desfeita."
          textoBotaoConfirmar="Excluir"
          textoBotaoCancelar="Cancelar"
          corBotaoConfirmar="#ef4444"
        />
      </div>
    </main>
  );
}
