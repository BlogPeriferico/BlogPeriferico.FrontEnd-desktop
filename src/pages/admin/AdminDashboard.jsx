import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaNewspaper, FaSearch, FaTrash, FaUserCog, FaCheck, FaTimes } from 'react-icons/fa';
import { useRegiao } from '../../contexts/RegionContext';
import { regionColors } from '../../utils/regionColors';
import NoPicture from '../../assets/images/NoPicture.webp';
import api from '../../services/Api';
import { deletarUsuario } from '../../services/UsuarioService';
import NoticiaService from '../../services/NoticiasService';
import DoacaoService from '../../services/DoacaoService';
import CorreCertoService from '../../services/CorreCertoService';
import AnuncioService from '../../services/AnuncioService';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('usuarios');
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [posts, setPosts] = useState({
    noticias: [],
    doacoes: [],
    vagas: [],
    achadinhos: []
  });
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const [deletingPostId, setDeletingPostId] = useState(null);
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";
  const corSecundaria = regionColors[regiao]?.[1] || "#3B82F6";

  // Buscar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  // Função para processar os posts
  const processarPosts = useCallback(async (posts, tipo = '') => {
    if (!Array.isArray(posts)) return [];
    
    try {
      // Buscar todos os usuários para mapear os autores
      const usuariosResponse = await api.get('/usuarios/listar');
      const usuarios = usuariosResponse.data || [];
      
      return posts.map(post => {
        // Extrair dados do post, lidando com a estrutura do Strapi (data.attributes) se necessário
        const postData = post.attributes || post;
        
        // Encontrar o autor do post
        const autor = usuarios.find(u => u.id === (postData.idUsuario || postData.attributes?.idUsuario)) || { 
          nome: postData.nomeAnunciante || postData.nomeDoador || 'Anônimo',
          id: null,
          fotoPerfil: null
        };
        
        // Extrair e formatar a data de criação
        let dataCriacao = postData.dataHoraCriacao || 
                         postData.createdAt || 
                         postData.attributes?.dataHoraCriacao || 
                         postData.attributes?.createdAt ||
                         new Date().toISOString();
        
        // Se a data estiver no formato do Strapi (objeto com propriedade 'date')
        if (dataCriacao && typeof dataCriacao === 'object' && dataCriacao.date) {
          dataCriacao = dataCriacao.date;
        }

        // Objeto base com campos comuns a todos os tipos de post
        const basePost = {
          id: post.id || postData.id,
          titulo: postData.titulo || postData.Titulo || 'Sem título',
          imagem: postData.imagem?.data?.attributes?.url || 
                postData.imagem?.url || 
                postData.imagem || 
                postData.capa?.data?.attributes?.url ||
                postData.fotoCapa ||
                null,
          autor: {
            id: autor.id,
            nome: autor.nome || 'Anônimo',
            fotoPerfil: autor.fotoPerfil || NoPicture
          },
          regiao: postData.regiao?.data?.attributes?.nome || 
                postData.regiao?.nome || 
                postData.regiao || 
                postData.local ||
                postData.bairro ||
                'Geral',
          dataHoraCriacao: dataCriacao,
          tipo: tipo,
          ...postData
        };

        // Campos específicos para cada tipo de post
        switch(tipo) {
          case 'achadinhos':
            return {
              ...basePost,
              preco: postData.preco || postData.valor || 0,
              conteudo: postData.descricao || postData.detalhes || 'Sem descrição',
              telefone: postData.telefone || postData.contato || postData.celular || postData.whatsapp || ''
            };
            
          case 'doacoes':
            return {
              ...basePost,
              conteudo: postData.descricao || postData.detalhesDoacao || 'Sem descrição',
              categoria: postData.categoria || 'Doação',
              telefone: postData.telefone || postData.contato || postData.celular || postData.whatsapp || ''
            };
            
          case 'vagas':
            return {
              ...basePost,
              conteudo: postData.descricao || postData.descricaoVaga || 'Sem descrição',
              telefone: postData.telefone || postData.contato || postData.celular || postData.whatsapp || ''
            };
            
          case 'noticias':
          default:
            return {
              ...basePost,
              conteudo: postData.corpo || postData.conteudo || postData.texto || 'Sem conteúdo',
            };
        }
      });
    } catch (error) {
      console.error('Erro ao processar posts:', error);
      return [];
    }
  }, []);

  const carregarDados = useCallback(async () => {
    try {
      setLoading(true);
      
      // Inicializa posts com arrays vazios para cada tipo
      const postsIniciais = {
        noticias: [],
        doacoes: [],
        vagas: [],
        achadinhos: []
      };
      setPosts(postsIniciais);

      // Buscar usuários
      const usuariosResponse = await api.get('/usuarios/listar');
      setUsuarios(usuariosResponse.data || []);
      
      try {
        // Usando os serviços que já funcionam nas outras páginas
        const [noticias, doacoes, vagas, achadinhos] = await Promise.all([
          NoticiaService.listarNoticias().catch(err => {
            console.error('Erro ao carregar notícias:', err);
            return [];
          }),
          DoacaoService.listarDoacoes().catch(err => {
            console.error('Erro ao carregar doações:', err);
            return [];
          }),
          CorreCertoService.listarCorrecertos().catch(err => {
            console.error('Erro ao carregar vagas:', err);
            return [];
          }),
          // Buscando os achadinhos usando o AnuncioService
          AnuncioService.getAnuncios()
            .then(data => {
              console.log('Dados recebidos do serviço de anúncios:', data);
              return Array.isArray(data) ? data : [];
            })
            .catch(err => {
              console.error('Erro ao carregar achadinhos:', err);
              return [];
            })
        ]);

        // Processa os posts em paralelo, passando o tipo para cada um
        const [noticiasProcessadas, doacoesProcessadas, vagasProcessadas, achadinhosProcessados] = await Promise.all([
          processarPosts(noticias, 'noticias'),
          processarPosts(doacoes, 'doacoes'),
          processarPosts(vagas, 'vagas'),
          processarPosts(achadinhos, 'achadinhos')
        ]);

        // Atualizar o estado com os dados processados
        setPosts({
          noticias: noticiasProcessadas,
          doacoes: doacoesProcessadas,
          vagas: vagasProcessadas,
          achadinhos: achadinhosProcessados
        });

      } catch (error) {
        console.error('Erro ao processar posts:', error);
        // Em caso de erro, mantém os arrays vazios
        setPosts(postsIniciais);
      }
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  // Funções para usuários
  const editarUsuario = (usuario) => {
    setEditingUser(usuario);
  };

  const salvarUsuario = async (usuarioId, dadosAtualizados) => {
    try {
      await api.put(`/usuarios/${usuarioId}`, dadosAtualizados);
      await carregarDados();
      setEditingUser(null);
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
    }
  };

  const handleDeleteUser = async (usuarioId) => {
    if (window.confirm('Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.')) {
      try {
        await deletarUsuario(usuarioId);
        // Remove o usuário da lista
        setUsuarios(usuarios.filter(u => u.id !== usuarioId));
        alert('Usuário excluído com sucesso!');
      } catch (error) {
        console.error('Erro ao excluir usuário:', error);
        alert('Erro ao excluir usuário. Verifique o console para mais detalhes.');
      }
    }
  };

  const alternarStatusUsuario = async (usuarioId, ativo) => {
    try {
      await api.put(`/usuarios/${usuarioId}/status`, { ativo: !ativo });
      await carregarDados();
    } catch (error) {
      console.error('Erro ao atualizar status do usuário:', error);
    }
  };

  // Funções para posts
  const editarPost = (post) => {
    setEditingPost(post);
  };

  const salvarPost = async (postId, dadosAtualizados) => {
    try {
      await api.put(`/posts/${postId}`, dadosAtualizados);
      await carregarDados();
      setEditingPost(null);
    } catch (error) {
      console.error('Erro ao atualizar post:', error);
    }
  };

  const deletarPost = async (postId) => {
    if (window.confirm('Tem certeza que deseja excluir este post?')) {
      setDeletingPostId(postId);
      try {
        await api.delete(`/posts/${postId}`);
        await carregarDados();
      } catch (error) {
        console.error('Erro ao excluir post:', error);
        alert('Ocorreu um erro ao excluir o post. Por favor, tente novamente.');
      } finally {
        setDeletingPostId(null);
      }
    }
  };

  // Filtros
  const usuariosFiltrados = usuarios.filter(usuario => 
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Filtrar posts com base no termo de busca
  const getPostsFiltrados = (postsList) => {
    return postsList.filter(post => 
      (post.titulo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (post.conteudo?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (post.descricao?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  };

  // Obter os posts ativos com base na aba selecionada
  const [activePostType, setActivePostType] = useState('noticias');
  const postsAtivos = posts[activePostType] || [];
  const postsFiltrados = getPostsFiltrados(postsAtivos);
  
  // Calcular totais
  const totais = {
    noticias: posts.noticias.length,
    doacoes: posts.doacoes.length,
    vagas: posts.vagas.length,
    achadinhos: posts.achadinhos.length,
    totalGeral: Object.values(posts).reduce((acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0), 0)
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Cabeçalho */}
      <div className={`shadow-lg py-4`} style={{ 
        background: `linear-gradient(90deg, ${corPrincipal} 0%, ${corSecundaria} 100%)`
      }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center">
            <div className="w-full flex justify-between items-center mb-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 bg-white/30 rounded-lg flex items-center justify-center mr-3">
                  <FaUserCog className="text-white text-xl" />
                </div>
                <h1 className="text-2xl font-bold text-white">Painel de Administração</h1>
              </div>
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg transition-all duration-300 text-white backdrop-blur-sm hover:shadow-lg"
              >
                <FaArrowLeft />
                Voltar
              </button>
            </div>
            
            {/* Abas */}
            <div className="w-full max-w-4xl">
                <div className="flex rounded-lg overflow-hidden" style={{ backgroundColor: `${corPrincipal}33` }}>
                <button
                  onClick={() => setActiveTab('usuarios')}
                  className={`flex-1 py-4 font-medium text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                    activeTab === 'usuarios' 
                    ? 'bg-white shadow-md' 
                    : 'text-white hover:bg-white/20'
                  }`}
                >
                  <FaUser className="text-xl" /> 
                  <span>Usuários</span>
                </button>
                <button
                  onClick={() => setActiveTab('posts')}
                  className={`flex-1 py-4 font-medium text-lg flex items-center justify-center gap-2 transition-all duration-300 ${
                    activeTab === 'posts' 
                    ? 'bg-white shadow-md' 
                    : 'text-white hover:bg-white/20'
                  }`}
                >
                  <FaNewspaper className="text-xl" />
                  <span>Posts</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Conteúdo */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 -mt-1">
        {/* Estatísticas e pesquisa */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          {activeTab === 'usuarios' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl" style={{ 
                  backgroundColor: `${corPrincipal}15`,
                  border: `1px solid ${corPrincipal}30`
                }}>
                  <FaUserCog className="text-2xl" style={{ color: corPrincipal }} />
                  <h2 className="text-3xl font-bold" style={{ color: corPrincipal }}>Painel de Admin</h2>
                </div>
                <div className="p-4 rounded-lg text-center min-w-[150px]" style={{ 
                  backgroundColor: `${corSecundaria}15`, 
                  border: `1px solid ${corSecundaria}30`
                }}>
                  <div className="text-sm font-medium" style={{ color: corSecundaria }}>Total de Usuários</div>
                  <div className="text-2xl font-bold" style={{ color: corSecundaria }}>{usuarios.length}</div>
                </div>
              </div>
              
              <div className="relative max-w-2xl ml-auto">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <FaSearch className="text-gray-400" />
                </div>
                <input
                  type="text"
                  className="block w-full pl-10 pr-3 py-2 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                  placeholder="Pesquisar usuários por nome ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'posts' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-3 px-5 py-3 rounded-xl" style={{ 
                  backgroundColor: `${corPrincipal}15`,
                  border: `1px solid ${corPrincipal}30`
                }}>
                  <FaUserCog className="text-2xl" style={{ color: corPrincipal }} />
                  <h2 className="text-3xl font-bold" style={{ color: corPrincipal }}>Painel de Admin</h2>
                </div>
                <div className="p-4 rounded-lg text-center min-w-[150px]" style={{ 
                  backgroundColor: `${corSecundaria}15`, 
                  border: `1px solid ${corSecundaria}30`
                }}>
                  <div className="text-sm font-medium" style={{ color: corSecundaria }}>Total de Posts</div>
                  <div className="text-2xl font-bold" style={{ color: corSecundaria }}>{totais.totalGeral}</div>
                </div>
              </div>
            </div>
          )}
        </div>


        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div 
              className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
              style={{ borderColor: corPrincipal }}
            ></div>
          </div>
        ) : (
          <>
            {/* Tabela de Usuários */}
            {activeTab === 'usuarios' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/80 backdrop-blur-sm">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Email
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {usuariosFiltrados.map((usuario) => (
                        <tr key={usuario.id}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img 
                                  className="h-10 w-10 rounded-full object-cover" 
                                  src={usuario.fotoPerfil || NoPicture} 
                                  alt={usuario.nome || 'Usuário'}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = NoPicture;
                                  }}
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {editingUser?.id === usuario.id ? (
                                    <input
                                      type="text"
                                      className="border rounded px-2 py-1 w-full"
                                      defaultValue={usuario.nome}
                                      onChange={(e) => setEditingUser({
                                        ...editingUser,
                                        nome: e.target.value
                                      })}
                                    />
                                  ) : (
                                    usuario.nome
                                  )}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {usuario.username && `@${usuario.username}`}
                                  <div className="text-xs text-gray-600 font-medium">
                                    {usuario.email}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            {editingUser?.id === usuario.id ? (
                              <input
                                type="email"
                                className="border rounded px-2 py-1 w-full"
                                defaultValue={usuario.email}
                                onChange={(e) => setEditingUser({
                                  ...editingUser,
                                  email: e.target.value
                                })}
                              />
                            ) : (
                              <div className="text-sm text-gray-900">{usuario.email}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              usuario.roles === 'ROLE_ADMINISTRADOR' 
                                ? 'bg-green-100 text-green-800' 
                                : 'bg-blue-100 text-blue-800'
                            }`}>
                              {usuario.roles === 'ROLE_ADMINISTRADOR' ? 'Administrador' : 'Usuário'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              usuario.ativo !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {usuario.ativo !== false ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            <button
                              onClick={() => handleDeleteUser(usuario.id)}
                              className="p-2 rounded-full bg-red-100 hover:bg-red-200 text-red-600 hover:text-red-800 transition-colors"
                              title="Excluir usuário"
                            >
                              <FaTrash className="inline" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Grade de Posts */}
            {activeTab === 'posts' && (
              <div className="space-y-6">
                {/* Filtros e totais */}
                <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {[
                      { id: 'noticias', name: 'Notícias' },
                      { id: 'doacoes', name: 'Doações' },
                      { id: 'vagas', name: 'Vagas' },
                      { id: 'achadinhos', name: 'Achadinhos' }
                    ].map((tab) => (
                      <button
                        key={tab.id}
                        onClick={() => setActivePostType(tab.id)}
                        className={`px-4 py-2 rounded-lg font-medium text-sm transition-colors ${
                          activePostType === tab.id
                            ? 'bg-blue-100 text-blue-700 shadow-inner'
                            : 'text-gray-600 hover:bg-gray-100'
                        }`}
                      >
                        {tab.name} <span className="font-normal">({totais[tab.id] || 0})</span>
                      </button>
                    ))}
                  </div>
                  
                  {/* Barra de pesquisa */}
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                      placeholder="Pesquisar posts..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                {/* Grade de posts */}
                {loading ? (
                  <div className="flex justify-center items-center h-64">
                    <div 
                      className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2"
                      style={{ borderColor: corPrincipal }}
                    ></div>
                  </div>
                ) : postsFiltrados.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                    <div className="text-gray-400 mb-2">
                      <svg className="w-12 h-12 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">Nenhum post encontrado</h3>
                    <p className="mt-1 text-sm text-gray-500">Não há posts para exibir nesta categoria.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {postsFiltrados.map((post) => (
                      <div 
                        key={post.id} 
                        className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 hover:shadow-md transition-shadow duration-300"
                      >
                        {/* Imagem do post */}
                        <div className="h-48 bg-gray-100 overflow-hidden">
                          <img
                            src={post.imagem || 'https://via.placeholder.com/400x200?text=Sem+imagem'}
                            alt={post.titulo}
                            className="w-full h-full object-cover"
                            onError={(e) => {
                              e.target.onerror = null;
                              e.target.src = 'https://via.placeholder.com/400x200?text=Imagem+não+disponível';
                            }}
                          />
                        </div>

                        {/* Conteúdo do post */}
                        <div className="p-4">
                          <div className="flex items-start justify-between mb-3">
                            <div className="flex items-start">
                              <img
                                src={post.autor?.fotoPerfil || NoPicture}
                                alt={post.autor?.nome || 'Autor'}
                                className="w-8 h-8 rounded-full mr-2 object-cover flex-shrink-0"
                                style={{ width: '32px', height: '32px' }}
                                onError={(e) => {
                                  e.target.onerror = null;
                                  e.target.src = NoPicture;
                                }}
                              />
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center flex-wrap">
                                  <p className="text-sm font-medium text-gray-900 truncate">
                                    {post.autor?.nome || 'Anônimo'}
                                  </p>
                                  {post.tipo === 'doacoes' && post.categoria && (
                                    <span className="ml-2 text-xs bg-purple-100 text-purple-800 px-2 py-0.5 rounded-full">
                                      {post.categoria}
                                    </span>
                                  )}
                                </div>
                                <p className="text-xs text-gray-500">
                                  {post.dataHoraCriacao ? (
                                    <>
                                      {new Date(post.dataHoraCriacao).toLocaleDateString('pt-BR', {
                                        day: '2-digit',
                                        month: '2-digit',
                                        year: 'numeric'
                                      })}{' '}
                                      às{' '}
                                      {new Date(post.dataHoraCriacao).toLocaleTimeString('pt-BR', {
                                        hour: '2-digit',
                                        minute: '2-digit'
                                      })}
                                    </>
                                  ) : 'Data não disponível'}
                                </p>
                              </div>
                            </div>
                            {post.regiao && (
                              <span className="ml-2 px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full whitespace-nowrap">
                                {post.regiao}
                              </span>
                            )}
                          </div>

                          <h3 className="text-lg font-semibold text-gray-900 mb-2 line-clamp-2">
                            {post.titulo}
                          </h3>
                          
                          {/* Conteúdo do post */}
                          <p className="text-gray-600 text-sm mb-3">
                            {post.conteudo}
                          </p>
                          
                          {/* Preço (apenas para achadinhos) */}
                          {post.tipo === 'achadinhos' && post.preco !== undefined && post.preco !== null && (
                            <div className="mb-2">
                              <span className="text-lg font-bold text-green-600">
                                R$ {Number(post.preco).toFixed(2).replace('.', ',')}
                              </span>
                            </div>
                          )}
                          
                          {/* Telefone para contato (mostrar apenas se existir) */}
                          {post.telefone && (
                            <div className="mt-2 flex items-center text-sm text-blue-600">
                              <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20" xmlns="http://www.w3.org/2000/svg">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                              </svg>
                              {post.telefone}
                            </div>
                          )}

                          {/* Ações */}
                          <div className="flex justify-end border-t border-gray-100 pt-3">
                            <button
                              onClick={() => deletarPost(post.id)}
                              className={`p-2 ${deletingPostId === post.id ? 'text-gray-400' : 'text-red-600 hover:bg-red-50'} rounded-full transition-colors`}
                              title="Excluir"
                              disabled={deletingPostId === post.id}
                            >
                              {deletingPostId === post.id ? (
                                <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin"></div>
                              ) : (
                                <FaTrash className="w-4 h-4" />
                              )}
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
