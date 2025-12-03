import React, { useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";

function SelecaoDoacoesBase({ doacoes = [], loading = false }) {
  const navigate = useNavigate();
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";

  const ultimasDoacoes = useMemo(() => {
    if (!doacoes || !Array.isArray(doacoes)) return [];
    return [...doacoes]
      .sort(
        (a, b) =>
          new Date(b.dataHoraCriacao || 0) -
          new Date(a.dataHoraCriacao || 0)
      )
      .slice(0, 16);
  }, [doacoes]);

  const handleCardClick = useCallback(
    (doacao) => {
      navigate(`/doacao/${doacao.id}`, { state: doacao });
    },
    [navigate]
  );

  const handleCardKeyDown = useCallback(
    (event, doacao) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        handleCardClick(doacao);
      }
    },
    [handleCardClick]
  );

  if (loading) {
    return (
      <div className="w-full">
        <div className="flex justify-center items-center py-12">
          <div
            className="animate-spin rounded-full h-12 w-12 border-b-2"
            style={{ borderColor: corPrincipal }}
          />
          <span className="ml-3 text-gray-600">
            Carregando doações...
          </span>
        </div>
      </div>
    );
  }

  if (ultimasDoacoes.length === 0) {
    return (
      <div className="w-full">
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
                d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            Nenhuma doação disponível
          </h3>
          <p className="text-gray-600">
            Seja o primeiro a oferecer algo que pode ajudar outras
            pessoas!
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-8 justify-items-center">
        {ultimasDoacoes.map((doacao, index) => {
          const dataCriacao = doacao.dataHoraCriacao
            ? new Date(doacao.dataHoraCriacao).toLocaleString("pt-BR", {
                day: "2-digit",
                month: "short",
                hour: "2-digit",
                minute: "2-digit",
              })
            : "Hoje";

          return (
            <div
              key={doacao.id}
              onClick={() => handleCardClick(doacao)}
              onKeyDown={(e) => handleCardKeyDown(e, doacao)}
              role="button"
              tabIndex={0}
              aria-label={`Ver detalhes da doação ${doacao.titulo}`}
              className="group relative bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer animate-slideInUp flex flex-col h-full w-full max-w-md"
              style={{
                animationDelay: `${index * 80}ms`,
              }}
            >
              {/* Imagem */}
              <div className="relative pt-[56.25%] w-full overflow-hidden">
                <div className="absolute inset-0">
                  <img
                    src={doacao.imagem}
                    alt={doacao.titulo}
                    className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                    onError={(e) => {
                      e.currentTarget.src =
                        "https://via.placeholder.com/400x200?text=Sem+imagem";
                    }}
                  />

                  {/* Badge da Região */}
                  {doacao.regiao && (
                    <div className="absolute top-4 right-4">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm shadow-lg border border-gray-200"
                        style={{
                          backgroundColor: `${corPrincipal}20`,
                          color: corPrincipal,
                          borderColor: corPrincipal,
                        }}
                      >
                        {doacao.regiao}
                      </span>
                    </div>
                  )}
                </div>
                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </div>

              {/* Conteúdo */}
              <div className="p-5 flex flex-col flex-grow">
                <div className="flex-grow">
                  <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 transition-colors duration-200">
                    {doacao.titulo}
                  </h3>

                  {doacao.descricao && (
                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                      {doacao.descricao}
                    </p>
                  )}
                </div>

                {/* Metadados */}
                <div className="space-y-2">
                  {doacao.categoria && (
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
                          d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                        />
                      </svg>
                      <span className="text-sm font-medium">
                        {doacao.categoria}
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
                        {doacao.telefone}
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
    </div>
  );
}

export default React.memo(SelecaoDoacoesBase);
