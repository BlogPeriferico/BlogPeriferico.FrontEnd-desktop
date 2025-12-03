import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";

function SelecaoAnunciosBase({ produtos = [], loading = false }) {
  const navigate = useNavigate();
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#10B981";

  // Lista ordenada e limitada, memoizada (não recalcula à toa)
  const ultimosProdutos = useMemo(() => {
    if (!produtos || !Array.isArray(produtos)) return [];
    return [...produtos]
      .sort(
        (a, b) =>
          new Date(b.dataHoraCriacao || 0) -
          new Date(a.dataHoraCriacao || 0)
      )
      .slice(0, 16);
  }, [produtos]);

  const handleCardClick = useCallback(
    (anuncio) => {
      navigate(`/produto/${anuncio.id}`, { state: anuncio });
    },
    [navigate]
  );

  const handleCardKeyDown = useCallback(
    (event, anuncio) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleCardClick(anuncio);
      }
    },
    [handleCardClick]
  );

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderColor: corPrincipal }}
          />
          <span className="ml-3 text-gray-600">
            Carregando anúncios...
          </span>
        </div>
      ) : ultimosProdutos.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg
              className="w-12 h-12 text-gray-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhum anúncio publicado ainda
          </h3>
          <p className="text-gray-600">
            Seja o primeiro a compartilhar um achadinho da sua região!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
          {ultimosProdutos.map((anuncio, index) => {
            const precoBruto =
              anuncio.preco ?? anuncio.valor ?? null;
            const precoFormatado =
              precoBruto !== null &&
              precoBruto !== undefined &&
              String(precoBruto).trim() !== ""
                ? `R$ ${precoBruto}`
                : "Preço a combinar";

            const dataCriacao = anuncio.dataHoraCriacao
              ? new Date(anuncio.dataHoraCriacao).toLocaleString(
                  "pt-BR",
                  {
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  }
                )
              : "Hoje";

            const telefoneExibido =
              anuncio.telefone ||
              anuncio.contato ||
              anuncio.celular ||
              anuncio.whatsapp ||
              "";

            return (
              <div
                key={anuncio.id}
                onClick={() => handleCardClick(anuncio)}
                onKeyDown={(e) =>
                  handleCardKeyDown(e, anuncio)
                }
                role="button"
                tabIndex={0}
                aria-label={`Ver detalhes do produto ${anuncio.titulo}`}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer animate-slideInUp flex flex-col h-full w-full max-w-md"
                style={{
                  animationDelay: `${index * 80}ms`
                }}
              >
                {/* Imagem */}
                <div className="relative pt-[56.25%] w-full overflow-hidden flex-shrink-0">
                  <div className="absolute inset-0">
                    <img
                      src={anuncio.imagem}
                      alt={anuncio.titulo}
                      loading="lazy"
                      className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                      onError={(e) => {
                        e.currentTarget.src =
                          "https://via.placeholder.com/400x200?text=Imagem+indispon%C3%ADvel";
                      }}
                    />

                  {/* Badge de Região */}
                  <div className="absolute top-4 right-4">
                    <span
                      className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm shadow-lg border border-gray-200"
                      style={{
                        backgroundColor: `${corPrincipal}20`,
                        color: corPrincipal,
                        borderColor: corPrincipal,
                      }}
                    >
                      {anuncio.regiao || anuncio.zona || "SP"}
                    </span>
                  </div>

                  </div>
                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Conteúdo */}
                <div className="p-4 md:p-5 flex flex-col flex-grow">
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 transition-colors duration-200">
                      {anuncio.titulo}
                    </h3>

                    {anuncio.descricao && (
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                        {anuncio.descricao}
                      </p>
                    )}
                  </div>

                  {/* Metadados */}
                  <div className="space-y-2">
                    {/* Preço/Valor */}
                    <div className="flex items-center gap-2">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      <span className="text-lg font-extrabold text-green-600">
                        {precoFormatado}
                      </span>
                    </div>

                    {/* Usuário/Anunciante */}
                    {anuncio.usuario && (
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                          />
                        </svg>
                        <span className="text-sm font-medium">
                          {anuncio.usuario}
                        </span>
                      </div>
                    )}

                    {/* Metadados inferiores */}
                    <div className="flex items-end justify-between pt-4 border-t border-gray-100">
                      <div className="flex items-center gap-2">
                        <svg
                          className="w-4 h-4 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                          />
                        </svg>
                        <span className="text-sm text-gray-600 font-medium">
                          {telefoneExibido}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        <span>{dataCriacao}</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Borda hover */}
                <div
                  className="absolute inset-0 border-2 border-transparent rounded-2xl transition-all duration-300 pointer-events-none"
                  style={{ borderColor: `${corPrincipal}20` }}
                  aria-hidden="true"
                />
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default React.memo(SelecaoAnunciosBase);
