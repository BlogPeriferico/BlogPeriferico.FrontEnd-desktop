// src/components/RegionSelector.jsx
import React from "react";

const regioes = [
  "Todos",
  "Centro",
  "Norte",
  "Sul",
  "Leste",
  "Oeste",
  "Sudeste",
  "Sudoeste",
  "Noroeste",
  "Nordeste",
];

export default function RegionSelector({ onClose, onSelect }) {
  return (
    <div
      className="absolute top-12 right-0 translate-x-[20px] z-50 bg-white border border-gray-300 rounded-lg shadow-md p-4 w-48"
      role="dialog"
      aria-modal="true"
      aria-labelledby="region-selector-title"
    >
      <h3
        id="region-selector-title"
        className="text-sm font-semibold mb-2"
      >
        Escolha a região
      </h3>
      <ul className="space-y-1">
        {regioes.map((regiao) => (
          <li key={regiao}>
            <button
              type="button"
              className="w-full text-left px-2 py-1 hover:bg-blue-100 rounded text-sm duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
