import React from 'react';
import { Link } from 'react-router-dom';
import { FaSpinner } from 'react-icons/fa';

const PostSearchResults = ({ results, onClose, isLoading = false }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-4 text-gray-500">
        <FaSpinner className="animate-spin mr-2" />
        <span>Buscando posts...</span>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">
        Nenhum post encontrado
      </div>
    );
  }

  const getPostUrl = (post) => {
    switch(post.tipo) {
      case 'noticia': return `/noticias/${post.id}`;
      case 'doacao': return `/doacoes/${post.id}`;
      case 'vaga': return `/vagas/${post.id}`;
      case 'achadinho': return `/achadinhos/${post.id}`;
      default: return '/';
    }
  };

  return (
    <div>
      {results.map((post) => (
        <Link
          key={`${post.tipo}-${post.id}`}
          to={getPostUrl(post)}
          className="block p-3 hover:bg-gray-100 transition-colors duration-200 border-b last:border-b-0"
          onClick={onClose}
        >
          <div className="font-medium text-gray-900">{post.titulo}</div>
          <div className="text-xs text-gray-500 mt-1">
            {post.tipo.charAt(0).toUpperCase() + post.tipo.slice(1)} • 
            {post.dataPublicacao && ` • ${new Date(post.dataPublicacao).toLocaleDateString()}`}
          </div>
          {post.descricao && (
            <div className="text-sm text-gray-600 mt-1 line-clamp-2">
              {post.descricao}
            </div>
          )}
        </Link>
      ))}
    </div>
  );
};

export default PostSearchResults;
