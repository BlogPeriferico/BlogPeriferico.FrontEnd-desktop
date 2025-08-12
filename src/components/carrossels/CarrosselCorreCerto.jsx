import React, { useState, useEffect } from "react";
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

  const proximo = () => setIndex((prev) => (prev + 1) % total);
  const anterior = () => setIndex((prev) => (prev - 1 + total) % total);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % total);
    }, 10000); // rotação a cada 10s
    return () => clearInterval(interval);
  }, [total]);

  return (
    <div className="relative w-full bg-[#F5F5F5] shadow-lg overflow-hidden py-8 px-6">
      {/* Botões */}
      <button
        onClick={anterior}
        className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-200"
      >
        <FiChevronLeft size={24} />
      </button>
      <button
        onClick={proximo}
        className="absolute right-4 top-1/2 transform -translate-y-1/2 z-10 bg-white p-2 rounded-full shadow-md hover:bg-gray-200"
      >
        <FiChevronRight size={24} />
      </button>

      {/* Slides */}
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-500 ease-in-out"
          style={{
            transform: `translateX(-${index * (100 / total)}%)`,
            width: `${total * 100}%`,
          }}
        >
          {Corres.map((CorreCerto, i) => (
            <div
              key={i}
              className="flex flex-col md:flex-row items-center justify-between px-10 md:px-15 flex-shrink-0"
              style={{ width: `${100 / total}%` }}
            >
              {/* Texto */}
              <div className="flex-1 space-y-4 md:pr-10">
                <h2 className="text-4xl font-bold text-gray-900">
                  {CorreCerto.titulo}
                </h2>
                <p className="text-gray-600 text-lg font-medium">
                  {CorreCerto.descricao}
                </p>
                <a
                  href={`https://wa.me/55${CorreCerto.telefone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 text-white font-semibold py-3 px-6 rounded-lg trasition-all duration-300 hover:scale-105"
                  style={{ backgroundColor: corPrincipal }}
                >
                  FAÇA SEU CORRE
                  <span className="text-lg">→</span>
                </a>
              </div>

              {/* Imagem */}
              <div className="flex-1 mt-8 md:mt-34 flex justify-center items-center relative">
                <div className="relative w-[280px] h-[280px] flex items-center justify-center">
                  <img
                    src={CorreCerto.imagem}
                    alt={CorreCerto.titulo}
                    className="max-h-full max-w-full object-contain"
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Indicadores */}
      <div className="flex justify-center mt-8 gap-2">
        {Corres.map((_, i) => (
          <div
            key={i}
            className={`transition-all h-2 rounded-full ${
              i === index ? "w-8" : "w-4"
            }`}
            style={{ backgroundColor: i === index ? corSecundaria : "#ccc" }}
          />
        ))}
      </div>
    </div>
  );
}
