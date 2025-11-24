// src/components/PostSearchResults.jsx
import React from "react";
import { Link } from "react-router-dom";
import {
  FaSpinner,
  FaNewspaper,
  FaHandHoldingHeart,
  FaBriefcase,
  FaSearch,
  FaRegComment,
} from "react-icons/fa";
import { regionColors } from "../utils/regionColors";
import NoPicture from "../assets/images/NoPicture.webp";

const PostSearchResults = ({ results, onClose, isLoading = false }) => {
  const getPostTypeInfo = (tipo) => {
    switch (tipo) {
      case "noticia":
        return {
          icon: <FaNewspaper className="text-blue-500" />,
          color: "bg-blue-100 text-blue-800",
          label: "Notícia",
          bgColor: "bg-blue-50",
          borderColor: "border-blue-200",
        };
      case "doacao":
        return {
          icon: <FaHandHoldingHeart className="text-green-600" />,
          color: "bg-green-100 text-green-800",
          label: "Doação",
          bgColor: "bg-green-50",
          borderColor: "border-green-200",
        };
      case "vaga":
        return {
          icon: <FaBriefcase className="text-purple-600" />,
          color: "bg-purple-100 text-purple-800",
          label: "Vaga",
          bgColor: "bg-purple-50",
          borderColor: "border-purple-200",
        };
      case "achadinho":
        return {
          icon: <FaSearch className="text-yellow-600" />,
          color: "bg-yellow-100 text-yellow-800",
          label: "Achadinho",
          bgColor: "bg-yellow-50",
          borderColor: "border-yellow-200",
        };
      case "venda":
        return {
          icon: <FaSearch className="text-amber-600" />,
          color: "bg-amber-100 text-amber-800",
          label: "Venda",
          bgColor: "bg-amber-50",
          borderColor: "border-amber-200",
        };
      default:
        return {
          icon: <FaNewspaper className="text-gray-500" />,
          color: "bg-gray-100 text-gray-800",
          label: "Post",
          bgColor: "bg-gray-50",
          borderColor: "border-gray-200",
        };
    }
  };

  const formatPostDate = (dateString) => {
    if (!dateString) return "Data não informada";

    try {
      const date = new Date(dateString);
      if (Number.isNaN(date.getTime())) return "Data inválida";

      const dateStr = date.toLocaleDateString("pt-BR");
      const timeStr = date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });

      return `Publicado em ${dateStr} às ${timeStr}`;
    } catch {
      return "Data inválida";
    }
  };

  const getPostUrl = (post) => {
    const tipo = (post.tipo || post.tipoPost || "").toLowerCase();
    const id = post.id;

    if (!id) {
      return "/";
    }

    switch (tipo) {
      case "noticia":
        return `/noticia/${id}`;
      case "doacao":
        return `/doacao/${id}`;
      case "vaga":
        return `/vaga/${id}`;
      case "achadinho":
      case "venda":
        return `/produto/${id}`;
      default:
        return "/";
    }
  };

  const getFirstParagraph = (html) => {
    if (!html) return "";
    try {
      let text = html.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
      if (text.length <= 150) return text;
      return `${text.substring(0, 150)}...`;
    } catch {
      return "";
    }
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <FaSpinner className="animate-spin text-3xl mb-3 text-blue-500" />
        <span className="text-sm font-medium">Buscando posts...</span>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-300 mb-3">
          <svg
            className="w-16 h-16 mx-auto"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 
              11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <p className="text-gray-500 font-medium text-lg">
          Nenhum post encontrado
        </p>
        <p className="text-sm text-gray-400 mt-1">
          Tente outros termos de busca
        </p>
      </div>
    );
  }

  return (
    <div
      className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2"
      role="list"
      aria-label="Resultados de busca de posts"
    >
      {results.map((post) => {
        const tipo = post.tipo || post.tipoPost;
        const typeInfo = getPostTypeInfo(tipo);
        const postImage =
          post.imagemCapa || post.imagem || post.urlImagem || NoPicture;

        const postDate =
          post.dataPublicacao ||
          post.dataHoraCriacao ||
          post.dataCriacao ||
          post.criadoEm ||
          post.createdAt ||
          new Date().toISOString();

        const postDescription =
          post.descricao ||
          post.resumo ||
          getFirstParagraph(
            post.texto ||
              post.conteudo ||
              post.descricaoLonga ||
              "" // fallback
          );

        const postRegion =
          post.regiao || post.local || post.zona || post.cidade || "";
        const regionKey = postRegion?.toLowerCase();
        const regionPalette = regionKey ? regionColors[regionKey] : null;

        const postComments =
          (Array.isArray(post.comentarios) && post.comentarios.length) ||
          post.numeroComentarios ||
          post.comments ||
          0;

        return (
          <Link
            key={`${tipo || "post"}-${post.id}`}
            to={getPostUrl(post)}
            role="listitem"
            className={`block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${typeInfo.bgColor} ${typeInfo.borderColor} border`}
            onClick={(e) => {
              if (!post.id || (!post.tipo && !post.tipoPost)) {
                e.preventDefault();
                return;
              }
              onClose?.();
              window.scrollTo({ top: 0, behavior: "smooth" });
            }}
          >
            <div className="flex flex-col h-full">
              {/* Imagem de capa */}
              <div className="relative h-40 bg-gray-100 overflow-hidden">
                <img
                  src={postImage}
                  alt={post.titulo || "Post"}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  loading="lazy"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = NoPicture;
                  }}
                />

                {/* Badge tipo */}
                <div
                  className={`absolute top-2 left-2 ${typeInfo.color} text-xs font-medium px-2 py-1 rounded-full flex items-center`}
                >
                  {typeInfo.icon}
                  <span className="ml-1">{typeInfo.label}</span>
                </div>

                {/* Região */}
                {postRegion && (
                  <div
                    className="absolute top-2 right-2 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md"
                    style={{
                      backgroundColor:
                        regionPalette?.[0] || "rgba(0,0,0,0.8)",
                      border: `1px solid ${
                        regionPalette?.[1] || "rgba(255,255,255,0.3)"
                      }`,
                      textTransform: "capitalize",
                      fontWeight: 600,
                      letterSpacing: "0.3px",
                    }}
                  >
                    {postRegion.toLowerCase()}
                  </div>
                )}
              </div>

              {/* Conteúdo */}
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                  {post.titulo}
                </h3>

                {postDescription && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {postDescription}
                  </p>
                )}

                <div className="mt-auto pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">
                      {formatPostDate(postDate)}
                    </span>

                    {postComments > 0 && (
                      <span className="flex items-center text-xs text-gray-500">
                        <FaRegComment className="mr-1" aria-hidden="true" />
                        <span>{postComments}</span>
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default React.memo(PostSearchResults);
