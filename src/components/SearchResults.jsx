// src/components/SearchResults.jsx
import React from "react";
import { Link } from "react-router-dom";
import NoPicture from "../assets/images/NoPicture.webp";
import { FaSpinner } from "react-icons/fa";

const SearchResults = ({
  results,
  onClose,
  searchTerm,
  isLoading = false,
}) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4 text-gray-500">
        <FaSpinner className="animate-spin mr-2" aria-hidden="true" />
        <span>Buscando usuários...</span>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500 text-sm">
        Nenhum usuário encontrado{searchTerm ? ` para "${searchTerm}"` : ""}.
      </div>
    );
  }

  return (
    <ul
      className="py-2 max-h-80 overflow-y-auto"
      role="list"
      aria-label="Resultados de busca de usuários"
    >
      {results.map((usuario) => {
        const nome = usuario.nome || "Usuário";
        const userSlug =
          usuario.nomeUsuario ||
          nome
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/\s+/g, "");

        return (
          <li key={usuario.id} role="listitem">
            <Link
              to={`/perfil/${usuario.id}`}
              className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors duration-200"
              onClick={onClose}
            >
              <img
                src={usuario.fotoPerfil || NoPicture}
                alt={`Foto de perfil de ${nome}`}
                className="w-10 h-10 rounded-full object-cover mr-3 border"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.onerror = null;
                  e.currentTarget.src = NoPicture;
                }}
              />
              <div>
                <p className="font-medium text-gray-900 text-sm">
                  {nome}
                </p>
                <p className="text-xs text-gray-500">@{userSlug}</p>
              </div>
            </Link>
          </li>
        );
      })}
    </ul>
  );
};

export default React.memo(SearchResults);
