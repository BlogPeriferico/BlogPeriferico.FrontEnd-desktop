// src/pages/Perfil/Perfil.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { useUser } from "../../contexts/UserContext.jsx";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import {
  FaEdit,
  FaMapMarkerAlt,
  FaNewspaper,
  FaShoppingCart,
  FaHandHoldingHeart,
  FaBriefcase,
  FaArrowLeft,
  FaUserCog,
  FaSignOutAlt,
} from "react-icons/fa";

import NoticiaService from "../../services/NoticiasService";
import AnuncioService from "../../services/AnuncioService";
import DoacaoService from "../../services/DoacaoService";
import VagaService from "../../services/VagaService";
import { getUsuarioPorId } from "../../services/UsuarioService";
import NoPicture from "../../assets/images/NoPicture.webp";

export default function Perfil() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user: usuarioAutenticado, logout } = useUser();
  const { regiao } = useRegiao();

  const [abaAtiva, setAbaAtiva] = useState("noticias");
  const [perfilUsuario, setPerfilUsuario] = useState(null);
  const [postsUsuario, setPostsUsuario] = useState({
    noticias: [],
    anuncios: [],
    doacoes: [],
    vagas: [],
  });
  const [loading, setLoading] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(true);
  const [fotoAtual, setFotoAtual] = useState(NoPicture);

  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";

  const abas = [
    {
      id: "noticias",
      label: "Quebrada Informa",
      cor: corPrincipal,
      icon: FaNewspaper,
    },
    {
      id: "anuncios",
      label: "Achadinhos",
      cor: corPrincipal,
      icon: FaShoppingCart,
    },
    {
      id: "doacoes",
      label: "Mão Amiga",
      cor: corPrincipal,
      icon: FaHandHoldingHeart,
    },
    {
      id: "vagas",
      label: "Corre Certo",
      cor: corPrincipal,
      icon: FaBriefcase,
    },
  ];

  // Carregar perfil do usuário
  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        setLoading(true);

        const usuarioId = id || (usuarioAutenticado && usuarioAutenticado.id);
        if (!usuarioId) {
          window.location.href = "/login";
          return;
        }

        const usuario = await getUsuarioPorId(usuarioId);
        setPerfilUsuario(usuario);
        setFotoAtual(usuario.fotoPerfil || NoPicture);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        if (!id && usuarioAutenticado) {
          window.location.href = "/login";
        }
      } finally {
        setLoading(false);
      }
    };

    carregarPerfil();
  }, [id, usuarioAutenticado]);

  // Carregar posts do usuário
  useEffect(() => {
    if (!perfilUsuario?.id) return;

    const carregarPosts = async () => {
      setLoadingPosts(true);
      try {
        let dados = [];

        const ehMesmoUsuario = (item) => {
          const userId = Number(perfilUsuario.id);

          return (
            Number(item.idUsuario) === userId ||
            Number(item.usuarioId) === userId ||
            Number(item.usuario?.id) === userId
          );
        };

        switch (abaAtiva) {
          case "noticias": {
            dados = await NoticiaService.listarNoticias();
            setPostsUsuario((prev) => ({
              ...prev,
              noticias: (dados || []).filter(ehMesmoUsuario),
            }));
            break;
          }
          case "anuncios": {
            dados = await AnuncioService.getAnuncios();
            setPostsUsuario((prev) => ({
              ...prev,
              anuncios: (dados || []).filter(ehMesmoUsuario),
            }));
            break;
          }
          case "doacoes": {
            dados = await DoacaoService.listarDoacoes();
            setPostsUsuario((prev) => ({
              ...prev,
              doacoes: (dados || []).filter(ehMesmoUsuario),
            }));
            break;
          }
          case "vagas": {
            dados = await VagaService.listarVagas();
            setPostsUsuario((prev) => ({
              ...prev,
              vagas: (dados || []).filter(ehMesmoUsuario),
            }));
            break;
          }
          default:
            break;
        }
      } catch (error) {
        console.error("Erro ao carregar posts:", error);
      } finally {
        setLoadingPosts(false);
      }
    };

    carregarPosts();
  }, [perfilUsuario?.id, abaAtiva]);

  if (loading) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
        <div className="bg-white rounded-xl p-8 max-w-md w-full mx-4 shadow-2xl text-center">
          <div className="flex flex-col items-center justify-center">
            <div
              className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 mb-4"
              style={{ borderColor: corPrincipal }}
            ></div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Carregando perfil
            </h3>
            <p className="text-gray-600">
              Aguarde enquanto buscamos as informações...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!perfilUsuario) {
    return (
      <main className="min-h-screen bg-gray-50 pt-24 px-4 md:px-10 max-w-4xl mx-auto">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Perfil não encontrado
          </h2>
          <p className="text-gray-600">
            O perfil solicitado não pôde ser carregado.
          </p>
          <button
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center px-4 py-2 rounded-full text-white font-medium"
            style={{ backgroundColor: corPrincipal }}
          >
            <FaArrowLeft className="mr-2" /> Voltar
          </button>
        </div>
      </main>
    );
  }

  const isMeuPerfil =
    usuarioAutenticado &&
    perfilUsuario &&
    usuarioAutenticado.id === perfilUsuario.id;

  const isAdmin =
    usuarioAutenticado?.roles === "ROLE_ADMINISTRADOR" ||
    usuarioAutenticado?.admin === true;

  const renderizarPosts = () => {
    const posts = postsUsuario[abaAtiva] || [];

    if (loadingPosts) {
      return (
        <div className="flex justify-center items-center py-10">
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 mr-3"
            style={{ borderColor: corPrincipal }}
          ></div>
          <p className="text-gray-600 text-sm md:text-base">
            Carregando posts...
          </p>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <p className="text-center py-8 text-gray-500 text-sm md:text-base">
          Nenhum post encontrado nesta categoria
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 md:gap-6">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            to={`/${
              abaAtiva === "noticias"
                ? "noticia"
                : abaAtiva === "anuncios"
                ? "produto"
                : abaAtiva === "doacoes"
                ? "doacao"
                : "vaga"
            }/${post.id}`}
            className="block group transform hover:scale-[1.02] transition-transform duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 group-hover:border-gray-300">
              {post.imagem && (
                <div className="relative overflow-hidden">
                  <img
                    src={post.imagem}
                    alt={post.titulo}
                    className="w-full h-40 md:h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded-full text-[11px] md:text-xs font-semibold text-gray-800 shadow-sm">
                    {post.zona || post.regiao || post.categoria}
                  </div>
                </div>
              )}
              <div className="p-3 md:p-4">
                <h3 className="font-semibold text-sm md:text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                  {post.titulo}
                </h3>
                <p className="text-xs md:text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
                  {post.texto || post.descricao || post.descricaoCompleta}
                </p>
                <div className="text-[11px] md:text-xs text-gray-400 flex justify-end items-center">
                  <span className="bg-gray-100 px-2 py-1 rounded-full">
                    {new Date(
                      post.dataHoraCriacao || post.dataCriacao
                    ).toLocaleDateString("pt-BR")}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-24 px-3 sm:px-4 md:px-6">
      <div className="max-w-5xl mx-auto">
        <div className="bg-white rounded-lg shadow-xl w-full">
          {/* Header do perfil */}
          <div className="p-4 sm:p-6 md:p-8 border-b border-gray-200">
            <div className="flex flex-col md:flex-row items-center md:items-start gap-6 md:gap-8">
              <div className="relative flex-shrink-0">
                <img
                  src={fotoAtual}
                  alt={perfilUsuario.nome}
                  className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 rounded-full border-4 border-gray-300 object-cover shadow-lg"
                  style={{ borderColor: corPrincipal }}
                  onError={(e) => {
                    e.target.src = NoPicture;
                  }}
                />
                {isMeuPerfil && (
                  <div className="absolute -bottom-2 right-0 flex gap-2">
                    <Link
                      to="/editar-perfil"
                      className="bg-white rounded-full p-2 sm:p-2.5 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 inline-flex items-center justify-center"
                      style={{ color: corPrincipal }}
                      title="Editar perfil"
                    >
                      <FaEdit className="text-sm sm:text-base" />
                    </Link>
                    <button
                      onClick={(e) => {
                        e.preventDefault();
                        if (
                          window.confirm(
                            "Tem certeza que deseja sair da sua conta?"
                          )
                        ) {
                          logout();
                          navigate("/login");
                        }
                      }}
                      className="bg-white rounded-full p-2 sm:p-2.5 shadow-lg hover:shadow-xl transition-all duration-200 border border-red-200 inline-flex items-center justify-center text-red-500 hover:bg-red-50"
                      title="Sair da conta"
                    >
                      <FaSignOutAlt className="text-sm sm:text-base" />
                    </button>
                  </div>
                )}
              </div>

              <div className="text-center md:text-left flex-1 space-y-3 w-full">
                <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 md:gap-4">
                  <div className="w-full md:w-auto">
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 break-words">
                      {perfilUsuario.nome}
                    </h1>
                    <p className="text-gray-500 text-sm sm:text-base break-all">
                      @{perfilUsuario.username || perfilUsuario.email}
                    </p>
                  </div>

                  {isAdmin && (
                    <div className="mt-2 md:mt-0 w-full md:w-auto flex justify-center md:justify-end">
                      <button
                        onClick={() => navigate("/admin")}
                        className="flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-full px-4 py-2 text-sm shadow-lg transition-all duration-200 border border-blue-700 hover:shadow-xl"
                        title="Painel de Administração"
                      >
                        <FaUserCog className="text-base" />
                        <span className="font-medium">Painel Admin</span>
                      </button>
                    </div>
                  )}
                </div>

                {perfilUsuario.biografia ? (
                  <div className="mt-2 w-full">
                    <p className="text-gray-700 text-sm sm:text-base leading-relaxed whitespace-pre-line">
                      {perfilUsuario.biografia}
                    </p>
                  </div>
                ) : (
                  <div className="flex items-center justify-center md:justify-start gap-2 mt-2">
                    <FaMapMarkerAlt
                      style={{ color: corPrincipal }}
                      size={16}
                    />
                    <span className="text-gray-500 capitalize font-medium text-sm">
                      {regiao || "Centro"}
                    </span>
                  </div>
                )}
              </div>

              <div className="flex md:flex-col items-center md:items-end gap-3">
                <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 sm:p-5 min-w-[100px] shadow-sm border border-gray-300 mx-auto md:mx-0">
                  <p className="text-xl sm:text-2xl font-bold text-gray-900 mb-1 text-center">
                    {Object.values(postsUsuario).flat().length}
                  </p>
                  <p className="text-gray-600 font-medium text-xs sm:text-sm text-center">
                    Posts
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Abas estilo Instagram */}
          <div className="bg-white">
            <div className="border-b border-gray-200">
              <div className="flex justify-center">
                <div className="flex w-full max-w-xs sm:max-w-sm justify-between">
                  {abas.map((aba) => {
                    const IconComponent = aba.icon;
                    const isAtiva = abaAtiva === aba.id;
                    return (
                      <button
                        key={aba.id}
                        onClick={() => setAbaAtiva(aba.id)}
                        className={`
                          flex flex-col items-center justify-center 
                          flex-1 py-3
                          text-xl
                          transition-all duration-200
                        `}
                        style={{
                          color: isAtiva ? aba.cor : "#9CA3AF",
                          borderBottomWidth: 2,
                          borderBottomColor: isAtiva
                            ? aba.cor
                            : "transparent",
                        }}
                        aria-label={aba.label}
                        title={aba.label}
                      >
                        <IconComponent />
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Conteúdo das abas */}
            <div className="p-4 sm:p-5 md:p-6 bg-white">
              {renderizarPosts()}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}