// src/pages/Perfil/Perfil.jsx
import React, { useState, useEffect, useMemo } from "react";
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
  const { user: usuarioAutenticado } = useUser();
  const { regiao } = useRegiao();

  const [abaAtiva, setAbaAtiva] = useState("noticias");
  const [perfilUsuario, setPerfilUsuario] = useState(null);
  const [postsUsuario, setPostsUsuario] = useState({
    noticias: [],
    anuncios: [],
    doacoes: [],
    vagas: [],
  });
  const [loadingPerfil, setLoadingPerfil] = useState(true);
  const [loadingPosts, setLoadingPosts] = useState(false);
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

  // total de posts (memoizado pra não recalcular sempre)
  const totalPosts = useMemo(
    () => Object.values(postsUsuario).flat().length,
    [postsUsuario]
  );

  // === Carregar perfil do usuário ===
  useEffect(() => {
    const carregarPerfil = async () => {
      try {
        setLoadingPerfil(true);
        const usuarioId = id || usuarioAutenticado?.id;

        if (!usuarioId) {
          navigate("/login", { replace: true });
          return;
        }

        const usuario = await getUsuarioPorId(usuarioId);
        setPerfilUsuario(usuario);
        setFotoAtual(usuario.fotoPerfil || NoPicture);
      } catch (error) {
        console.error("Erro ao carregar perfil:", error);
        if (!id && usuarioAutenticado) {
          navigate("/login", { replace: true });
        }
      } finally {
        setLoadingPerfil(false);
      }
    };

    carregarPerfil();
  }, [id, usuarioAutenticado, navigate]);

  // === Carregar posts do usuário conforme a aba ===
  useEffect(() => {
    if (!perfilUsuario?.id) return;

    const carregarPosts = async () => {
      setLoadingPosts(true);
      try {
        switch (abaAtiva) {
          case "noticias": {
            const noticias = await NoticiaService.listarNoticias();
            setPostsUsuario((prev) => ({
              ...prev,
              noticias: noticias.filter(
                (n) => n.idUsuario === perfilUsuario.id
              ),
            }));
            break;
          }
          case "anuncios": {
            const anuncios = await AnuncioService.getAnuncios();
            setPostsUsuario((prev) => ({
              ...prev,
              anuncios: anuncios.filter(
                (a) => a.usuarioId === perfilUsuario.id
              ),
            }));
            break;
          }
          case "doacoes": {
            const doacoes = await DoacaoService.listarDoacoes();
            setPostsUsuario((prev) => ({
              ...prev,
              doacoes: doacoes.filter((d) => d.usuarioId === perfilUsuario.id),
            }));
            break;
          }
          case "vagas": {
            const vagas = await VagaService.listarVagas();
            setPostsUsuario((prev) => ({
              ...prev,
              vagas: vagas.filter((v) => v.usuarioId === perfilUsuario.id),
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

  if (loadingPerfil && !perfilUsuario) {
    return (
      <div
        className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50"
        aria-busy="true"
        aria-live="polite"
        role="status"
      >
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
        <section
          className="text-center py-8"
          aria-label="Erro ao carregar perfil"
        >
          <h2 className="text-2xl font-bold text-gray-800 mb-4">
            Perfil não encontrado
          </h2>
          <p className="text-gray-600">
            O perfil solicitado não pôde ser carregado.
          </p>
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="mt-4 inline-flex items-center px-4 py-2 rounded-full text-white font-medium focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{ backgroundColor: corPrincipal }}
          >
            <FaArrowLeft className="mr-2" /> Voltar
          </button>
        </section>
      </main>
    );
  }

  const isMeuPerfil =
    usuarioAutenticado && perfilUsuario
      ? usuarioAutenticado.id === perfilUsuario.id
      : false;

  const isAdmin =
    usuarioAutenticado?.roles === "ROLE_ADMINISTRADOR" ||
    usuarioAutenticado?.admin === true;

  const renderizarPosts = () => {
    const posts = postsUsuario[abaAtiva] || [];

    if (loadingPosts) {
      return (
        <div
          className="flex justify-center items-center py-12"
          aria-busy="true"
          aria-live="polite"
          role="status"
        >
          <div
            className="animate-spin rounded-full h-8 w-8 border-b-2 mr-3"
            style={{ borderColor: corPrincipal }}
          ></div>
          <p className="text-gray-600">Carregando posts...</p>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <p className="text-center py-8 text-gray-500" aria-live="polite">
          Nenhum post encontrado nesta categoria
        </p>
      );
    }

    return (
      <div
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        aria-live="polite"
      >
        {posts.map((post, index) => {
          const dataBase =
            post.dataHoraCriacao ||
            post.dataCriacao ||
            new Date().toISOString();
          const dataFormatada = new Date(dataBase).toLocaleDateString("pt-BR");

          const rotaBase =
            abaAtiva === "noticias"
              ? "noticia"
              : abaAtiva === "anuncios"
              ? "produto"
              : abaAtiva === "doacoes"
              ? "doacao"
              : "vaga";

          const titulo = post.titulo || "Post";

          return (
            <Link
              key={post.id}
              to={`/${rotaBase}/${post.id}`}
              className="block group transform hover:scale-[1.02] transition-transform duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
              style={{ animationDelay: `${index * 100}ms` }}
              aria-label={`Abrir ${
                abas.find((a) => a.id === abaAtiva)?.label || "post"
              }: ${titulo}`}
            >
              <article className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 group-hover:border-gray-300">
                {post.imagem && (
                  <div className="relative overflow-hidden">
                    <img
                      src={post.imagem}
                      alt={titulo}
                      className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.src =
                          "https://via.placeholder.com/400x200?text=Imagem+indispon%C3%ADvel";
                      }}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    {(post.zona || post.categoria) && (
                      <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded-full text-xs font-semibold text-gray-800 shadow-sm">
                        {post.zona || post.categoria}
                      </div>
                    )}
                  </div>
                )}
                <div className="p-4">
                  <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                    {titulo}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
                    {post.texto || post.descricao}
                  </p>
                  <div className="text-xs text-gray-400 flex justify-end items-center">
                    <span className="bg-gray-100 px-2 py-1 rounded-full">
                      {dataFormatada}
                    </span>
                  </div>
                </div>
              </article>
            </Link>
          );
        })}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-24 px-4 md:px-8">
      <div
        className="bg-white rounded-lg shadow-xl max-w-none mx-0"
        aria-label="Perfil do usuário"
      >
        {/* Header do perfil */}
        <header className="p-8 border-b border-gray-200">
          <div className="flex flex-col md:flex-row items-center gap-8">
            {/* Foto de perfil */}
            <div className="relative flex-shrink-0">
              <img
                src={fotoAtual}
                alt={`Foto de perfil de ${perfilUsuario.nome}`}
                className="w-32 h-32 rounded-full border-4 object-cover shadow-lg"
                style={{ borderColor: corPrincipal }}
                onError={(e) => {
                  e.target.src = NoPicture;
                }}
              />
              {isMeuPerfil && (
                <div className="absolute -bottom-2 -right-2">
                  <Link
                    to="/editar-perfil"
                    className="bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200 inline-flex items-center justify-center focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                    style={{ color: corPrincipal }}
                    title="Editar perfil"
                    aria-label="Editar perfil"
                  >
                    <FaEdit />
                  </Link>
                </div>
              )}
            </div>

            {/* Infos principais */}
            <div className="text-center md:text-left flex-1 space-y-2 relative">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">
                    {perfilUsuario.nome}
                  </h1>
                  <p className="text-gray-500 text-base break-all">
                    @{perfilUsuario.username || perfilUsuario.email}
                  </p>
                </div>

                {/* Botão Admin (apenas para administradores) */}
                {isAdmin && (
                  <div className="mt-2 md:mt-0">
                    <button
                      type="button"
                      onClick={() => navigate("/admin")}
                      className="flex items-center gap-2 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 text-white rounded-full px-4 py-2 shadow-lg transition-all duration-200 border border-blue-700 hover:shadow-xl focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
                      title="Painel de Administração"
                      aria-label="Ir para o painel de administração"
                    >
                      <FaUserCog className="text-lg" />
                      <span className="text-sm font-medium">Painel Admin</span>
                    </button>
                  </div>
                )}
              </div>

              {perfilUsuario.bio && (
                <p className="text-gray-700 text-sm leading-relaxed max-w-2xl">
                  {perfilUsuario.bio}
                </p>
              )}

              <div className="flex items-center justify-center md:justify-start gap-2 mt-4">
                <FaMapMarkerAlt style={{ color: corPrincipal }} size={16} />
                <span className="text-gray-500 capitalize font-medium text-sm">
                  {regiao || "Centro"}
                </span>
              </div>
            </div>

            {/* Contador de posts */}
            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 min-w-[120px] shadow-sm border border-gray-300 mx-auto">
                <p className="text-2xl font-bold text-gray-900 mb-1 text-center">
                  {totalPosts}
                </p>
                <p className="text-gray-600 font-medium text-sm text-center">
                  Posts
                </p>
              </div>
            </div>
          </div>
        </header>

        {/* Abas e conteúdo */}
        <section aria-label="Conteúdos do perfil">
          {/* Abas */}
          <div className="bg-white border-b">
            <div
              className="flex justify-center overflow-x-auto"
              role="tablist"
              aria-label="Categorias de posts do perfil"
            >
              {abas.map((aba) => {
                const IconComponent = aba.icon;
                const isActive = abaAtiva === aba.id;
                return (
                  <button
                    key={aba.id}
                    type="button"
                    onClick={() => setAbaAtiva(aba.id)}
                    id={`tab-${aba.id}`}
                    role="tab"
                    aria-selected={isActive}
                    aria-controls={`tabpanel-${aba.id}`}
                    tabIndex={isActive ? 0 : -1}
                    className={`px-6 py-4 font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 ${
                      isActive
                        ? "border-b-2 text-gray-900 bg-gray-100"
                        : "text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-50"
                    }`}
                    style={{
                      borderColor: isActive ? aba.cor : "transparent",
                      color: isActive ? aba.cor : undefined,
                    }}
                  >
                    <IconComponent size={16} />
                    {aba.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Conteúdo das abas */}
          <div
            className="p-6 bg-white"
            role="tabpanel"
            id={`tabpanel-${abaAtiva}`}
            aria-labelledby={`tab-${abaAtiva}`}
          >
            {renderizarPosts()}
          </div>
        </section>
      </div>
    </main>
  );
}
