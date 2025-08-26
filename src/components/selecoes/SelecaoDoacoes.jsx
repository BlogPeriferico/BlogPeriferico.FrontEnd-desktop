import React from "react";
import { useNavigate } from "react-router-dom";

export default function SelecaoDoacoes({ doacoes }) {
  const navigate = useNavigate();

  // Limita a 16 itens, se desejar
  const ultimasDoacoes = doacoes.slice(-16);

  return (
    <div className="w-full mt-20 mb-24">
      <h2 className="text-4xl font-semibold mb-10 w-max mx-auto text-center">
        Seleções de doações
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        {ultimasDoacoes.map((doacao) => (
          <div
            key={doacao.id} // garante que a key seja única
            onClick={() => navigate("/doacao", { state: doacao })}
            className="bg-[#F4F5F7] shadow-lg transition-all duration-600 hover:scale-105 cursor-pointer w-[240px] h-[370px]"
          >
            <img
              src={doacao.imagem}
              alt={doacao.titulo}
              className="w-[240px] h-[240px] object-cover"
            />
            <div className="p-4 space-y-2">
              <h3 className="text-[#3A3A3A] font-semibold text-[16px] leading-tight">
                {doacao.titulo}
              </h3>
              <p className="text-[#8F8F8F] font-medium text-[12px]">
                {doacao.usuario}
              </p>
              <div className="flex justify-end items-center mt-2">
                <span className="text-[#8F8F8F] font-normal text-[14px]">
                  {doacao.tempo}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
