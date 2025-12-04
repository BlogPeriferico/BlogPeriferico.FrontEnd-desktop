import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  FaArrowLeft,
  FaUser,
  FaNewspaper,
  FaSearch,
  FaTrash,
  FaUserCog
} from 'react-icons/fa';
import { useRegiao } from '../../contexts/RegionContext';
import { regionColors } from '../../utils/regionColors';
import NoPicture from '../../assets/images/NoPicture.webp';
import api from '../../services/Api';
import { deletarUsuario } from '../../services/UsuarioService';
import NoticiaService from '../../services/NoticiasService';
import DoacaoService from '../../services/DoacaoService';
import CorreCertoService from '../../services/CorreCertoService';
import AnuncioService from '../../services/AnuncioService';
import ComentariosService from '../../services/ComentariosService';
import { buscarPosts } from '../../services/PostService';
import { debounce } from 'lodash';

// Função para formatar a data no formato "DD/MM/YYYY às HH:MM"
const formatarData = (dataString) => {
  if (!dataString) return 'Data não disponível';

  const data = new Date(dataString);
  if (isNaN(data.getTime())) return 'Data inválida';

  const dia = String(data.getDate()).padStart(2, '0');
  const mes = String(data.getMonth() + 1).padStart(2, '0');
  const ano = data.getFullYear();
  const horas = String(data.getHours()).padStart(2, '0');
  const minutos = String(data.getMinutes()).padStart(2, '0');

  return `${dia}/${mes}/${ano} às ${horas}:${minutos}`;
};

// Função para obter a cor do tipo de post
const getCorTipoPost = (tipo) => {
  switch (tipo) {
    case 'noticias':
      return { bg: 'bg-blue-100', text: 'text-blue-800', border: 'border-blue-200' };
    case 'doacoes':
      return { bg: 'bg-green-100', text: 'text-green-800', border: 'border-green-200' };
    case 'vagas':
      return { bg: 'bg-purple-100', text: 'text-purple-800', border: 'border-purple-200' };
    case 'achadinhos':
      return { bg: 'bg-yellow-100', text: 'text-yellow-800', border: 'border-yellow-200' };
    default:
      return { bg: 'bg-gray-100', text: 'text-gray-800', border: 'border-gray-200' };
  }
};

// Função para obter a cor da região
const getCorRegiao = (regiao) => {
  if (!regiao) return { bg: 'bg-gray-100', text: 'text-gray-800' };

  const regiaoLower = regiao.toLowerCase();

  if (regiaoLower.includes('norte')) return { bg: 'bg-[#015E98]', text: 'text-white' };
  if (regiaoLower.includes('sul')) return { bg: 'bg-[#01A5D9]', text: 'text-white' };
  if (regiaoLower.includes('leste')) return { bg: 'bg-[#ED1D25]', text: 'text-white' };
  if (regiaoLower.includes('oeste')) return { bg: 'bg-[#FF6A00]', text: 'text-white' };
  if (regiaoLower.includes('centro')) return { bg: 'bg-[#8F8F8F]', text: 'text-white' };
  if (regiaoLower.includes('sudoeste')) return { bg: 'bg-[#9C0B10]', text: 'text-white' };
  if (regiaoLower.includes('sudeste')) return { bg: 'bg-[#046465]', text: 'text-white' };
  if (regiaoLower.includes('noroeste')) return { bg: 'bg-[#E8CC00]', text: 'text-gray-900' };

  return { bg: 'bg-gray-100', text: 'text-gray-800' };
};

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
  const [editingPost, setEditingPost] = useState(null); // reservado pra futura edição
  const [deletingPostId, setDeletingPostId] = useState(null);
  const [postsBuscados, setPostsBuscados] = useState([]);
  const [isSearchingPosts, setIsSearchingPosts] = useState(false);
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || '#1D4ED8';
  const corSecundaria = regionColors[regiao]?.[1] || '#3B82F6';

  // Função para processar os posts
  const processarPosts = useCallback(async (posts, tipo = '') => {
    if (!Array.isArray(posts)) return [];

    try {
      const usuariosResponse = await api.get('/usuarios/listar');
      const usuarios = usuariosResponse.data || [];

      return posts.map((post) => {
        const postData = post.attributes || post;

        const idUsuarioPost =
          postData.idUsuario ||
          postData.attributes?.idUsuario ||
          postData.usuarioId ||
          postData.usuario?.id;

        const autor = usuarios.find(
          (u) => String(u.id) === String(idUsuarioPost)
        );

        const autorFinal =
          autor || {
            nome:
              postData.nomeAnunciante ||
              postData.nomeDoador ||
              postData.usuario?.nome ||
              'Anônimo',
            id: idUsuarioPost || null,
            fotoPerfil: postData.usuario?.fotoPerfil || null
          };

        let dataCriacao =
          postData.dataHoraCriacao ||
          postData.createdAt ||
          postData.attributes?.dataHoraCriacao ||
          postData.attributes?.createdAt ||
          new Date().toISOString();

        if (dataCriacao && typeof dataCriacao === 'object' && dataCriacao.date) {
          dataCriacao = dataCriacao.date;
        }

        const basePost = {
          id: post.id || postData.id,
          titulo: postData.titulo || postData.Titulo || 'Sem título',
          imagem:
            postData.imagem?.data?.attributes?.url ||
            postData.imagem?.url ||
            postData.imagem ||
            postData.capa?.data?.attributes?.url ||
            postData.fotoCapa ||
            null,
          autor: {
            id: autorFinal.id || idUsuarioPost || null,
            nome: autorFinal.nome || 'Anônimo',
            fotoPerfil: autorFinal.fotoPerfil || NoPicture
          },
          regiao:
            postData.regiao?.data?.attributes?.nome ||
            postData.regiao?.nome ||
            postData.regiao ||
            postData.local ||
            postData.bairro ||
            'Geral',
          dataHoraCriacao: dataCriacao,
          tipo: tipo,
          ...postData
        };

        switch (tipo) {
          case 'achadinhos':
            return {
              ...basePost,
              preco: postData.preco || postData.valor || 0,
              conteudo: postData.descricao || postData.detalhes || 'Sem descrição',
              telefone:
                postData.telefone ||
                postData.contato ||
                postData.celular ||
                postData.whatsapp ||
                ''
            };

          case 'doacoes':
            return {
              ...basePost,
              conteudo:
                postData.descricao ||
                postData.detalhesDoacao ||
                'Sem descrição',
              categoria: postData.categoria || 'Doação',
              telefone:
                postData.telefone ||
                postData.contato ||
                postData.celular ||
                postData.whatsapp ||
                ''
            };

          case 'vagas':
            return {
              ...basePost,
              conteudo:
                postData.descricao ||
                postData.descricaoVaga ||
                'Sem descrição',
              telefone:
                postData.telefone ||
                postData.contato ||
                postData.celular ||
                postData.whatsapp ||
                ''
            };

          case 'noticias':
          default:
            return {
              ...basePost,
              conteudo:
                postData.corpo ||
                postData.conteudo ||
                postData.texto ||
                'Sem conteúdo'
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

      const postsIniciais = {
        noticias: [],
        doacoes: [],
        vagas: [],
        achadinhos: []
      };
      setPosts(postsIniciais);

      const usuariosResponse = await api.get('/usuarios/listar');
      setUsuarios(usuariosResponse.data || []);

      const [noticias, doacoes, vagas, achadinhos] = await Promise.all([
        NoticiaService.listarNoticias().catch((err) => {
          console.error('Erro ao carregar notícias:', err);
          return [];
        }),
        DoacaoService.listarDoacoes().catch((err) => {
          console.error('Erro ao carregar doações:', err);
          return [];
        }),
        CorreCertoService.listarCorrecertos().catch((err) => {
          console.error('Erro ao carregar vagas:', err);
          return [];
        }),
        AnuncioService.getAnuncios()
          .then((data) => (Array.isArray(data) ? data : []))
          .catch((err) => {
            console.error('Erro ao carregar achadinhos:', err);
            return [];
          })
      ]);

      const [
        noticiasProcessadas,
        doacoesProcessadas,
        vagasProcessadas,
        achadinhosProcessados
      ] = await Promise.all([
        processarPosts(noticias, 'noticias'),
        processarPosts(doacoes, 'doacoes'),
        processarPosts(vagas, 'vagas'),
        processarPosts(achadinhos, 'achadinhos')
      ]);

      setPosts({
        noticias: noticiasProcessadas,
        doacoes: doacoesProcessadas,
        vagas: vagasProcessadas,
        achadinhos: achadinhosProcessados
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
    } finally {
      setLoading(false);
    }
  }, [processarPosts]);

  useEffect(() => {
    carregarDados();
  }, [carregarDados]);

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
    if (
      window.confirm(
        'Tem certeza que deseja excluir este usuário? Esta ação não pode ser desfeita.'
      )
    ) {
      try {
        await deletarUsuario(usuarioId);
        setUsuarios((prev) => prev.filter((u) => u.id !== usuarioId));
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

  const alternarRoleUsuario = async (usuario) => {
    if (!window.confirm(`Tem certeza que deseja alterar o papel deste usuário para ${usuario.roles === 'ROLE_ADMINISTRADOR' ? 'Usuário' : 'Administrador'}?`)) {
      return;
    }

    try {
      const novoRole = usuario.roles === 'ROLE_ADMINISTRADOR' ? 'ROLE_USUARIO' : 'ROLE_ADMINISTRADOR';
      await api.patch(`/usuarios/${usuario.id}/alterar-role?novaRole=${novoRole}`, null, {
        withCredentials: true
      });
      await carregarDados();
      alert('Papel do usuário atualizado com sucesso!');
    } catch (error) {
      console.error('Erro ao atualizar papel do usuário:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Erro desconhecido';
      alert(`Erro ao atualizar papel do usuário: ${errorMessage}`);
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

  const deletarPost = async (postId, tipo) => {
    if (
      !window.confirm(
        'Tem certeza que deseja excluir este post? Esta ação não pode ser desfeita.'
      )
    ) {
      return;
    }

    setDeletingPostId(postId);

    try {
      if (tipo === 'noticias') {
        try {
          const comentarios =
            await ComentariosService.listarComentariosNoticia(postId);

          for (const comentario of comentarios) {
            await ComentariosService.excluirComentario(comentario.id);
          }
        } catch (error) {
          console.warn('Aviso ao tentar remover comentários:', error);
        }
      }

      switch (tipo) {
        case 'noticias':
          await NoticiaService.excluirNoticia(postId);
          break;
        case 'doacoes':
          await DoacaoService.excluirDoacao(postId);
          break;
        case 'vagas':
          await CorreCertoService.excluirVaga(postId);
          break;
        case 'achadinhos':
          await AnuncioService.excluirAnuncio(postId);
          break;
        default:
          throw new Error('Tipo de post não suportado');
      }

      await carregarDados();
      alert('Post excluído com sucesso!');
    } catch (error) {
      console.error('Erro ao excluir post:', error);
      let errorMessage = 'Ocorreu um erro ao excluir o post.';

      if (error.response?.status === 500) {
        errorMessage = 'Erro interno no servidor. Tente novamente mais tarde.';
      } else if (error.message) {
        errorMessage = error.message;
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }

      alert(`Erro: ${errorMessage}`);
    } finally {
      setDeletingPostId(null);
    }
  };

  // Busca de posts (admin)
  const debouncedSearchPosts = useRef(
    debounce(async (term) => {
      if (!term.trim()) {
        setPostsBuscados([]);
        setIsSearchingPosts(false);
        return;
      }

      try {
        setIsSearchingPosts(true);
        const resultados = await buscarPosts(term, 0, 100);
        setPostsBuscados(resultados || []);
      } catch (error) {
        console.error('Erro ao buscar posts:', error);
        setPostsBuscados([]);
      } finally {
        setIsSearchingPosts(false);
      }
    }, 300)
  ).current;

  useEffect(() => {
    if (activeTab === 'posts' && searchTerm.trim()) {
      setIsSearchingPosts(true);
      debouncedSearchPosts(searchTerm);
    } else {
      setPostsBuscados([]);
      setIsSearchingPosts(false);
    }

    return () => {
      debouncedSearchPosts.cancel();
    };
  }, [searchTerm, activeTab, debouncedSearchPosts]);

  // Filtros
  const usuariosFiltrados = usuarios.filter((usuario) => {
    const nome = (usuario.nome || '').toLowerCase();
    const email = (usuario.email || '').toLowerCase();
    const termo = searchTerm.toLowerCase();
    return nome.includes(termo) || email.includes(termo);
  });

  const getPostsFiltrados = (postsList) => {
    if (!searchTerm.trim()) {
      return postsList;
    }
    const termoLower = searchTerm.toLowerCase().trim();
    return postsList.filter((post) =>
      (post.titulo?.toLowerCase() || '').startsWith(termoLower)
    );
  };

  const [activePostType, setActivePostType] = useState('noticias');
  const postsAtivos = Array.isArray(posts[activePostType])
    ? posts[activePostType]
    : [];

  // Processar posts buscados (admin search)
  const processarPostsBuscados = useCallback(async (postsBuscados) => {
    if (!Array.isArray(postsBuscados) || postsBuscados.length === 0) {
      return [];
    }

    try {
      const usuariosResponse = await api.get('/usuarios/listar');
      const usuarios = usuariosResponse.data || [];

      return postsBuscados.map((post) => {
        const tipoPost = post.tipo || post.tipoPost || '';
        const tipoMapeado =
          tipoPost === 'noticia'
            ? 'noticias'
            : tipoPost === 'doacao'
            ? 'doacoes'
            : tipoPost === 'vaga'
            ? 'vagas'
            : tipoPost === 'achadinho' || tipoPost === 'venda'
            ? 'achadinhos'
            : 'noticias';

        const idUsuarioPost =
          post.idUsuario || post.usuarioId || post.usuario?.id || null;
        const autor = usuarios.find(
          (u) => String(u.id) === String(idUsuarioPost)
        );

        const autorFinal =
          autor || {
            nome:
              post.nomeAutor ||
              post.autor?.nome ||
              post.autor ||
              post.nomeAnunciante ||
              post.nomeDoador ||
              post.usuario?.nome ||
              'Anônimo',
            id: idUsuarioPost,
            fotoPerfil:
              post.fotoAutor ||
              post.autor?.fotoPerfil ||
              post.fotoPerfil ||
              post.usuario?.fotoPerfil ||
              NoPicture
          };

        return {
          ...post,
          tipo: tipoMapeado,
          titulo: post.titulo || 'Sem título',
          imagem: post.imagemCapa || post.imagem || post.urlImagem || null,
          conteudo:
            post.descricao || post.texto || post.conteudo || '',
          descricao: post.descricao || post.resumo || '',
          regiao: post.regiao || post.local || post.zona || 'Geral',
          dataHoraCriacao:
            post.dataPublicacao ||
            post.dataHoraCriacao ||
            post.dataCriacao ||
            post.createdAt,
          autor: {
            id: autorFinal.id || idUsuarioPost,
            nome: autorFinal.nome || 'Anônimo',
            fotoPerfil: autorFinal.fotoPerfil || NoPicture
          }
        };
      });
    } catch (error) {
      console.error('Erro ao processar posts buscados:', error);
      return [];
    }
  }, []);

  const [postsBuscadosProcessados, setPostsBuscadosProcessados] = useState([]);

  useEffect(() => {
    if (
      activeTab === 'posts' &&
      searchTerm.trim() &&
      !isSearchingPosts &&
      postsBuscados.length > 0
    ) {
      processarPostsBuscados(postsBuscados).then((processed) => {
        setPostsBuscadosProcessados(processed);
      });
    } else {
      setPostsBuscadosProcessados([]);
    }
  }, [
    postsBuscados,
    isSearchingPosts,
    activeTab,
    searchTerm,
    processarPostsBuscados
  ]);

  const postsFiltrados =
    activeTab === 'posts' && searchTerm.trim()
      ? isSearchingPosts
        ? []
        : postsBuscadosProcessados
            .filter((post) => {
              const termoLower = searchTerm.toLowerCase().trim();
              return (post.titulo?.toLowerCase() || '').startsWith(termoLower);
            })
            .filter((post) => post.tipo === activePostType)
      : getPostsFiltrados(postsAtivos);

  const totais = {
    noticias: posts.noticias.length,
    doacoes: posts.doacoes.length,
    vagas: posts.vagas.length,
    achadinhos: posts.achadinhos.length,
    totalGeral: Object.values(posts).reduce(
      (acc, curr) => acc + (Array.isArray(curr) ? curr.length : 0),
      0
    )
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Cabeçalho fixo */}
      <header 
        className="fixed top-0 left-0 right-0 z-20 shadow-lg py-3"
        style={{
          background: `linear-gradient(90deg, ${corPrincipal} 0%, ${corSecundaria} 100%)`
        }}
      >
        <div className="h-full flex items-center">
          <div className="max-w-7xl w-full mx-auto px-3 sm:px-4 lg:px-6">
            {/* Espaço reservado para conteúdo do header se necessário */}
          </div>
        </div>
      </header>

      {/* Espaçamento para o conteúdo não ficar atrás do header fixo */}
      <div className="pt-16">
        {/* Abas de navegação */}
        <div className="sticky top-16 z-10">
          <div className="w-full py-3" style={{ 
            background: `linear-gradient(90deg, ${corPrincipal} 0%, ${corSecundaria} 100%)`,
            backdropFilter: 'blur(8px)'
          }}>
            <div className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6">
              <div className="flex justify-center">
                <div className="w-full max-w-4xl">
                  <div 
                    className="flex rounded-xl overflow-hidden text-sm sm:text-base shadow-lg border border-white/20"
                    style={{ 
                      backgroundColor: 'rgba(255, 255, 255, 0.85)',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.1)'
                    }}
                  >
                <button
                  onClick={() => {
                    setActiveTab('usuarios');
                    setSearchTerm('');
                    setPostsBuscados([]);
                  }}
                  className={`flex-1 py-2 sm:py-3 font-medium flex items-center justify-center gap-1 sm:gap-2 transition-all duration-300 ${
                    activeTab === 'usuarios'
                      ? 'bg-white shadow-md text-gray-800'
                      : 'text-gray-600 hover:bg-white/50 hover:text-gray-800'
                  }`}
                >
                  <FaUser className="text-base sm:text-lg" />
                  <span>Usuários</span>
                </button>
                <button
                  onClick={() => {
                    setActiveTab('posts');
                    setSearchTerm('');
                    setPostsBuscados([]);
                  }}
                  className={`flex-1 py-2 sm:py-3 font-medium flex items-center justify-center gap-1 sm:gap-2 transition-all duration-300 ${
                    activeTab === 'posts'
                      ? 'bg-white shadow-md text-gray-800'
                      : 'text-gray-600 hover:bg-white/50 hover:text-gray-800'
                  }`}
                >
                  <FaNewspaper className="text-base sm:text-lg" />
                  <span>Posts</span>
                </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Conteúdo */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Estatísticas e pesquisa */}
        <div className="mb-4 sm:mb-6 bg-white rounded-xl shadow-sm p-4 sm:p-5 md:p-6 border border-gray-100">
          {activeTab === 'usuarios' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    className="flex items-center gap-3 p-3 sm:px-5 sm:py-3 rounded-xl w-full"
                    style={{
                      backgroundColor: `${corPrincipal}15`,
                      border: `1px solid ${corPrincipal}30`
                    }}
                  >
                    <FaUserCog
                      className="text-xl sm:text-2xl flex-shrink-0"
                      style={{ color: corPrincipal }}
                    />
                    <h2
                      className="text-xl sm:text-2xl font-bold truncate"
                      style={{ color: corPrincipal }}
                    >
                      Painel de Admin
                    </h2>
                  </div>
                  <div
                    className="p-3 sm:p-4 rounded-lg text-center w-full"
                    style={{
                      backgroundColor: `${corSecundaria}15`,
                      border: `1px solid ${corSecundaria}30`
                    }}
                  >
                    <div
                      className="text-xs sm:text-sm font-medium"
                      style={{ color: corSecundaria }}
                    >
                      Total de Usuários
                    </div>
                    <div
                      className="text-xl sm:text-2xl font-bold"
                      style={{ color: corSecundaria }}
                    >
                      {usuarios.length}
                    </div>
                  </div>
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
                <div className="w-full grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div
                    className="flex items-center gap-3 p-3 sm:px-5 sm:py-3 rounded-xl w-full"
                    style={{
                      backgroundColor: `${corPrincipal}15`,
                      border: `1px solid ${corPrincipal}30`
                    }}
                  >
                    <FaUserCog
                      className="text-xl sm:text-2xl flex-shrink-0"
                      style={{ color: corPrincipal }}
                    />
                    <h2
                      className="text-xl sm:text-2xl font-bold truncate"
                      style={{ color: corPrincipal }}
                    >
                      Painel de Admin
                    </h2>
                  </div>
                  <div
                    className="p-3 sm:p-4 rounded-lg text-center w-full"
                    style={{
                      backgroundColor: `${corSecundaria}15`,
                      border: `1px solid ${corSecundaria}30`
                    }}
                  >
                    <div
                      className="text-xs sm:text-sm font-medium"
                      style={{ color: corSecundaria }}
                    >
                      Total de Posts
                    </div>
                    <div
                      className="text-xl sm:text-2xl font-bold"
                      style={{ color: corSecundaria }}
                    >
                      {totais.totalGeral}
                    </div>
                  </div>
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
                <div className="overflow-x-auto -mx-1 sm:mx-0">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50/80 backdrop-blur-sm hidden sm:table-header-group">
                      <tr>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Nome
                        </th>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                          Email
                        </th>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Tipo
                        </th>
                        <th className="px-2 sm:px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                          Status
                        </th>
                        <th className="px-2 sm:px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Ações
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {usuariosFiltrados.map((usuario) => (
                        <tr key={usuario.id}>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center">
                              <div className="flex-shrink-0 h-8 w-8 sm:h-9 sm:w-9 relative">
                                <img
                                  className="h-8 w-8 sm:h-9 sm:w-9 rounded-full object-cover cursor-pointer hover:opacity-80 transition-opacity border border-gray-200"
                                  src={usuario.fotoPerfil || NoPicture}
                                  alt={usuario.nome || 'Usuário'}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    navigate(`/perfil/${usuario.id}`);
                                  }}
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.src = NoPicture;
                                  }}
                                />
                                <span 
                                  className={`absolute bottom-0 right-0 block h-2.5 w-2.5 rounded-full border-2 border-white sm:hidden ${
                                    usuario.ativo !== false ? 'bg-green-500' : 'bg-red-500'
                                  }`}
                                  title={usuario.ativo !== false ? 'Ativo' : 'Inativo'}
                                />
                              </div>
                              <div className="ml-2 sm:ml-3 min-w-0">
                                <div className="text-sm font-medium text-gray-900 truncate max-w-[120px] sm:max-w-[180px] md:max-w-xs">
                                  {editingUser?.id === usuario.id ? (
                                    <input
                                      type="text"
                                      className="border rounded px-2 py-1 w-full text-sm"
                                      defaultValue={usuario.nome}
                                      onChange={(e) =>
                                        setEditingUser({
                                          ...editingUser,
                                          nome: e.target.value
                                        })
                                      }
                                    />
                                  ) : (
                                    <span className="truncate block">{usuario.nome}</span>
                                  )}
                                </div>
                                <div className="text-xs text-gray-500 truncate max-w-[120px] sm:max-w-[180px] md:max-w-xs">
                                  {usuario.username && (
                                    <div className="truncate">@{usuario.username}</div>
                                  )}
                                  <div className="text-xs text-gray-600 font-medium truncate hidden sm:block">
                                    {usuario.email}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap hidden lg:table-cell">
                            {editingUser?.id === usuario.id ? (
                              <input
                                type="email"
                                className="border rounded px-2 py-1 w-full text-sm"
                                defaultValue={usuario.email}
                                onChange={(e) =>
                                  setEditingUser({
                                    ...editingUser,
                                    email: e.target.value
                                  })
                                }
                              />
                            ) : (
                              <div className="text-sm text-gray-900 truncate max-w-[120px] md:max-w-xs">
                                {usuario.email}
                              </div>
                            )}
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap">
                            <div className="flex items-center space-x-1 sm:space-x-2">
                              <span
                                className={`px-1.5 sm:px-2 py-0.5 inline-flex text-[10px] sm:text-xs leading-4 sm:leading-5 font-semibold rounded-full whitespace-nowrap ${
                                  usuario.roles === 'ROLE_ADMINISTRADOR'
                                    ? 'bg-green-100 text-green-800 border border-green-200'
                                    : 'bg-blue-100 text-blue-800 border border-blue-200'
                                }`}
                              >
                                {usuario.roles === 'ROLE_ADMINISTRADOR'
                                  ? 'Admin'
                                  : 'Usuário'}
                              </span>
                              <button
                                onClick={() => alternarRoleUsuario(usuario)}
                                className="p-0.5 sm:p-1 rounded-full hover:bg-gray-100 text-gray-500 hover:text-blue-600 transition-colors"
                                title={`Mudar para ${usuario.roles === 'ROLE_ADMINISTRADOR' ? 'Usuário' : 'Administrador'}`}
                              >
                                <FaUserCog className="h-3 w-3 sm:h-4 sm:w-4" />
                              </button>
                            </div>
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap hidden sm:table-cell">
                            <span
                              className={`px-2 py-0.5 sm:py-1 inline-flex text-[10px] sm:text-xs leading-4 sm:leading-5 font-semibold rounded-full border ${
                                usuario.ativo !== false
                                  ? 'bg-green-50 text-green-800 border-green-200'
                                  : 'bg-red-50 text-red-800 border-red-200'
                              }`}
                            >
                              {usuario.ativo !== false ? 'Ativo' : 'Inativo'}
                            </span>
                          </td>
                          <td className="px-2 sm:px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                            <div className="flex justify-end space-x-1 sm:space-x-2">
                              <button
                                onClick={() => handleDeleteUser(usuario.id)}
                                className="p-1.5 rounded-full bg-red-50 hover:bg-red-100 text-red-600 hover:text-red-800 transition-colors border border-red-100"
                                title="Excluir usuário"
                              >
                                <FaTrash className="h-3.5 w-3.5" />
                              </button>
                            </div>
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
                <div className="bg-white p-3 sm:p-4 rounded-xl shadow-sm border border-gray-100 space-y-4">
                  <div className="flex flex-wrap gap-2 overflow-x-auto pb-2 -mx-2 px-2">
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
                        {tab.name}{' '}
                        <span className="font-normal">
                          ({totais[tab.id] || 0})
                        </span>
                      </button>
                    ))}
                  </div>

                  {/* Barra de pesquisa */}
                  <div className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <FaSearch
                        className={`h-4 w-4 ${
                          isSearchingPosts ? 'text-blue-500' : 'text-gray-400'
                        }`}
                      />
                    </div>
                    <input
                      type="text"
                      className="block w-full pl-10 pr-10 py-2 border border-gray-300 rounded-lg bg-white shadow-sm focus:outline-none focus:ring-1 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
                      placeholder="Pesquisar posts por título..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    {isSearchingPosts && (
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <div
                          className="animate-spin rounded-full h-4 w-4 border-t-2 border-b-2"
                          style={{ borderColor: corPrincipal }}
                        ></div>
                      </div>
                    )}
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
                ) : activeTab === 'posts' &&
                  searchTerm.trim() &&
                  isSearchingPosts ? (
                  <div className="flex justify-center items-center h-64">
                    <div className="text-center">
                      <div
                        className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 mx-auto mb-4"
                        style={{ borderColor: corPrincipal }}
                      ></div>
                      <p className="text-gray-600">Buscando posts...</p>
                    </div>
                  </div>
                ) : postsFiltrados.length === 0 ? (
                  <div className="text-center py-16 bg-white rounded-lg shadow-sm">
                    <div className="text-gray-400 mb-2">
                      <svg
                        className="w-12 h-12 mx-auto"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1"
                          d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                    </div>
                    <h3 className="text-lg font-medium text-gray-900">
                      Nenhum post encontrado
                    </h3>
                    <p className="mt-1 text-sm text-gray-500">
                      {searchTerm.trim()
                        ? `Nenhum post encontrado com o termo "${searchTerm}"`
                        : 'Não há posts para exibir nesta categoria.'}
                    </p>
                  </div>
                ) : activeTab === 'posts' &&
                  searchTerm.trim() &&
                  isSearchingPosts ? null : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6 px-2 sm:px-0">
                    {postsFiltrados.map((post) => {
                      const tipoPost = getCorTipoPost(post.tipo);
                      const dataFormatada = formatarData(
                        post.dataHoraCriacao
                      );

                      return (
                        <div
                          key={post.id}
                          className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-100 hover:shadow-xl transition-all duration-300 flex flex-col h-full"
                        >
                          {/* Imagem */}
                          <div className="relative h-48 overflow-hidden group">
                            <img
                              src={
                                post.imagem ||
                                'https://via.placeholder.com/600x400?text=Sem+imagem'
                              }
                              alt={post.titulo}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              onError={(e) => {
                                e.target.onerror = null;
                                e.target.src =
                                  'https://via.placeholder.com/600x400?text=Imagem+não+disponível';
                              }}
                            />

                            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                            {/* Tipo */}
                            <div className="absolute top-3 left-3 right-3 flex justify-between">
                              <div
                                className={`px-3 py-1 rounded-full text-xs font-semibold ${tipoPost.bg} ${tipoPost.text} ${tipoPost.border} border`}
                              >
                                {post.tipo === 'noticias'
                                  ? 'Notícia'
                                  : post.tipo === 'doacoes'
                                  ? 'Doação'
                                  : post.tipo === 'vagas'
                                  ? 'Vaga'
                                  : 'Achadinho'}
                              </div>

                              {/* Região */}
                              {(() => {
                                const regiaoTexto =
                                  post.zona || post.regiao || 'Geral';
                                const corRegiao =
                                  getCorRegiao(regiaoTexto);
                                return (
                                  <div
                                    className={`px-3 py-1 rounded-full text-xs font-semibold ${corRegiao.bg} ${corRegiao.text} shadow-md`}
                                  >
                                    {regiaoTexto}
                                  </div>
                                );
                              })()}
                            </div>
                          </div>

                          {/* Conteúdo */}
                          <div className="p-5 flex-1 flex flex-col">
                            {/* Autor */}
                            <div className="flex items-center justify-between mb-3">
                              <div className="flex items-center">
                                <div className="relative">
                                  <img
                                    src={post.autor?.fotoPerfil || NoPicture}
                                    alt={post.autor?.nome || 'Autor'}
                                    className="w-10 h-10 rounded-full object-cover border-2 border-white shadow-md"
                                    onError={(e) => {
                                      e.target.onerror = null;
                                      e.target.src = NoPicture;
                                    }}
                                  />
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">
                                    {post.autor?.nome || 'Anônimo'}
                                  </p>
                                </div>
                              </div>
                            </div>

                            <div className="flex-1">
                              <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 leading-snug">
                                {post.titulo}
                              </h3>

                              <p className="text-gray-600 text-sm mb-4 line-clamp-3">
                                {post.descricao ||
                                  post.conteudo ||
                                  'Sem descrição disponível.'}
                              </p>
                            </div>

                            <div className="my-3 border-t border-gray-100"></div>

                            <div className="mt-auto pt-1">
                              {/* Preço */}
                              {post.tipo === 'achadinhos' &&
                                post.preco !== undefined &&
                                post.preco !== null && (
                                  <div className="mb-3">
                                    <span className="text-xl font-bold text-green-600">
                                      R${' '}
                                      {Number(post.preco)
                                        .toFixed(2)
                                        .replace('.', ',')}
                                    </span>
                                  </div>
                                )}

                              {/* Telefone */}
                              {post.telefone && (
                                <div className="flex items-center text-sm text-blue-600 mb-3">
                                  <svg
                                    className="w-4 h-4 mr-2"
                                    fill="currentColor"
                                    viewBox="0 0 20 20"
                                  >
                                    <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z" />
                                  </svg>
                                  {post.telefone}
                                </div>
                              )}

                              {/* Data + Excluir */}
                              <div className="flex justify-between items-center pt-2">
                                <div className="text-xs text-gray-500">
                                  {dataFormatada}
                                </div>

                                <div className="flex items-center space-x-2">
                                  <button
                                    onClick={() =>
                                      deletarPost(post.id, post.tipo)
                                    }
                                    className={`p-2 rounded-full transition-colors ${
                                      deletingPostId === post.id
                                        ? 'text-gray-400'
                                        : 'text-red-600 hover:bg-red-50'
                                    }`}
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </>
        )}
        </div>
      </div>
    </div>
  );
}
