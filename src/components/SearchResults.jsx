import React, { useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import NoPicture from "../assets/images/NoPicture.webp";

const SearchResults = ({ results, onClose, searchTerm }) => {
  const resultsRef = useRef(null);

  // Fechar os resultados ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [onClose]);

  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
    }
  };

  // Estado: nenhum resultado
  if (!results || results.length === 0) {
    return (
      <div
        ref={resultsRef}
        className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 py-2 max-h-80 overflow-y-auto"
        onKeyDown={handleKeyDown}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <div className="p-4 text-center text-gray-500 text-sm">
          Nenhum usuário encontrado para "{searchTerm}"
        </div>
      </div>
    );
  }

  return (
    <div
      ref={resultsRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 py-2 max-h-80 overflow-y-auto"
      role="listbox"
      aria-label={`Resultados da busca para "${searchTerm}"`}
      onKeyDown={handleKeyDown}
    >
      {results.map((usuario) => {
        const handle =
          usuario.nomeUsuario ||
          usuario.nome?.toLowerCase().replace(/\s+/g, "") ||
          "usuario";

        return (
          <Link
            key={usuario.id}
            to={`/perfil/${usuario.id}`}
            className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors duration-200 focus:outline-none focus:bg-gray-100"
            onClick={onClose}
            role="option"
            aria-label={`Ver perfil de ${usuario.nome} (@${handle})`}
          >
            <img
              src={usuario.fotoPerfil || NoPicture}
              alt={`Foto de perfil de ${usuario.nome}`}
              className="w-10 h-10 rounded-full object-cover mr-3 border"
              loading="lazy"
              decoding="async"
            />
            <div>
              <p className="font-medium text-gray-900 text-sm">
                {usuario.nome}
              </p>
              <p className="text-xs text-gray-500">@{handle}</p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default SearchResults;
