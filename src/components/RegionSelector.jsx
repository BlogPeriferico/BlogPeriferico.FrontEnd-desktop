import React, { useEffect, useRef } from "react";

const regioes = [
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
  const containerRef = useRef(null);

  // Focar no primeiro botão ao abrir
  useEffect(() => {
    if (containerRef.current) {
      const firstButton = containerRef.current.querySelector("button");
      if (firstButton) {
        firstButton.focus();
      }
    }
  }, []);

  const handleKeyDown = (e) => {
    if (!containerRef.current) return;

    const buttons = Array.from(containerRef.current.querySelectorAll("button"));
    const currentIndex = buttons.indexOf(document.activeElement);

    switch (e.key) {
      case "Escape":
        e.stopPropagation();
        onClose && onClose();
        break;
      case "ArrowDown":
        e.preventDefault();
        if (buttons.length > 0) {
          const nextIndex =
            currentIndex === -1 ? 0 : (currentIndex + 1) % buttons.length;
          buttons[nextIndex].focus();
        }
        break;
      case "ArrowUp":
        e.preventDefault();
        if (buttons.length > 0) {
          const prevIndex =
            currentIndex <= 0 ? buttons.length - 1 : currentIndex - 1;
          buttons[prevIndex].focus();
        }
        break;
      default:
        break;
    }
  };

  const titleId = "region-selector-title";

  return (
    <div
      ref={containerRef}
      className="absolute top-12 right-0 translate-x-[20px] z-50 bg-white border border-gray-300 rounded-lg shadow-md p-4 w-48"
      role="dialog"
      aria-labelledby={titleId}
      onKeyDown={handleKeyDown}
    >
      <h3 id={titleId} className="text-sm font-semibold mb-2">
        Escolha a região
      </h3>
      <ul className="space-y-1">
        {regioes.map((regiao) => (
          <li key={regiao}>
            <button
              type="button"
              className="w-full text-left px-2 py-1 hover:bg-blue-100 rounded text-sm duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-blue-500"
              onClick={() => {
                onSelect(regiao.toLowerCase());
                onClose && onClose();
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
