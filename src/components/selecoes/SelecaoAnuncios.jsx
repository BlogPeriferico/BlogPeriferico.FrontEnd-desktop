import React from "react";
import { useNavigate } from "react-router-dom";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";

export default function SelecaoAnuncios({ produtos = [], loading = false }) {
  const navigate = useNavigate();
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#10B981";

  // Removido retorno incorreto: quando não está carregando e não há itens, deve mostrar estado vazio, não 'Carregando'

  // Ordenar por data de criação (mais recentes primeiro) e limitar a 16 itens
  // Usa cópia para não mutar a prop `produtos` (evita problemas de re-render)
  const ultimosProdutos = [...produtos]
    .sort((a, b) => new Date(b.dataHoraCriacao) - new Date(a.dataHoraCriacao))
    .slice(0, 16);

  return (
    <div className="w-full">

      {loading ? (
        <div className="flex justify-center items-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2" style={{ borderColor: corPrincipal }}></div>
          <span className="ml-3 text-gray-600">Carregando anúncios...</span>
        </div>
      ) : ultimosProdutos.length === 0 ? (
        <div className="text-center py-12">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">Nenhum anúncio publicado ainda</h3>
          <p className="text-gray-600">Seja o primeiro a compartilhar um achadinho da sua região!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8 justify-items-center">
          {ultimosProdutos.map((anuncio) => (
            <div
              key={anuncio.id}
              onClick={() => navigate(`/produto/${anuncio.id}`, { state: anuncio })}
              className="group bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-2 border border-gray-100 overflow-hidden cursor-pointer animate-slideInUp"
              style={{
                animationDelay: `${anuncio.id * 100}ms`,
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
                  src={anuncio.imagem}
                  alt={anuncio.titulo}
                  className="w-full h-full object-cover object-center group-hover:scale-110 transition-transform duration-500"
                  onError={(e) => {
                    e.target.src = "https://via.placeholder.com/400x200?text=Imagem+indisponível";
                  }}
                />

                {/* Badge de Região */}
                <div className="absolute top-4 right-4">
                  <span 
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium backdrop-blur-sm shadow-lg border border-gray-200"
                    style={{ 
                      backgroundColor: `${corPrincipal}20`,
                      color: corPrincipal,
                      borderColor: corPrincipal
                    }}
                  >
                    {regiao || anuncio.zona || "SP"}
                  </span>
                </div>

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              </div>

              {/* Conteúdo */}
              <div className="p-6 flex flex-col" style={{ height: "172px", flex: "1" }}>
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                    </svg>
                    <span className="text-lg font-extrabold text-green-600">
                      {(anuncio.preco ?? anuncio.valor) !== undefined && (anuncio.preco ?? anuncio.valor) !== null && String(anuncio.preco ?? anuncio.valor) !== ""
                        ? `R$ ${anuncio.preco ?? anuncio.valor}`
                        : "Preço a combinar"}
                    </span>
                  </div>

                  {/* Usuário/Anunciante */}
                  {anuncio.usuario && (
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path>
                      </svg>
                      <span className="text-sm font-medium">{anuncio.usuario}</span>
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
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                        ></path>
                      </svg>
                      <span className="text-sm text-gray-600 font-medium">
                        {anuncio.telefone || anuncio.contato || anuncio.celular || anuncio.whatsapp}
                      </span>
                    </div>

                    <div className="flex items-center gap-1 text-xs text-gray-400">
                      <svg
                        className="w-4 h-4"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                        ></path>
                      </svg>
                      <span>
                        {anuncio.dataHoraCriacao
                          ? new Date(anuncio.dataHoraCriacao).toLocaleString(
                              "pt-BR",
                              {
                                day: "2-digit",
                                month: "short",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )
                          : "Hoje"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Efeito Hover */}
              <div
                className="absolute inset-0 border-2 border-transparent rounded-2xl transition-all duration-300 pointer-events-none"
                style={{ borderColor: `${corPrincipal}20` }}
              ></div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
