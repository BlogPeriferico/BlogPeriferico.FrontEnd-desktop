import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import NoPicture from '../assets/images/NoPicture.webp';

const SearchResults = ({ results, onClose, searchTerm }) => {
  const resultsRef = useRef(null);

  // Fechar os resultados ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (resultsRef.current && !resultsRef.current.contains(event.target)) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [onClose]);

  if (!results || results.length === 0) {
    return (
      <div 
        ref={resultsRef}
        className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 py-2 max-h-80 overflow-y-auto"
      >
        <div className="p-4 text-center text-gray-500">
          Nenhum usuário encontrado para "{searchTerm}"
        </div>
      </div>
    );
  }

  return (
    <div 
      ref={resultsRef}
      className="absolute top-full left-0 right-0 mt-1 bg-white rounded-lg shadow-lg z-50 py-2 max-h-80 overflow-y-auto"
    >
      {results.map((usuario) => (
        <Link
          key={usuario.id}
          to={`/perfil/${usuario.id}`}
          className="flex items-center px-4 py-2 hover:bg-gray-100 transition-colors duration-200"
          onClick={onClose}
        >
          <img
            src={usuario.fotoPerfil || NoPicture}
            alt={usuario.nome}
            className="w-10 h-10 rounded-full object-cover mr-3 border"
          />
          <div>
            <p className="font-medium text-gray-900">{usuario.nome}</p>
            <p className="text-xs text-gray-500">@{usuario.nomeUsuario || usuario.nome?.toLowerCase().replace(/\s+/g, '')}</p>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default SearchResults;
