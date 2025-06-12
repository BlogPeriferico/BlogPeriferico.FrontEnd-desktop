// src/components/SelecaoAnuncios.jsx
import React from "react";
import { ProdutoData } from "../../data/ProdutoData";

export default function SelecaoAnuncios() {
  // Pega apenas os últimos 16 produtos
  const ultimosProdutos = ProdutoData.slice(-16);

  return (
    <div className="mt-20 mb-24"> {/* Adicionado mb-24 para garantir espaçamento abaixo */}
      <h2 className="text-2xl font-semibold mb-6">Seleções de anúncios</h2>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
        {ultimosProdutos.map((anuncio) => (
          <div
            key={anuncio.id}
            className="bg-[#F4F5F7]  hover:shadow-lg transition-all w-[240px] h-[370px]"
          >
            {/* Imagem do produto */}
            <img
              src={anuncio.imagem}
              alt={anuncio.titulo}
              className="w-[240px] h-[240px] object-cover "
            />
            {/* Detalhes do produto */}
            <div className="p-4 space-y-2">
              {/* Título */}
              <h3 className="text-[#3A3A3A] font-semibold text-[16px] leading-tight">
                {anuncio.titulo}
              </h3>
              {/* Nome do vendedor */}
              <p className="text-[#8F8F8F] font-medium text-[12px]">{anuncio.usuario}</p>
              {/* Preço e tempo */}
              <div className="flex justify-between items-center mt-2">
                <span className="text-[#000] font-semibold text-[18px]">{`R$${anuncio.preco}`}</span>
                <span className="text-[#8F8F8F] font-normal text-[14px]">{anuncio.tempo}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
