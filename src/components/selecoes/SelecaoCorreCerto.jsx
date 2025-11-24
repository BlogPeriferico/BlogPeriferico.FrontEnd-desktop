import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";

function SelecaoCorreCertoBase({ correcertos = [], loading = false }) {
  const navigate = useNavigate();
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#3B82F6";

  const ultimasVagas = useMemo(() => {
    if (!correcertos || !Array.isArray(correcertos)) return [];
    return [...correcertos]
      .sort(
        (a, b) =>
          new Date(b.dataHoraCriacao || 0) -
          new Date(a.dataHoraCriacao || 0)
      )
      .slice(0, 16);
  }, [correcertos]);

  const handleCardClick = useCallback(
    (vaga) => {
      navigate(`/vaga/${vaga.id}`, { state: vaga });
    },
    [navigate]
  );

  const handleCardKeyDown = useCallback(
    (event, vaga) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleCardClick(vaga);
      }
    },
    [handleCardClick]
  );

  return (
    <div className="w-full">
      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderColor: corPrincipal }}
          />
          <span className="ml-3 text-gray-600">
            Carregando vagas...
          </span>
        </div>
      ) : ultimasVagas.length === 0 ? (
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
                d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M12 18h.01M12 15a3 3 0 100-6 3 3 0 000 6z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhuma vaga publicada ainda
          </h3>
          <p className="text-gray-600">
            Seja o primeiro a compartilhar uma vaga da sua região!
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
          {ultimasVagas.map((vaga, index) => {
            const dataCriacao = vaga.dataHoraCriacao
              ? new Date(vaga.dataHoraCriacao).toLocaleString("pt-BR", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })
              : "Hoje";

            return (
              <div
                key={vaga.id}
                onClick={() => handleCardClick(vaga)}
                onKeyDown={(e) => handleCardKeyDown(e, vaga)}
                role="button"
                tabIndex={0}
                aria-label={`Ver detalhes da vaga ${vaga.titulo}`}
                className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer animate-slideInUp"
                style={{
                  animationDelay: `${index * 80}ms`,
                  width: "100%",
                  maxWidth: "320px",
                  height: "420px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {/* Imagem */}
                <div className="relative h-48 w-full overflow-hidden flex-shrink-0">
                  <img
                    src={vaga.imagem}
                    alt={vaga.titulo}
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
                      {vaga.regiao || vaga.zona || "SP"}
                    </span>
                  </div>

                  {/* Overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Conteúdo */}
                <div
                  className="p-6 flex flex-col"
                  style={{ height: "172px", flex: 1 }}
                >
                  <div className="flex-grow">
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 transition-colors duration-200">
                      {vaga.titulo}
                    </h3>

                    {vaga.descricao && (
                      <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                        {vaga.descricao}
                      </p>
                    )}
                  </div>

                  {/* Metadados */}
                  <div className="space-y-2">
                    {vaga.usuario && (
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
                          {vaga.usuario}
                        </span>
                      </div>
                    )}

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
                          {vaga.telefone}
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

export default React.memo(SelecaoCorreCertoBase);
