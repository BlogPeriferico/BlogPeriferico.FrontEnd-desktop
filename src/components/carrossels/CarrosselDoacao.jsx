import React, { useState, useEffect, useCallback } from "react";
import { DoacaoData } from "../../data/DoacaoData";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";

export default function CarrosselDoacao() {
  const doacoes = DoacaoData.slice(0, 3);
  const [index, setIndex] = useState(0);
  const total = doacoes.length;

  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";
  const corSecundaria = regionColors[regiao]?.[1] || "#3B82F6";

  const proximo = useCallback(
    () => setIndex((prev) => (prev + 1) % total),
    [total]
  );

  const anterior = useCallback(
    () => setIndex((prev) => (prev - 1 + total) % total),
    [total]
  );

  // Rotação automática a cada 10s
  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 10000);

    return () => clearInterval(interval);
  }, [total]);

  // Navegação por teclado (setas ← →)
  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      proximo();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      anterior();
    }
  };

  const carrosselId = "carrossel-doacao-slides";

  return (
    <section
      className="relative w-full bg-[#F5F5F5] shadow-lg overflow-hidden py-8 px-6"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Campanhas de doação em destaque"
    >
      {/* Título apenas para leitores de tela */}
      <h2 className="sr-only">Doações da comunidade</h2>

      {/* Botões de navegação */}
      <button
        type="button"
        onClick={anterior}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
        aria-label="Ver doação anterior"
        aria-controls={carrosselId}
      >
        <FiChevronLeft size={24} aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={proximo}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
        aria-label="Ver próxima doação"
        aria-controls={carrosselId}
      >
        <FiChevronRight size={24} aria-hidden="true" />
      </button>

      {/* Área de slides – focável pra navegação por teclado */}
      <div
        className="overflow-hidden outline-none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Use as setas do teclado para navegar pelas doações"
      >
        <div
          id={carrosselId}
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${index * (100 / total)}%)`,
            width: `${total * 100}%`,
          }}
          aria-live="polite"
        >
          {doacoes.map((doacao, i) => (
            <article
              key={doacao.id ?? i}
              className="flex flex-col md:flex-row items-center justify-between px-10 md:px-15 flex-shrink-0"
              style={{ width: `${100 / total}%` }}
              role="group"
              aria-roledescription="slide"
              aria-label={`Slide ${i + 1} de ${total}`}
              aria-hidden={i !== index}
            >
              {/* Texto */}
              <div className="flex-1 space-y-4 md:pr-10">
                <h3 className="text-4xl font-bold text-gray-900">
                  {doacao.titulo}
                </h3>
                <p className="text-gray-600 text-lg font-medium">
                  {doacao.descricao}
                </p>
                <a
                  href={`https://wa.me/55${doacao.telefone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ backgroundColor: corPrincipal }}
                  aria-label={`Fazer doação para ${doacao.titulo} pelo WhatsApp`}
                >
                  FAÇA SUA DOAÇÃO
                  <span className="text-lg" aria-hidden="true">
                    →
                  </span>
                </a>
              </div>

              {/* Imagem + badge de região */}
              <div className="flex-1 mt-8 md:mt-34 flex justify-center items-center">
                <div className="relative w-[280px] h-[280px] flex items-center justify-center">
                  <img
                    src={doacao.imagem}
                    alt={doacao.alt || doacao.titulo}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy" // lazy load
                    decoding="async" // ajuda na renderização
                  />

                  {doacao.regiao && (
                    <div className="absolute top-0 right-0">
                      <span
                        className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm shadow-lg border border-gray-200"
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
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Indicadores (bolinhas) acessíveis */}
      <div
        className="flex justify-center mt-8 gap-2"
        aria-label="Selecionar slide"
      >
        {doacoes.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className="transition-all h-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              width: i === index ? "2rem" : "1rem",
              backgroundColor: i === index ? corSecundaria : "#ccc",
              border: "none",
              cursor: "pointer",
            }}
            aria-label={`Ir para o slide ${i + 1}`}
            aria-current={i === index ? "true" : undefined}
          >
            <span className="sr-only">Slide {i + 1}</span>
          </button>
        ))}
      </div>
    </section>
  );
}
