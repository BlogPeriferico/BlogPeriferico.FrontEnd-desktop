import React, { useState, useEffect, useMemo } from "react";
import { DoacaoData } from "../../data/DoacaoData";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import "../../styles/carrossel-responsive.css";

export default function CarrosselDoacao() {
  const doacoes = useMemo(() => DoacaoData.slice(0, 3), []);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = doacoes.length;
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";
  const corSecundaria = regionColors[regiao]?.[1] || "#3B82F6";

  const proximo = () => setIndex((prev) => (prev + 1) % total);
  const anterior = () => setIndex((prev) => (prev - 1 + total) % total);

  useEffect(() => {
    if (isPaused || total <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 10000); // rotação a cada 10s

    return () => clearInterval(interval);
  }, [total, isPaused]);

  const handleKeyNavigation = (event) => {
    if (event.key === "ArrowRight") {
      proximo();
    } else if (event.key === "ArrowLeft") {
      anterior();
    }
  };

  return (
    <section
      className="carrossel-container relative w-full bg-[#F5F5F5] shadow-lg overflow-hidden py-8 px-6"
      aria-roledescription="carrossel"
      aria-label="Destaques de doações"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyNavigation}
    >
      {/* Botões */}
      <button
        type="button"
        onClick={anterior}
        className="carrossel-nav-button absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
        aria-label="Ver doação anterior"
      >
        <FiChevronLeft className="w-6 h-6 md:w-6 md:h-6" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={proximo}
        className="carrossel-nav-button absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
        aria-label="Ver próxima doação"
      >
        <FiChevronRight className="w-6 h-6 md:w-6 md:h-6" aria-hidden="true" />
      </button>

      {/* Slides */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${index * (100 / total)}%)`,
            width: `${total * 100}%`,
          }}
          role="list"
        >
          {doacoes.map((doacao, i) => {
            const isActive = i === index;

            return (
              <article
                key={doacao.id || i}
                className="flex flex-col md:flex-row items-center justify-between px-10 md:px-15 flex-shrink-0"
                style={{ width: `${100 / total}%` }}
                role="listitem"
                aria-roledescription="slide"
                aria-label={`Slide ${i + 1} de ${total}`}
                aria-hidden={!isActive}
              >
                {/* Texto */}
                <div
                  className="flex-1 space-y-4 md:pr-10"
                  aria-live={isActive ? "polite" : "off"}
                >
                  <h2 className="text-4xl font-bold text-gray-900">
                    {doacao.titulo}
                  </h2>
                  <p className="text-gray-600 text-lg font-medium">
                    {doacao.descricao}
                  </p>
                  <a
                    href={`https://wa.me/55${doacao.telefone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
                    style={{ backgroundColor: corPrincipal }}
                    aria-label={`Fazer doação para ${doacao.titulo} pelo WhatsApp`}
                  >
                    FAÇA SUA DOAÇÃO
                    <span className="text-lg" aria-hidden="true">
                      →
                    </span>
                  </a>
                </div>

                {/* Imagem */}
                <div className="flex-1 mt-8 md:mt-34 flex justify-center items-center">
                  <div className="carrossel-image-container relative w-[200px] h-[200px] md:w-[280px] md:h-[280px] flex items-center justify-center">
                    <img
                      src={doacao.imagem}
                      alt={`${doacao.titulo} - imagem ilustrativa`}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />

                    {/* Badge da Região */}
                    {doacao.regiao && (
                      <div className="absolute top-0 right-0">
                        <span
                          className="inline-flex items-center px-2 py-0.5 md:px-3 md:py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200"
                          style={{
                            backgroundColor: `${corPrincipal}20`,
                            color: corPrincipal,
                            borderColor: corPrincipal,
                            fontSize: '0.7rem',
                            lineHeight: '1'
                          }}
                        >
                          {doacao.regiao}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Indicadores */}
      <div
        className="carrossel-indicators flex justify-center mt-8 gap-2"
        role="tablist"
        aria-label="Seleção de slide de doações"
      >
        {doacoes.map((_, i) => {
          const isActive = i === index;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`carrossel-indicator transition-all h-2 rounded-full ${
                isActive ? "w-8 active" : "w-4"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800`}
              style={{
                backgroundColor: isActive ? corSecundaria : "#ccc",
                border: "none",
                cursor: "pointer",
                outline: "none",
              }}
              aria-label={`Ir para o slide ${i + 1}`}
              aria-current={isActive ? "true" : "false"}
            />
          );
        })}
      </div>
    </section>
  );
}
