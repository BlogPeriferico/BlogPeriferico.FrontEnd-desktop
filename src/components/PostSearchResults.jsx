import React from 'react';
import { Link } from 'react-router-dom';
import { 
  FaSpinner, 
  FaNewspaper, 
  FaHandHoldingHeart, 
  FaBriefcase, 
  FaSearch,
  FaRegClock,
  FaRegComment,
  FaMapMarkerAlt
} from 'react-icons/fa';
import { regionColors } from '../utils/regionColors';
import NoPicture from '../assets/images/NoPicture.webp';

const PostSearchResults = ({ results, onClose, isLoading = false }) => {
  // Função para obter o ícone e a cor com base no tipo de post
  const getPostTypeInfo = (tipo) => {
    switch(tipo) {
      case 'noticia':
        return { 
          icon: <FaNewspaper className="text-blue-500" />, 
          color: 'bg-blue-100 text-blue-800',
          label: 'Notícia',
          bgColor: 'bg-blue-50',
          borderColor: 'border-blue-200',
          textColor: 'text-blue-800'
        };
      case 'doacao':
        return { 
          icon: <FaHandHoldingHeart className="text-green-600" />, 
          color: 'bg-green-100 text-green-800',
          label: 'Doação',
          bgColor: 'bg-green-50',
          borderColor: 'border-green-200',
          textColor: 'text-green-800'
        };
      case 'vaga':
        return { 
          icon: <FaBriefcase className="text-purple-600" />, 
          color: 'bg-purple-100 text-purple-800',
          label: 'Vaga',
          bgColor: 'bg-purple-50',
          borderColor: 'border-purple-200',
          textColor: 'text-purple-800'
        };
      case 'achadinho':
        return { 
          icon: <FaSearch className="text-yellow-600" />, 
          color: 'bg-yellow-100 text-yellow-800',
          label: 'Achadinho',
          bgColor: 'bg-yellow-50',
          borderColor: 'border-yellow-200',
          textColor: 'text-yellow-800'
        };
      default:
        return { 
          icon: <FaNewspaper className="text-gray-500" />, 
          color: 'bg-gray-100 text-gray-800',
          label: 'Post',
          bgColor: 'bg-gray-50',
          borderColor: 'border-gray-200',
          textColor: 'text-gray-800'
        };
    }
  };

  // Função para formatar a data no padrão do NoticiasInfo
  const formatPostDate = (dateString) => {
    if (!dateString) return 'Data não informada';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Data inválida';
      
      const dateStr = date.toLocaleDateString('pt-BR');
      const timeStr = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
      
      return `Publicado em ${dateStr} às ${timeStr}`;
    } catch (error) {
      console.error('Erro ao formatar data:', error);
      return 'Data inválida';
    }
  };
  

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8 text-gray-500">
        <FaSpinner className="animate-spin text-3xl mb-3 text-blue-500" />
        <span className="text-sm font-medium">Buscando posts...</span>
      </div>
    );
  }

  if (!results || results.length === 0) {
    return (
      <div className="p-8 text-center">
        <div className="text-gray-300 mb-3">
          <svg className="w-16 h-16 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-gray-500 font-medium text-lg">Nenhum post encontrado</p>
        <p className="text-sm text-gray-400 mt-1">Tente outros termos de busca</p>
      </div>
    );
  }

  const getPostUrl = (post) => {
    console.log('Dados do post para gerar URL:', {
      id: post.id,
      tipo: post.tipo,
      tipoPost: post.tipoPost
    });
    
    const tipo = post.tipo || post.tipoPost || '';
    const id = post.id;
    
    if (!id) {
      console.error('ID do post não encontrado', post);
      return '/';
    }
    
    // Mapeia os tipos para as rotas corretas baseado no App.jsx
    switch(tipo.toLowerCase()) {
      case 'noticia': 
        return `/noticia/${id}`;  // Corrigido para corresponder à rota /noticia/:id
      case 'doacao': 
        return `/doacao/${id}`;   // Corrigido para corresponder à rota /doacao/:id
      case 'vaga': 
        return `/vaga/${id}`;     // Corrigido para corresponder à rota /vaga/:id
      case 'achadinho': 
      case 'venda': // Adicionado suporte para tipo 'venda' que pode estar vindo da API
        return `/produto/${id}`;  // Corrigido para corresponder à rota /produto/:id
      default: 
        console.warn('Tipo de post não reconhecido:', tipo, post);
        return '/';
    }
  };

  // Função para extrair o primeiro parágrafo do texto
  const getFirstParagraph = (html) => {
    if (!html) return '';
    try {
      // Remove tags HTML e espaços em branco extras
      let text = html.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
      // Pega os primeiros 150 caracteres
      text = text.substring(0, 150);
      return text.length < 150 ? text : text + '...';
    } catch (error) {
      console.error('Erro ao processar texto:', error);
      return '';
    }
  };
  
  // Função para obter o nome amigável do tipo de post
  const getPostTypeName = (tipo) => {
    switch(tipo) {
      case 'noticia': return 'Notícia';
      case 'doacao': return 'Doação';
      case 'vaga': return 'Vaga';
      case 'achadinho': return 'Achadinho';
      case 'venda': return 'Venda';
      default: return 'Post';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-2">
      {results.map((post) => {
        const typeInfo = getPostTypeInfo(post.tipo || post.tipoPost);
        const postImage = post.imagemCapa || post.imagem || post.urlImagem || NoPicture;
        
        // Tenta obter a data de várias propriedades possíveis
        const postDate = post.dataPublicacao || 
                        post.dataHoraCriacao || 
                        post.dataCriacao || 
                        post.criadoEm || 
                        post.createdAt || 
                        new Date().toISOString();
                        
        const postDescription = post.descricao || 
                              post.resumo || 
                              getFirstParagraph(post.texto || post.conteudo || post.descricaoLonga || '');
                              
        const postRegion = post.regiao || post.local || post.zona || post.cidade || '';
        const postViews = post.visualizacoes || post.views || 0;
        const postComments = post.comentarios?.length || post.numeroComentarios || post.comments || 0;
        const postType = post.tipo || post.tipoPost || '';
        
        return (
          <Link
            key={`${post.tipo || 'post'}-${post.id}`}
            to={getPostUrl(post)}
            className={`block rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-all duration-300 ${typeInfo.bgColor} ${typeInfo.borderColor} border`}
            onClick={(e) => {
              // Se não tiver ID ou tipo, previne a navegação
              if (!post.id || (!post.tipo && !post.tipoPost)) {
                e.preventDefault();
                console.error('Dados insuficientes para navegação:', post);
                return;
              }
              // Fecha o dropdown de busca se a função onClose existir
              if (onClose) onClose();
              
              // Rola para o topo da página
              window.scrollTo(0, 0);
            }}
          >
            <div className="flex flex-col h-full">
              {/* Imagem de capa */}
              <div className="relative h-40 bg-gray-100 overflow-hidden">
                <img 
                  src={postImage} 
                  alt={post.titulo}
                  className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                  onError={(e) => {
                    e.target.onerror = null;
                    e.target.src = NoPicture;
                  }}
                />
                {/* Badge do tipo de post */}
                <div className={`absolute top-2 left-2 ${typeInfo.color} text-xs font-medium px-2 py-1 rounded-full flex items-center`}>
                  {typeInfo.icon}
                  <span className="ml-1">{typeInfo.label}</span>
                </div>
                
                {/* Região no canto superior direito */}
                {postRegion && (
                  <div 
                    className="absolute top-2 right-2 text-white text-xs font-medium px-3 py-1 rounded-full shadow-md"
                    style={{
                      backgroundColor: regionColors[postRegion.toLowerCase()]?.[0] || '#333',
                      color: 'white',
                      textShadow: '0 1px 2px rgba(0,0,0,0.2)',
                      border: `1px solid ${regionColors[postRegion.toLowerCase()]?.[1] || 'rgba(255,255,255,0.2)'}`,
                      boxShadow: `0 2px 4px rgba(0,0,0,0.1), 0 0 0 1px rgba(255,255,255,0.1) inset`,
                      textTransform: 'capitalize',
                      fontWeight: '600',
                      letterSpacing: '0.3px'
                    }}
                  >
                    {postRegion.toLowerCase()}
                  </div>
                )}
              </div>
              
              {/* Conteúdo do card */}
              <div className="p-4 flex-1 flex flex-col">
                {/* Título */}
                <h3 className="font-semibold text-gray-900 text-lg mb-2 line-clamp-2">
                  {post.titulo}
                </h3>
                
                {/* Descrição */}
                {postDescription && (
                  <p className="text-gray-600 text-sm mb-3 line-clamp-3">
                    {postDescription}
                  </p>
                )}
                
                {/* Metadados e Comentários */}
                <div className="mt-auto pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between">
                    {/* Data */}
                    <div className="text-xs text-gray-500">
                      {formatPostDate(postDate)}
                    </div>
                    
                    {/* Contador de comentários */}
                    {postComments > 0 && (
                      <div className="flex items-center text-xs text-gray-500">
                        <FaRegComment className="mr-1" />
                        <span>{postComments}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Link>
        );
      })}
    </div>
  )
};

export default PostSearchResults;
