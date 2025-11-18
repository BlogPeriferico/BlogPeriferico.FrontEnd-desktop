import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FaArrowLeft, FaUser, FaNewspaper, FaSearch, FaTrash, FaUserCog } from 'react-icons/fa';
import { useRegiao } from '../../contexts/RegionContext';
import { regionColors } from '../../utils/regionColors';
import NoPicture from '../../assets/images/NoPicture.webp';
import api from '../../services/Api';
import { deletarUsuario } from '../../services/UsuarioService';

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('usuarios');
  const [searchTerm, setSearchTerm] = useState('');
  const [usuarios, setUsuarios] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingUser, setEditingUser] = useState(null);
  const [editingPost, setEditingPost] = useState(null);
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";
  const corSecundaria = regionColors[regiao]?.[1] || "#3B82F6";

  // Buscar dados iniciais
  useEffect(() => {
    carregarDados();
  }, []);

  const carregarDados = async () => {
    try {
      setLoading(true);
      // Buscar usuários
      const usuariosResponse = await api.get('/usuarios/listar');
      setUsuarios(usuariosResponse.data);
      
      // Buscar posts (ajuste a rota conforme sua API)
      const postsResponse = await api.get('/posts');
      setPosts(postsResponse.data);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  };

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
      try {
        await api.delete(`/posts/${postId}`);
        await carregarDados();
      } catch (error) {
        console.error('Erro ao excluir post:', error);
      }
    }
  };

  // Filtros
  const usuariosFiltrados = usuarios.filter(usuario => 
    usuario.nome.toLowerCase().includes(searchTerm.toLowerCase()) ||
    usuario.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const postsFiltrados = posts.filter(post => 
    post.titulo?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.conteudo?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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
        {/* Barra de pesquisa e estatísticas */}
        <div className="mb-8 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-1 max-w-2xl">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <FaSearch className="text-gray-400" />
              </div>
              <input
                type="text"
                className="block w-full pl-10 pr-3 py-3 border border-gray-200 rounded-lg leading-5 bg-gray-50 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm"
                placeholder={`Pesquisar ${activeTab === 'usuarios' ? 'usuários por nome ou e-mail...' : 'posts por título ou conteúdo...'}`}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              {activeTab === 'usuarios' && (
                <div className="p-4 rounded-lg text-center min-w-[150px]" style={{ 
                  backgroundColor: `${corPrincipal}15`, 
                  border: `1px solid ${corPrincipal}30`
                }}>
                  <div className="text-sm font-medium" style={{ color: corPrincipal }}>Total de Usuários</div>
                  <div className="text-2xl font-bold" style={{ color: corPrincipal }}>{usuarios.length}</div>
                </div>
              )}
              {activeTab === 'posts' && (
                <div className="p-4 rounded-lg text-center min-w-[150px]" style={{ 
                  backgroundColor: `${corSecundaria}15`, 
                  border: `1px solid ${corSecundaria}30`
                }}>
                  <div className="text-sm font-medium" style={{ color: corSecundaria }}>Total de Posts</div>
                  <div className="text-2xl font-bold" style={{ color: corSecundaria }}>{posts.length}</div>
                </div>
              )}
            </div>
          </div>
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

            {/* Tabela de Posts */}
            {activeTab === 'posts' && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 transition-all duration-300 hover:shadow-md">
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/80 backdrop-blur-sm">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Título
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Autor
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
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
                      {postsFiltrados.map((post) => (
                        <tr key={post.id}>
                          <td className="px-6 py-4">
                            <div className="text-sm font-medium text-gray-900">
                              {editingPost?.id === post.id ? (
                                <input
                                  type="text"
                                  className="border rounded px-2 py-1 w-full"
                                  defaultValue={post.titulo}
                                  onChange={(e) => setEditingPost({
                                    ...editingPost,
                                    titulo: e.target.value
                                  })}
                                />
                              ) : (
                                post.titulo
                              )}
                            </div>
                            <div className="text-sm text-gray-500 truncate max-w-xs">
                              {editingPost?.id === post.id ? (
                                <textarea
                                  className="border rounded px-2 py-1 w-full mt-1"
                                  defaultValue={post.conteudo}
                                  onChange={(e) => setEditingPost({
                                    ...editingPost,
                                    conteudo: e.target.value
                                  })}
                                  rows="2"
                                />
                              ) : (
                                post.conteudo?.substring(0, 100) + (post.conteudo?.length > 100 ? '...' : '')
                              )}
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-10 w-10">
                                <img 
                                  className="h-10 w-10 rounded-full" 
                                  src={post.autor?.fotoPerfil || 'https://via.placeholder.com/40'} 
                                  alt="" 
                                />
                              </div>
                              <div className="ml-4">
                                <div className="text-sm font-medium text-gray-900">
                                  {post.autor?.nome || 'Anônimo'}
                                </div>
                                <div className="text-sm text-gray-500">
                                  {post.autor?.email || ''}
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {new Date(post.dataCriacao || new Date()).toLocaleDateString('pt-BR')}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                              post.ativo !== false ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                            }`}>
                              {post.ativo !== false ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                            {editingPost?.id === post.id ? (
                              <>
                                <button
                                  onClick={() => salvarPost(post.id, editingPost)}
                                  className="text-green-600 hover:text-green-900 mr-4"
                                >
                                  <FaCheck className="inline" />
                                </button>
                                <button
                                  onClick={() => setEditingPost(null)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <FaTimes className="inline" />
                                </button>
                              </>
                            ) : (
                              <>
                                <button
                                  onClick={() => editarPost(post)}
                                  className="text-indigo-600 hover:text-indigo-900 mr-4"
                                >
                                  <FaEdit className="inline" />
                                </button>
                                <button
                                  onClick={() => deletarPost(post.id)}
                                  className="text-red-600 hover:text-red-900"
                                >
                                  <FaTrash className="inline" />
                                </button>
                              </>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
