import React, { useState, useEffect, useMemo } from "react";
import { ProdutoData } from "../../data/ProdutoData";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import "../../styles/carrossel-responsive.css";

export default function CarrosselVendas() {
  const produtos = useMemo(() => ProdutoData.slice(0, 3), []);
  const [index, setIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  const total = produtos.length;
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";
  const corSecundaria = regionColors[regiao]?.[1] || "#3B82F6";

  const proximo = () => setIndex((prev) => (prev + 1) % total);
  const anterior = () => setIndex((prev) => (prev - 1 + total) % total);

  useEffect(() => {
    if (isPaused || total <= 1) return;

    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 5000); // rotação mais rápida para vendas

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
      className="carrossel-container relative w-full bg-[#FFFFFF] shadow-lg overflow-hidden py-8 px-6"
      aria-roledescription="carrossel"
      aria-label="Destaques de vendas"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
      onFocus={() => setIsPaused(true)}
      onBlur={() => setIsPaused(false)}
      onKeyDown={handleKeyNavigation}
    >
      {/* Botões de navegação */}
      <button
        type="button"
        onClick={anterior}
        className="carrossel-nav-button absolute left-2 md:left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
        aria-label="Ver produto anterior"
      >
        <FiChevronLeft className="w-6 h-6 md:w-6 md:h-6" aria-hidden="true" />
      </button>
      <button
        type="button"
        onClick={proximo}
        className="carrossel-nav-button absolute right-2 md:right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
        aria-label="Ver próximo produto"
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
          {produtos.map((produto, i) => {
            const isActive = i === index;

            return (
              <article
                key={produto.id || i}
                className="flex flex-col md:flex-row items-center justify-between px-10 md:px-15 flex-shrink-0"
                style={{ width: `${100 / total}%` }}
                role="listitem"
                aria-roledescription="slide"
                aria-label={`Slide ${i + 1} de ${total}`}
                aria-hidden={!isActive}
              >
                {/* Texto do produto */}
                <div
                  className="flex-1 space-y-4 md:pr-10"
                  aria-live={isActive ? "polite" : "off"}
                >
                  <span
                    className="badge-preco text-white text-sm font-semibold px-3 py-0.5 md:px-4 md:py-1 rounded"
                    style={{ 
                      backgroundColor: corSecundaria,
                      display: 'inline-block',
                      lineHeight: '1.25'
                    }}
                  >
                    Por R${produto.preco}
                  </span>
                  <h2 className="text-4xl font-bold text-gray-900">
                    {produto.titulo}
                  </h2>
                  <p className="text-gray-600 text-lg font-medium">
                    {produto.descricao}
                  </p>
                  <a
                    href={`https://wa.me/55${produto.telefone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800"
                    style={{ backgroundColor: corPrincipal }}
                    aria-label={`Entrar em contato sobre o produto ${produto.titulo} pelo WhatsApp`}
                  >
                    ENTRE EM CONTATO
                    <span className="text-lg" aria-hidden="true">
                      →
                    </span>
                  </a>
                </div>

                {/* Imagem do produto com selo de desconto */}
                <div className="flex-1 mt-8 md:mt-34 flex justify-center items-center relative">
                  <div className="carrossel-image-container relative w-[200px] h-[200px] md:w-[280px] md:h-[280px] flex items-center justify-center">
                    <img
                      src={produto.imagem}
                      alt={`${produto.titulo} - imagem ilustrativa do produto`}
                      className="max-h-full max-w-full object-contain"
                      loading="lazy"
                    />
                    {produto.desconto && (
                      <div
                        className="desconto-badge absolute top-[-1rem] right-[0.5rem] w-10 h-10 md:top-[-2rem] md:right-[1rem] md:w-16 md:h-16 rounded-full flex items-center justify-center text-white text-xs md:text-sm font-bold shadow-lg"
                        style={{ backgroundColor: corPrimary }}
                        aria-label={`Desconto de ${produto.desconto} neste produto`}
                      >
                        {produto.desconto}
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
        aria-label="Seleção de slide de vendas"
      >
        {produtos.map((_, i) => {
          const isActive = i === index;
          return (
            <button
              key={i}
              type="button"
              onClick={() => setIndex(i)}
              className={`carrossel-indicator transition-all h-2 rounded-full ${
                isActive ? "w-8 active" : "w-4"
              } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-800`}
              style={{ backgroundColor: isActive ? corSecundaria : "#ccc" }}
              aria-label={`Ir para o slide ${i + 1}`}
              aria-current={isActive ? "true" : "false"}
            />
          );
        })}
      </div>
    </section>
  );
}
