import React from "react";
import { useNavigate } from "react-router-dom";

export default function SelecaoCorreCerto({ correcertos }) {
  const navigate = useNavigate();

  // Limita a 16 itens
  const ultimasVagas = correcertos.slice(-16);

  return (
    <div className="w-full mt-20 mb-24">
      <h2 className="text-4xl font-semibold mb-10 w-max mx-auto text-center">
        Seleções de vagas
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        {ultimasVagas.map((vaga) => (
          <div
            key={vaga.id}
            onClick={() => navigate(`/vaga/${vaga.id}`, { state: vaga })}
            className="bg-[#F4F5F7] hover:scale-105 shadow-lg transition-all w-[240px] h-[370px] cursor-pointer"
          >
            <img
              src={vaga.imagem}
              alt={vaga.titulo}
              className="w-[240px] h-[240px] object-cover"
            />
            <div className="p-4 space-y-2">
              <h3 className="text-[#3A3A3A] font-semibold text-[16px] leading-tight">
                {vaga.titulo}
              </h3>
              <p className="text-[#8F8F8F] font-medium text-[12px]">
                {vaga.usuario || "Anunciante"}
              </p>
              <div className="flex justify-end items-center mt-2">
                <span className="text-[#8F8F8F] font-normal text-[14px]">
                  {vaga.tempo}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
