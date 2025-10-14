import React from "react";
import { useNavigate } from "react-router-dom";

export default function SelecaoDoacoes({ doacoes }) {
  const navigate = useNavigate();

  // Limita a 16 itens, se desejar
  const ultimasDoacoes = doacoes.slice(-16);

  return (
    <div className="w-full mt-20 mb-24">
      <h2 className="text-4xl font-semibold mb-10 w-max mx-auto text-center text-gray-800">
        Seleções de Doações
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8 justify-items-center">
        {ultimasDoacoes.map((doacao) => (
          <div
            key={doacao.id}
            onClick={() => navigate(`/doacao/${doacao.id}`, { state: doacao })}
            className="bg-white shadow-lg rounded-lg transition-all duration-300 hover:scale-105 hover:shadow-xl cursor-pointer w-[280px] h-auto overflow-hidden"
          >
            {/* Imagem */}
            <img
              src={doacao.imagem}
              alt={doacao.titulo}
              className="w-full h-[200px] object-cover"
            />
            {/* Conteúdo */}
            <div className="p-4 space-y-3">
              {/* Título */}
              <h3 className="text-gray-900 font-bold text-lg leading-tight">
                {doacao.titulo}
              </h3>

              {/* Texto/Descrição */}
              {doacao.descricao && (
                <p className="text-gray-700 text-sm leading-relaxed">
                  {doacao.descricao.length > 100 ? `${doacao.descricao.substring(0, 100)}...` : doacao.descricao}
                </p>
              )}

              {/* Telefone e Data */}
              <div className="flex justify-between items-center text-xs text-gray-500 pt-2 border-t border-gray-200">
                <span>{doacao.telefone}</span>
                <span>{doacao.tempo || new Date().toLocaleDateString()}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
