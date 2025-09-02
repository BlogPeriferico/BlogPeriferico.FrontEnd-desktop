import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import AnuncioService from "../../services/AnuncioService";
 
export default function SelecaoAnuncios() {
  const [produtos, setProdutos] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
  AnuncioService.getAnuncios().then(setProdutos).catch(console.error);
}, []);

  if (produtos.length === 0) return <p>Carregando anúncios...</p>;

  const ultimosProdutos = produtos.slice(-16);

  return (
    <div className="mt-20 mb-24">
      <h2 className="text-4xl font-semibold mb-10 w-max mx-auto text-center">
        Seleções de anúncios
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 justify-items-center">
        {ultimosProdutos.map((anuncio) => (
          <div
            key={anuncio.id}
            onClick={() => navigate("/produto", { state: anuncio })}
            className="bg-[#F4F5F7] hover:scale-105 shadow-lg transition-all w-[240px] h-[370px] cursor-pointer"
          >
            <img
              src={anuncio.imagem}
              alt={anuncio.titulo}
              className="w-[240px] h-[240px] object-cover"
            />
            <div className="p-4 space-y-2">
              <h3 className="text-[#3A3A3A] font-semibold text-[16px] leading-tight">
                {anuncio.titulo}
              </h3>
              <p className="text-[#8F8F8F] font-medium text-[12px]">
                {anuncio.usuario}
              </p>
              <div className="flex justify-between items-center mt-2">
                <span className="text-[#000] font-semibold text-[18px]">
                  R${anuncio.preco}
                </span>
                <span className="text-[#8F8F8F] font-normal text-[14px]">
                  {anuncio.tempo}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
