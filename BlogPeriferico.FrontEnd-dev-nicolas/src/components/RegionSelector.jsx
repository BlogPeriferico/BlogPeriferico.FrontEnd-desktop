import React from "react";

const regioes = [
  "Centro", "Norte", "Sul", "Leste", "Oeste",
  "Sudeste", "Sudoeste", "Noroeste", "Nordeste"
];

export default function RegionSelector({ onClose, onSelect }) {
  return (
    <div className="absolute top-12 right-0 z-50 bg-white border border-gray-300 rounded-lg shadow-md p-4 w-48">
      <h3 className="text-sm font-semibold mb-2">Escolha a região</h3>
      <ul className="space-y-1">
        {regioes.map((regiao) => (
          <li key={regiao}>
            <button
              className="w-full text-left px-2 py-1 hover:bg-blue-100 rounded text-sm"
              onClick={() => {
                onSelect(regiao.toLowerCase());
                onClose();
              }}
            >
              {regiao}
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}