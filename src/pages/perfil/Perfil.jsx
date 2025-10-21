
import React, { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext.jsx";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import { FaEdit, FaMapMarkerAlt, FaNewspaper, FaShoppingCart, FaHandHoldingHeart, FaBriefcase } from "react-icons/fa";
import { Link } from "react-router-dom";
import NoticiaService from "../../services/NoticiasService";
import AnuncioService from "../../services/AnuncioService";
import DoacaoService from "../../services/DoacaoService";
import VagaService from "../../services/VagaService";
import api from "../../services/Api";
import NoPicture from "../../assets/images/NoPicture.webp";

export default function Perfil() {
  const { user } = useUser();
  const { regiao } = useRegiao();
  const [abaAtiva, setAbaAtiva] = useState("noticias");
  const [postsUsuario, setPostsUsuario] = useState({
    noticias: [],
    anuncios: [],
    doacoes: [],
    vagas: []
  });
  const [loading, setLoading] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [fotoAtual, setFotoAtual] = useState(NoPicture);

  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";
  const abas = [
    { id: "noticias", label: "Quebrada Informa", cor: corPrincipal, icon: FaNewspaper },
    { id: "anuncios", label: "Achadinhos", cor: corPrincipal, icon: FaShoppingCart },
    { id: "doacoes", label: "Mão Amiga", cor: corPrincipal, icon: FaHandHoldingHeart },
    { id: "vagas", label: "Corre Certo", cor: corPrincipal, icon: FaBriefcase }
  ];

  // Carregar perfil do usuário usando UserContext
  useEffect(() => {
    if (user && user.id) {
      setUsuarioLogado(user);
    }
  }, [user]);

  // Atualiza a foto quando o usuarioLogado mudar
  useEffect(() => {
    if (usuarioLogado?.fotoPerfil) {
      setFotoAtual(usuarioLogado.fotoPerfil);
    } else {
      setFotoAtual(NoPicture);
    }
  }, [usuarioLogado?.fotoPerfil]);

  useEffect(() => {
    if (usuarioLogado?.id) {
      carregarPostsUsuario();
    }
  }, [usuarioLogado?.id, abaAtiva]);

  const carregarPostsUsuario = async () => {
    if (!usuarioLogado?.id) return;

    setLoading(true);
    try {
      switch (abaAtiva) {
        case "noticias":
          const noticias = await NoticiaService.listarNoticias();
          setPostsUsuario(prev => ({
            ...prev,
            noticias: noticias.filter(n => n.idUsuario === usuarioLogado.id)
          }));
          break;
        case "anuncios":
          const anuncios = await AnuncioService.getAnuncios();
          setPostsUsuario(prev => ({
            ...prev,
            anuncios: anuncios.filter(a => a.usuarioId === usuarioLogado.id)
          }));
          break;
        case "doacoes":
          const doacoes = await DoacaoService.listarDoacoes();
          setPostsUsuario(prev => ({
            ...prev,
            doacoes: doacoes.filter(d => d.usuarioId === usuarioLogado.id)
          }));
          break;
        case "vagas":
          const vagas = await VagaService.listarVagas();
          setPostsUsuario(prev => ({
            ...prev,
            vagas: vagas.filter(v => v.usuarioId === usuarioLogado.id)
          }));
          break;
        default:
          break;
      }
    } catch (error) {
      console.error("Erro ao carregar posts:", error);
    } finally {
      setLoading(false);
    }
  };

  if (!usuarioLogado) {
    return (
      <main className="min-h-screen bg-gray-50 pt-24 px-4 md:px-10 max-w-4xl mx-auto">
        <div className="text-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mx-auto mb-4" style={{ borderColor: corPrincipal }}></div>
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </main>
    );
  }

  const renderizarPosts = () => {
    const posts = postsUsuario[abaAtiva] || [];

    if (loading) {
      return (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 mr-3" style={{ borderColor: corPrincipal }}></div>
          <p className="text-gray-600">Carregando posts...</p>
        </div>
      );
    }

    if (posts.length === 0) {
      return (
        <p className="text-center py-8 text-gray-500">
          Nenhum post encontrado nesta categoria
        </p>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post, index) => (
          <Link
            key={post.id}
            to={`/${abaAtiva === "noticias" ? "noticia" :
                  abaAtiva === "anuncios" ? "produto" :
                  abaAtiva === "doacoes" ? "doacao" : "vaga"}/${post.id}`}
            className="block group transform hover:scale-[1.02] transition-transform duration-300"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-200 group-hover:border-gray-300">
              {post.imagem && (
                <div className="relative overflow-hidden">
                  <img
                    src={post.imagem}
                    alt={post.titulo}
                    className="w-full h-48 object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-2 left-2 bg-white/90 px-2 py-1 rounded-full text-xs font-semibold text-gray-800 shadow-sm">
                    {post.zona || post.categoria}
                  </div>
                </div>
              )}
              <div className="p-4">
                <h3 className="font-semibold text-base text-gray-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors duration-200">
                  {post.titulo}
                </h3>
                <p className="text-sm text-gray-600 line-clamp-2 leading-relaxed mb-3">
                  {post.texto || post.descricao}
                </p>
                <div className="text-xs text-gray-400 flex justify-end items-center">
                  <span className="bg-gray-100 px-2 py-1 rounded-full">
                    {new Date(post.dataHoraCriacao || post.dataCriacao).toLocaleDateString("pt-BR")}
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
    <main className="min-h-screen bg-gray-50 pt-24 px-4 md:px-8">
      {/* Header e Abas juntos */}
      <div className="bg-white rounded-lg shadow-xl max-w-none mx-0">
        {/* Header do perfil */}
        <div className="p-8 border-b border-gray-200">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <div className="relative flex-shrink-0">
              <img
                src={fotoAtual}
                alt={usuarioLogado.nome}
                className="w-32 h-32 rounded-full border-4 border-gray-300 object-cover shadow-lg"
                style={{ borderColor: corPrincipal }}
                onError={(e) => {
                  e.target.src = NoPicture;
                }}
              />
              <Link
                to="/editar-perfil"
                className="absolute -bottom-2 -right-2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-200 border border-gray-200"
                style={{ color: corPrincipal }}
              >
                <FaEdit size={18} />
              </Link>
            </div>

            <div className="text-center md:text-left flex-1 space-y-2">
              <h1 className="text-3xl font-bold text-gray-900">
                {usuarioLogado.nome}
              </h1>
              <p className="text-gray-500 text-base">@{usuarioLogado.username || usuarioLogado.email}</p>
              {usuarioLogado.bio && (
                <p className="text-gray-700 text-sm leading-relaxed max-w-md">{usuarioLogado.bio}</p>
              )}
              <div className="flex items-center justify-center md:justify-start gap-2 mt-4">
                <FaMapMarkerAlt style={{ color: corPrincipal }} size={16} />
                <span className="text-gray-500 capitalize font-medium text-sm">
                  {regiao || "Centro"}
                </span>
              </div>
            </div>

            <div className="flex flex-col items-center space-y-4">
              <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-6 min-w-[120px] shadow-sm border border-gray-300 mx-auto">
                <p className="text-2xl font-bold text-gray-900 mb-1 text-center">
                  {Object.values(postsUsuario).flat().length}
                </p>
                <p className="text-gray-600 font-medium text-sm text-center">Posts</p>
              </div>
            </div>
          </div>
        </div>

        {/* Abas */}
        <div className="bg-white">
          <div className="border-b">
            <div className="flex justify-center overflow-x-auto">
              {abas.map((aba) => {
                const IconComponent = aba.icon;
                return (
                  <button
                    key={aba.id}
                    onClick={() => setAbaAtiva(aba.id)}
                    className={`px-6 py-4 font-medium transition-all duration-200 flex items-center gap-2 whitespace-nowrap ${abaAtiva === aba.id
                        ? "border-b-2 text-gray-900 bg-gray-100"
                        : "text-gray-600 hover:text-gray-800 bg-white hover:bg-gray-50"
                    }`}
                    style={{
                      borderColor: abaAtiva === aba.id ? aba.cor : "transparent",
                      color: abaAtiva === aba.id ? aba.cor : undefined
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
          <div className="p-6 bg-white">
            {loading ? (
              <div className="flex justify-center items-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: corPrincipal }}></div>
                <p className="ml-4 text-gray-600">Carregando posts...</p>
              </div>
            ) : (
              renderizarPosts()
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
