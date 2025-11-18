import React, { useState, useEffect, useCallback } from "react";
import { CorreData } from "../../data/CorreCertoData";
import { FiChevronRight, FiChevronLeft } from "react-icons/fi";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";

export default function CarrosselCorreCerto() {
  const Corres = CorreData.slice(0, 3);
  const [index, setIndex] = useState(0);
  const total = Corres.length;

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

  // Navegação por teclado (setas esquerda/direita)
  const handleKeyDown = (event) => {
    if (event.key === "ArrowRight") {
      event.preventDefault();
      proximo();
    } else if (event.key === "ArrowLeft") {
      event.preventDefault();
      anterior();
    }
  };

  const carrosselId = "carrossel-corre-certo-slides";

  return (
    <section
      className="relative w-full bg-[#F5F5F5] shadow-lg overflow-hidden py-8 px-6"
      role="region"
      aria-roledescription="carrossel"
      aria-label="Divulgação de corres da comunidade"
    >
      {/* título só para leitor de tela */}
      <h2 className="sr-only">Corre Certo - serviços da comunidade</h2>

      {/* Botões de navegação */}
      <button
        type="button"
        onClick={anterior}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
        aria-label="Ver corre anterior"
        aria-controls={carrosselId}
      >
        <FiChevronLeft size={24} aria-hidden="true" />
      </button>

      <button
        type="button"
        onClick={proximo}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
        aria-label="Ver próximo corre"
        aria-controls={carrosselId}
      >
        <FiChevronRight size={24} aria-hidden="true" />
      </button>

      {/* Área de slides – focável para navegação por teclado */}
      <div
        className="overflow-hidden outline-none"
        tabIndex={0}
        onKeyDown={handleKeyDown}
        aria-label="Use as setas do teclado para navegar pelos corres"
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
          {Corres.map((CorreCerto, i) => (
            <article
              key={CorreCerto.id ?? i}
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
                  {CorreCerto.titulo}
                </h3>
                <p className="text-gray-600 text-lg font-medium">
                  {CorreCerto.descricao}
                </p>
                <a
                  href={`https://wa.me/55${CorreCerto.telefone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                  style={{ backgroundColor: corPrincipal }}
                  aria-label={`Fazer seu corre com ${CorreCerto.titulo} pelo WhatsApp`}
                >
                  FAÇA SEU CORRE
                  <span className="text-lg" aria-hidden="true">
                    →
                  </span>
                </a>
              </div>

              {/* Imagem */}
              <div className="flex-1 mt-8 md:mt-34 flex justify-center items-center relative">
                <div className="relative w-[280px] h-[280px] flex items-center justify-center">
                  <img
                    src={CorreCerto.imagem}
                    alt={CorreCerto.alt || CorreCerto.titulo}
                    className="max-h-full max-w-full object-contain"
                    loading="lazy" // lazy load
                    decoding="async" // otimiza pintura
                  />
                </div>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Indicadores (bolinhas) – agora como botões acessíveis */}
      <div
        className="flex justify-center mt-8 gap-2"
        aria-label="Selecionar slide"
      >
        {Corres.map((_, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setIndex(i)}
            className="transition-all h-2 rounded-full focus:outline-none focus:ring-2 focus:ring-offset-2"
            style={{
              width: i === index ? "2rem" : "1rem",
              backgroundColor: i === index ? corSecundaria : "#ccc",
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
