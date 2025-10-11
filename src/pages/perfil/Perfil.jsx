import React, { useState, useEffect } from "react";
import { useUser } from "../../contexts/UserContext.jsx";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import { FaEdit, FaMapMarkerAlt } from "react-icons/fa";
import { Link } from "react-router-dom";
import NoticiaService from "../../services/NoticiasService";
import AnuncioService from "../../services/AnuncioService";
import DoacaoService from "../../services/DoacaoService";
import VagaService from "../../services/VagaService";
import { jwtDecode } from "jwt-decode";
import api from "../../services/Api";

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

  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";
  const abas = [
    { id: "noticias", label: "Quebrada Informa", cor: corPrincipal },
    { id: "anuncios", label: "Achadinhos", cor: corPrincipal },
    { id: "doacoes", label: "Mão Amiga", cor: corPrincipal },
    { id: "vagas", label: "Corre Certo", cor: corPrincipal }
  ];

  // Carregar perfil do usuário logado
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
          const response = await api.get("/usuarios/listar");
          const usuarios = response.data;
          const usuarioEncontrado = usuarios.find((u) => u.email === email);

          if (usuarioEncontrado) {
            setUsuarioLogado(usuarioEncontrado);
            console.log("✅ Usuário encontrado:", usuarioEncontrado);
          } else {
            console.error("⚠️ Usuário não encontrado na lista");
          }
        } catch (err) {
          console.error("❌ Erro ao buscar lista de usuários:", err);
        }
      } catch (err) {
        console.error("❌ Erro geral ao carregar perfil:", err);
      }
    };
    carregarPerfil();
  }, []);

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
      <main className="min-h-screen bg-gray-50 pt-24 px-4 md:px-10 max-w-6xl mx-auto">
        <div className="text-center py-8">
          <p className="text-gray-600">Carregando perfil...</p>
        </div>
      </main>
    );
  }

  const renderizarPosts = () => {
    const posts = postsUsuario[abaAtiva] || [];

    if (loading) {
      return <p className="text-center py-8">Carregando...</p>;
    }

    if (posts.length === 0) {
      return (
        <p className="text-center py-8 text-gray-500">
          Nenhum post encontrado nesta categoria
        </p>
      );
    }

    return (
      <div className="space-y-4">
        {posts.map((post) => (
          <Link
            key={post.id}
            to={`/${abaAtiva === "noticias" ? "noticia" :
                  abaAtiva === "anuncios" ? "produto" :
                  abaAtiva === "doacoes" ? "doacao" : "vaga"}/${post.id}`}
            className="block"
          >
            <div className="bg-white rounded-lg shadow-md p-4 hover:shadow-lg transition-shadow">
              <div className="flex gap-4">
                {post.imagem && (
                  <img
                    src={post.imagem}
                    alt={post.titulo}
                    className="w-20 h-20 object-cover rounded-md"
                  />
                )}
                <div className="flex-1">
                  <h3 className="font-semibold text-lg text-gray-900">
                    {post.titulo}
                  </h3>
                  <p className="text-sm text-gray-600 line-clamp-2">
                    {post.texto || post.descricao}
                  </p>
                  <div className="text-xs text-gray-400 mt-2 flex justify-between items-center">
                    <span>{post.zona || post.categoria}</span>
                    <span>
                      {new Date(post.dataHoraCriacao || post.dataCriacao).toLocaleDateString("pt-BR")}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    );
  };

  return (
    <main className="min-h-screen bg-gray-50 pt-24 px-4 md:px-10 max-w-6xl mx-auto">
      {/* Header do perfil */}
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="relative">
            <img
              src={usuarioLogado.fotoPerfil || "https://i.pravatar.cc/150"}
              alt={usuarioLogado.nome}
              className="w-24 h-24 rounded-full border-4 border-gray-200"
              style={{ borderColor: corPrincipal }}
            />
            <Link
              to="/editar-perfil"
              className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 shadow-md hover:shadow-lg transition-shadow"
              style={{ color: corPrincipal }}
            >
              <FaEdit size={16} />
            </Link>
          </div>

          <div className="text-center md:text-left flex-1">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {usuarioLogado.nome}
            </h1>
            <p className="text-gray-600 mb-2">{usuarioLogado.email}</p>
            <div className="flex items-center justify-center md:justify-start gap-2">
              <FaMapMarkerAlt style={{ color: corPrincipal }} />
              <span className="text-sm text-gray-500 capitalize">
                {regiao || "Centro"}
              </span>
            </div>
          </div>

          <div className="text-center">
            <div className="bg-gray-100 rounded-lg p-4 min-w-[120px]">
              <p className="text-2xl font-bold" style={{ color: corPrincipal }}>
                {Object.values(postsUsuario).flat().length}
              </p>
              <p className="text-sm text-gray-600">Posts Totais</p>
            </div>
          </div>
        </div>
      </div>

      {/* Abas */}
      <div className="bg-white rounded-lg shadow-md">
        <div className="border-b">
          <div className="flex">
            {abas.map((aba) => (
              <button
                key={aba.id}
                onClick={() => setAbaAtiva(aba.id)}
                className={`px-6 py-4 font-medium transition-colors ${
                  abaAtiva === aba.id
                    ? "border-b-2 text-gray-900"
                    : "text-gray-500 hover:text-gray-700"
                }`}
                style={{
                  borderColor: abaAtiva === aba.id ? aba.cor : "transparent",
                  color: abaAtiva === aba.id ? aba.cor : undefined
                }}
              >
                {aba.label}
              </button>
            ))}
          </div>
        </div>

        {/* Conteúdo das abas */}
        <div className="p-6">
          {renderizarPosts()}
        </div>
      </div>
    </main>
  );
}
