import React from "react";
import { CorreData } from "../../data/CorreCertoData";
import { useNavigate } from "react-router-dom";

export default function SelecaoCorreCerto() {
  const ultimasVagas = CorreData.slice(-16);
  const navigate = useNavigate();

  return (
    <div className="mt-20 mb-24">
      <h2 className="text-4xl font-semibold mb-10 w-max mx-auto text-center">
        Seleções do CorreCerto
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        {ultimasVagas.map((vagas) => (
          <div
            key={vagas.id}
            onClick={() => navigate("/CorreCerto", { state: vagas })}
            className="bg-[#F4F5F7] hover:scale-105 shadow-lg transition-all w-[240px] h-[370px] cursor-pointer"
          >
            <img
              src={vagas.imagem}
              alt={vagas.titulo}
              className="w-[240px] h-[240px] object-cover"
            />
            <div className="p-4 space-y-2">
              <h3 className="text-[#3A3A3A] font-semibold text-[16px] leading-tight">
                {vagas.titulo}
              </h3>
              <p className="text-[#8F8F8F] font-medium text-[12px]">
                {vagas.usuario}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[#000] font-semibold text-[18px]">
                  R${vagas.preco}
                </span>
                <span className="text-[#8F8F8F] font-normal text-[14px]">
                  {vagas.tempo}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
