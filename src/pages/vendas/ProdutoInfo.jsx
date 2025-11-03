import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import ComentariosService from "../../services/ComentariosService";
import AnuncioService from "../../services/AnuncioService";
import api from "../../services/Api";
import { useRegiao } from "../../contexts/RegionContext";
import { useUser } from "../../contexts/UserContext.jsx";
import { regionColors } from "../../utils/regionColors";
import { FaTimes, FaTrash } from "react-icons/fa";
import ModalConfirmacao from "../../components/modals/ModalConfirmacao";
import NoPicture from "../../assets/images/NoPicture.webp";

export default function ProdutoInfo() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { regiao } = useRegiao();
  const { user } = useUser();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";

  const [produto, setProduto] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [comentLoading, setComentLoading] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState({ id: null, email: null, nome: "Visitante", papel: null });
  const [modalDeletar, setModalDeletar] = useState({
    isOpen: false,
    comentarioId: null,
  });
  const [modalDeletarProduto, setModalDeletarProduto] = useState(false);
  const [lastSyncTimestamp, setLastSyncTimestamp] = useState(Date.now());
  const [showLoginAlert, setShowLoginAlert] = useState(false);
  const [nomeAutor, setNomeAutor] = useState(null);

  // Carregar perfil do usuário usando UserContext
  useEffect(() => {
    if (user && user.id) {
      const userData = {
        id: user.id,
        email: user.email,
        nome: user.nome,
        role: user.role || user.roles || user.papel,
        roles: user.roles || user.role || user.papel,
        papel: user.papel || user.role || user.roles,
        fotoPerfil: user.fotoPerfil,
      };
      setUsuarioLogado(userData);
    }
  }, [user]);

  // Atualiza fotoPerfil do produto quando foto do usuário muda
  useEffect(() => {
    if (produto && user?.id && produto.idUsuario === user.id) {
      const novaFoto = user.fotoPerfil || NoPicture;

      // Só atualiza se a foto realmente mudou
      if (novaFoto !== produto.fotoPerfil) {
        console.log("🔄 ProdutoInfo - Atualizando fotoPerfil do produto:", produto.id);
        console.log("📷 Foto antes:", produto.fotoPerfil);
        console.log("📷 Foto depois:", novaFoto);

        setProduto(prevProduto => ({
          ...prevProduto,
          fotoPerfil: novaFoto
        }));

        console.log("✅ ProdutoInfo - fotoPerfil atualizada");
      } else {
        console.log("🔄 ProdutoInfo - Foto já está atualizada:", novaFoto);
      }
    }
  }, [user?.fotoPerfil, produto?.id, produto?.idUsuario, user?.id]);

  // Sincroniza fotoPerfil inicial quando produto e usuário estão disponíveis
  useEffect(() => {
    if (produto && user?.id && produto.idUsuario === user.id && user.fotoPerfil && !produto.fotoPerfil) {
      console.log("🔄 ProdutoInfo - Sincronizando fotoPerfil inicial:", produto.id);
      console.log("📷 Foto do usuário:", user.fotoPerfil);

      setProduto(prevProduto => ({
        ...prevProduto,
        fotoPerfil: user.fotoPerfil
      }));

      console.log("✅ ProdutoInfo - fotoPerfil inicial sincronizada");
    }
  }, [produto, user]);

  // Atualiza avatar dos comentários existentes quando foto do usuário muda
  useEffect(() => {
    console.log("🔄 ProdutoInfo - User mudou:", {
      id: user?.id,
      fotoPerfil: user?.fotoPerfil,
      comentariosCount: comentarios.length
    });

    if (user?.id && comentarios.length > 0) {
      console.log("🔄 ProdutoInfo - Atualizando comentários existentes...");

      setComentarios(prevComentarios => {
        const updated = prevComentarios.map(coment => {
          const isUserComment = coment.idUsuario === user.id || coment.emailUsuario === user.email;

          if (isUserComment) {
            console.log(`✅ ProdutoInfo - Atualizando comentário ${coment.id}:`, {
              de: coment.avatar,
              para: user.fotoPerfil || NoPicture
            });
            return { ...coment, avatar: user.fotoPerfil || NoPicture };
          }
          return coment;
        });

        console.log("✅ ProdutoInfo - Comentários atualizados:", updated.length);
        return updated;
      });

      setLastSyncTimestamp(Date.now());
    }
  }, [user?.fotoPerfil, user?.id, comentarios.length]);

  // Carrega comentários apenas se não foram atualizados recentemente
  useEffect(() => {
    const carregarComentarios = async () => {
      try {
        const comentarios = await ComentariosService.listarComentariosProduto(id);
        
        // Buscar todos os usuários para obter as fotos de perfil
        const response = await api.get("/usuarios/listar");
        const usuarios = response.data;
        
        // Mapear comentários e adicionar avatar
        const comentariosComAvatar = comentarios.map(coment => {
          // Encontrar o usuário que fez o comentário
          const usuarioComentario = usuarios.find(u => 
            u.id === coment.idUsuario || u.email === coment.emailUsuario
          );
          
          // Se encontrou o usuário e ele tem foto de perfil, usa a foto
          if (usuarioComentario?.fotoPerfil) {
            return { ...coment, avatar: usuarioComentario.fotoPerfil };
          }
          
          // Se for o próprio usuário logado, usa a foto do perfil atual
          if ((coment.idUsuario === user?.id || coment.emailUsuario === user?.email) && user?.fotoPerfil) {
            return { ...coment, avatar: user.fotoPerfil };
          }
          
          // Se não encontrou foto, mantém o que já tem ou usa a imagem padrão
          return { ...coment, avatar: coment.avatar || NoPicture };
        });

        // Só atualiza se não houve sincronização recente (últimos 2 segundos)
        if (Date.now() - lastSyncTimestamp > 2000) {
          console.log("🔄 ProdutoInfo - Carregando comentários do backend:", comentariosComAvatar.length);
          setComentarios(comentariosComAvatar);
        } else {
          console.log("🔄 ProdutoInfo - Pulando reload - sincronização recente");
        }
      } catch (err) {
        console.error("❌ Erro ao buscar comentários:", err);
        setComentarios([]);
      }
    };

    carregarComentarios();
  }, [id, produto]);

  // Função para carregar os dados do autor do produto
  const carregarAutor = useCallback(async (produtoData) => {
    if (!produtoData) return null;
    
    console.log('🔍 Buscando autor para o produto:', {
      id: produtoData.id,
      idUsuario: produtoData.idUsuario,
      emailUsuario: produtoData.emailUsuario,
      autorAtual: produtoData.autor
    });

    // Tenta buscar por idUsuario primeiro (caso mais comum)
    if (produtoData.idUsuario) {
      try {
        console.log(`🔍 Buscando usuário por ID: ${produtoData.idUsuario}`);
        const response = await api.get(`/usuarios/${produtoData.idUsuario}`);
        if (response.data) {
          console.log('✅ Usuário encontrado por ID:', response.data.nome);
          return {
            id: response.data.id,
            nome: response.data.nome,
            fotoPerfil: response.data.fotoPerfil  
          };
        }
      } catch (err) {
        console.warn('❌ Erro ao buscar usuário por ID, tentando listar todos...', err);
        
        // Se falhar, tenta listar todos e filtrar localmente
        try {
          console.log('🔍 Listando todos os usuários para encontrar por ID...');
          const response = await api.get('/usuarios/listar');
          const usuario = response.data.find(u => u.id === produtoData.idUsuario);
          if (usuario) {
            console.log('✅ Usuário encontrado na lista:', usuario.nome);
            return {
              id: usuario.id,
              nome: usuario.nome,
              fotoPerfil: usuario.fotoPerfil   
            };
          }
        } catch (listErr) {
          console.error('❌ Erro ao listar usuários:', listErr);
        }
      }
    }

    // Se não encontrou por ID, tenta por email
    if (produtoData.emailUsuario) {
      try {
        console.log(`📧 Buscando usuário por email: ${produtoData.emailUsuario}`);
        const response = await api.get('/usuarios/listar');
        const usuario = response.data.find(u => u.email === produtoData.emailUsuario);
        if (usuario) {
          console.log('✅ Usuário encontrado por email:', usuario.nome);
          return {
            id: usuario.id,
            nome: usuario.nome,
            fotoPerfil: usuario.fotoPerfil  
          };
        }
      } catch (err) {
        console.error('❌ Erro ao buscar usuário por email:', err);
      }
    }

    // Se não encontrou de nenhuma forma, tenta usar o autor direto do produto
    if (produtoData.autor) {
      console.log('ℹ️ Usando nome do autor diretamente do produto');
      return {
        id: produtoData.idUsuario || null,
        nome: produtoData.autor,
        fotoPerfil: produtoData.fotoPerfil   
      };
    }

    console.warn('⚠️ Não foi possível encontrar informações do autor');
    return null;
  }, []);

  // Carregar produto e comentários
  useEffect(() => {
    let isMounted = true;
    
    const carregarDados = async () => {
      try {
        setLoading(true);
        
        // Carrega o produto
        const produtoData = await AnuncioService.buscarAnuncioPorId(id);
        
        if (!isMounted) return;
        
        // Busca os dados do autor
        const autorInfo = await carregarAutor(produtoData);
        
        if (autorInfo) {
          // Atualiza os dados do produto com as informações do autor
          produtoData.autor = autorInfo.nome;
          produtoData.fotoPerfil = autorInfo.fotoPerfil;
          produtoData.idUsuario = autorInfo.id;
        } else {
          // Se não encontrou o autor, limpa as informações
          produtoData.autor = null;
          produtoData.fotoPerfil = null;
        }
        
        setProduto(produtoData);
        
        // Carrega os comentários
        try {
          const comentariosData = await ComentariosService.listarComentariosProduto(id);
          if (isMounted) {
            setComentarios(comentariosData);
          }
        } catch (err) {
          console.error('Erro ao carregar comentários:', err);
          if (isMounted) {
            setComentarios([]);
          }
        }
      } catch (err) {
        console.error('Erro ao carregar produto:', err);
        if (isMounted) {
          setProduto(null);
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };
    
    carregarDados();
    
    return () => {
      isMounted = false;
    };
  }, [id, carregarAutor]);

  // Atualiza o nome do autor quando o produto for carregado
  useEffect(() => {
    if (produto?.autor) {
      setNomeAutor(produto.autor);
    } else {
      setNomeAutor(null);
    }
  }, [produto]);

  // Verificação de permissões baseada no usuário do contexto (alinhado com Notícias/Doação)
  console.log('\n🔍 VERIFICAÇÃO DE PERMISSÕES (PRODUTO)');
  const userRole = usuarioLogado?.role || usuarioLogado?.roles || usuarioLogado?.papel || '';
  const roleNormalized = String(userRole || '').toUpperCase();
  const isAdmin = roleNormalized.includes('ADMIN') || roleNormalized.includes('ADMINISTRADOR');
  const isAutor = Boolean(
    produto && usuarioLogado && (
      produto.idUsuario === usuarioLogado.id ||
      produto.emailUsuario === usuarioLogado.email ||
      produto.autor === usuarioLogado.nome ||
      (produto.autor && produto.autor.email === usuarioLogado.email)
    )
  );
  const podeExcluirProduto = Boolean(produto && usuarioLogado && (isAdmin || isAutor));
  
  console.log('🔑 Dados de permissão (Produto):', {
    role: userRole,
    roleNormalized,
    isAdmin,
    isAutor,
    podeExcluirProduto
  });
  
  // Log do usuário logado para debug
  console.log('👤 Dados do usuário logado (Produto):', {
    id: usuarioLogado?.id,
    nome: usuarioLogado?.nome,
    email: usuarioLogado?.email,
    role: usuarioLogado?.role || usuarioLogado?.roles || usuarioLogado?.papel,
    isAdmin,
    isAutor,
    podeExcluirProduto
  });

  // Efeito para depuração
  useEffect(() => {
    if (produto && usuarioLogado.id) {
      console.log("📌 DETALHES DO PRODUTO:", {
        id: produto.id,
        titulo: produto.titulo,
        idUsuario: produto.idUsuario,
        emailUsuario: produto.emailUsuario,
        autor: produto.autor
      });
    }
  }, [produto, usuarioLogado]);

  // Deletar produto
  const handleDeletarProduto = async () => {
    try {
      console.log("\n🗑️ === TENTANDO EXCLUIR PRODUTO ===");
      console.log("📌 DETALHES DA EXCLUSÃO:");
      console.log("ID do produto:", id);
      console.log("👤 USUÁRIO LOGADO:", {
        id: usuarioLogado?.id,
        nome: usuarioLogado?.nome,
        email: usuarioLogado?.email,
        role: userRole,
        isAdmin: isAdmin
      });

      // Verificação de segurança adicional
      if (!podeExcluirProduto) {
        throw new Error("Usuário não tem permissão para excluir este produto");
      }

      // Mostra um diálogo de confirmação
      const confirmacao = window.confirm(
        `Tem certeza que deseja excluir o produto "${produto?.titulo || 'sem título'}"?\n` +
        "Esta ação não pode ser desfeita."
      );
      
      if (!confirmacao) {
        console.log("❌ Exclusão cancelada pelo usuário");
        return;
      }

      // Mostra um indicador de carregamento
      setLoading(true);
      
      // Chama o serviço de exclusão
      await AnuncioService.excluirAnuncio(id);
      
      console.log("✅ Produto excluído com sucesso!");
      setModalDeletarProduto(false);
      
      // Mostra mensagem de sucesso
      alert("✅ Produto excluído com sucesso!");
      
      // Redireciona para a página de achadinhos após um pequeno delay
      setTimeout(() => {
        navigate("/achadinhos");
      }, 500);
      
    } catch (error) {
      console.error("❌ ERRO AO EXCLUIR PRODUTO:", error);
      console.error("❌ Status:", error.status || error.response?.status);
      console.error("❌ Código:", error.code);
      console.error("❌ Dados da resposta:", error.response?.data);
      
      let mensagemErro = "Não foi possível excluir o produto.\n\n";
      
      // Mensagens de erro mais amigáveis
      const status = error.status || error.response?.status;
      
      if (status === 401) {
        mensagemErro += "Sua sessão expirou. Por favor, faça login novamente.";
        // Limpa os dados de autenticação
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        localStorage.removeItem("userRole");
        localStorage.removeItem("email");
        // Redireciona para a página de login
        setTimeout(() => window.location.href = "/login", 1000);
      } else if (status === 403) {
        mensagemErro += "❌ Acesso negado!\n\n";
        mensagemErro += `Você não tem permissão para excluir este produto.\n\n`;
        mensagemErro += `Detalhes para diagnóstico:\n`;
        mensagemErro += `- ID do usuário: ${usuarioLogado?.id || 'N/A'}\n`;
        mensagemErro += `- Nome: ${usuarioLogado?.nome || 'N/A'}\n`;
        mensagemErro += `- Papel: ${userRole || 'N/A'}\n`;
        mensagemErro += `- ID do produto: ${produto?.id || 'N/A'}\n`;
        mensagemErro += `- Autor do produto: ${produto?.usuario?.nome || produto?.autor || 'N/A'}\n`;
        mensagemErro += `- ID do autor: ${produto?.usuario?.id || produto?.idUsuario || 'N/A'}\n\n`;
        mensagemErro += `Se você acredita que isso é um erro, entre em contato com o suporte.`;
      } else if (status === 404) {
        mensagemErro += "O produto não foi encontrado ou já foi excluído.";
        // Atualiza a página para refletir as mudanças
        setTimeout(() => window.location.reload(), 1500);
      } else {
        mensagemErro += `${error.message || 'Erro desconhecido'}.\n`;
        mensagemErro += "Por favor, tente novamente mais tarde.";
      }
      
      // Mostra a mensagem de erro
      alert(mensagemErro);
      
    } finally {
      // Esconde o indicador de carregamento
      setLoading(false);
    }
  };

  // Publicar comentário
  const handlePublicarComentario = async () => {
    if (!user?.id) {
      setShowLoginAlert(true);
      return;
    }
    
    if (!novoComentario.trim()) return;

    // Aguardar o carregamento do ID do usuário
    if (!usuarioLogado.id) {
      alert("Aguarde o carregamento do perfil ou faça login novamente.");
      return;
    }

    setComentLoading(true);

    try {
      const dto = {
        texto: novoComentario,
        idVenda: Number(id),
        idUsuario: usuarioLogado.id,
        tipo: "VENDA"
      };

      console.log("📤 Enviando comentário:", dto);

      const comentarioCriado = await ComentariosService.criarComentario(dto);

      if (!comentarioCriado.nomeUsuario) {
        comentarioCriado.nomeUsuario = user.nome || "Você";
        comentarioCriado.dataHoraCriacao = new Date().toISOString();
        comentarioCriado.avatar = user.fotoPerfil || NoPicture;
      }

      setComentarios((prev) => [...prev, comentarioCriado]);
      setNovoComentario("");
    } catch (err) {
      console.error("❌ Erro ao publicar comentário:", err);
      alert("Erro ao publicar comentário, tente novamente.");
    } finally {
      setComentLoading(false);
    }
  };

  // Deletar comentário
  const handleDeletarComentario = async () => {
    try {
      await ComentariosService.excluirComentario(modalDeletar.comentarioId);
      setComentarios((prev) =>
        prev.filter((c) => c.id !== modalDeletar.comentarioId)
      );
    } catch (err) {
      console.error("Erro ao deletar comentário:", err);
      alert("Não foi possível excluir o comentário.");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 mt-[80px]">
          {/* Botão Voltar */}
          <button
            onClick={() => navigate("/achadinhos")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200 group"
          >
            <svg
              className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M15 19l-7-7 7-7"
              ></path>
            </svg>
            <span className="font-medium">Voltar para produtos</span>
          </button>

          {/* Loading Elaborado */}
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 mb-6" style={{ borderColor: corPrincipal }}></div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Carregando produto...</h2>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                Aguarde enquanto buscamos todos os detalhes deste produto
              </p>
              <div className="mt-6 flex items-center justify-center gap-2">
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-gray-300 rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!produto) {
    return (
      <div className="max-w-6xl mx-auto p-6 mt-[80px]">
        <button onClick={() => navigate(-1)} className="text-blue-600">
          Voltar
        </button>
        <p className="text-gray-600">Produto não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 mt-[80px]">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate("/achadinhos")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 transition-colors duration-200 group"
        >
          <svg
            className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform duration-200"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 19l-7-7 7-7"
            ></path>
          </svg>
          <span className="font-medium">Voltar para produtos</span>
        </button>

        {/* Card Principal do Produto */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Imagem de Capa */}
          <div className="relative h-[300px] lg:h-[500px] overflow-hidden">
            <img
              src={produto.imagem}
              alt={produto.titulo}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

            {/* Badge da Região */}
            <div
              className="absolute top-6 right-6 px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg backdrop-blur-sm"
              style={{ backgroundColor: corPrincipal }}
            >
              {produto.regiao || produto.zona || regiao || 'Anúncio'}
            </div>

            {/* Vendedor - CANTO SUPERIOR ESQUERDO */}
            <div className="absolute top-6 left-6 flex items-center gap-4">
              <img
                src={produto.fotoPerfil}
                alt={produto.autor}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div>
                <p className="text-sm font-medium text-black" style={{ color: corPrincipal }}>Vendido por</p>
                <p className="text-lg font-bold text-black" style={{ color: corPrincipal }}>
                  {nomeAutor || "Carregando..."}
                </p>
              </div>
            </div>

            {/* Botão Excluir - CANTO INFERIOR DIREITO */}
            {podeExcluirProduto && (
              <div className="absolute bottom-6 right-6">
                <button
                  onClick={() => setModalDeletarProduto(true)}
                  className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
                  title="Excluir produto"
                >
                  <FaTrash size={16} />
                </button>
              </div>
            )}
          </div>

          {/* Conteúdo */}
          <div className="p-6 lg:p-10">
            {/* Título */}
            <h1 className="text-3xl lg:text-5xl font-bold text-gray-900 leading-tight mb-4">
              {produto.titulo}
            </h1>

            {/* Texto/Resumo do Produto - ACIMA DOS METADADOS */}
            <p className="text-xl text-gray-600 mb-6 font-medium leading-relaxed">
              {produto.resumo || produto.descricao || produto.descricaoCompleta || produto.texto || "Sem descrição disponível."}
            </p>

            {/* Metadados - COM PREÇO, LOCAL E HORÁRIO */}
            <div className="flex flex-wrap items-center gap-4 pb-6 mb-6 border-b border-gray-200">
              {/* Preço */}
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
                <span className="text-2xl font-bold" style={{ color: corPrincipal }}>
                  {produto.preco || produto.valor ? `R$ ${produto.preco || produto.valor}` : "Preço a combinar"}
                </span>
              </div>

              {/* Local */}
              {produto.local && (
                <div className="flex items-center gap-2 text-gray-600">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"></path>
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"></path>
                  </svg>
                  <span className="text-sm font-medium">{produto.local}</span>
                </div>
              )}

              {/* Data e Hora */}
              <div className="flex items-center gap-2 text-gray-600">
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                </svg>
                <span className="text-sm font-medium">
                  {produto.dataHoraCriacao
                    ? `Publicado em ${new Date(produto.dataHoraCriacao).toLocaleDateString("pt-BR")} às ${new Date(produto.dataHoraCriacao).toLocaleTimeString("pt-BR", { hour: '2-digit', minute: '2-digit' })}`
                    : "Hoje"
                  }
                </span>
              </div>
            </div>

            {/* Descrição Completa (se houver) */}
            {produto.descricaoCompleta && produto.descricaoCompleta !== produto.resumo && (
              <div className="prose prose-lg max-w-none mb-8">
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                  {produto.descricaoCompleta}
                </p>
              </div>
            )}

            {/* Botão de Contato WhatsApp */}
            {produto.telefone && (
              <a
                href={`https://wa.me/55${produto.telefone.replace(/\D/g, '')}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                </svg>
                Contatar vendedor
              </a>
            )}
          </div>
        </div>

        {/* Comentários */}
        <div className="mt-12 bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 lg:p-8 shadow-lg border border-gray-200">
          <div className="flex items-center gap-3 mb-6">
            <div
              className="w-1 h-8 rounded-full"
              style={{ backgroundColor: corPrincipal }}
            ></div>
            <h2 className="text-2xl font-bold text-gray-800">
              Comentários ({comentarios.length})
            </h2>
          </div>

          {/* Formulário de Comentário */}
          {!user?.id && (
            <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4">
              <div className="flex">
                <div className="flex-shrink-0">
                  <svg className="h-5 w-5 text-yellow-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="text-sm text-yellow-700">
                    Você precisa estar logado para comentar. <a href="/login" className="font-medium text-yellow-700 underline hover:text-yellow-600">Faça login</a> ou <a href="/cadastro" className="font-medium text-yellow-700 underline hover:text-yellow-600">cadastre-se</a> para participar da conversa.
                  </p>
                </div>
              </div>
            </div>
          )}
          
          <div className="mb-8 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4">
              <img
                src={user?.fotoPerfil  }
                alt="Seu avatar"
                className="w-10 h-10 rounded-full border-2 hidden sm:block"
                style={{ borderColor: corPrincipal }}
              />
              <div className="flex-1 w-full flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <input
                  type="text"
                  placeholder="Escreva um comentário..."
                  value={novoComentario}
                  onChange={(e) => setNovoComentario(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    !comentLoading &&
                    !e.shiftKey &&
                    handlePublicarComentario()
                  }
                  className="flex-1 px-4 py-3 bg-gray-50 rounded-lg outline-none text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:ring-2 transition-all duration-200"
                  style={{
                    focusRingColor: corPrincipal,
                  }}
                />
                <button
                  onClick={handlePublicarComentario}
                  disabled={comentLoading || !novoComentario.trim()}
                  className="w-full sm:w-auto px-6 py-3 text-white text-sm font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md"
                  style={{
                    backgroundColor: corPrincipal,
                  }}
                >
                  {comentLoading ? (
                    <span className="flex items-center justify-center gap-2">
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                          fill="none"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Enviando...
                    </span>
                  ) : (
                    "Publicar"
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Lista de Comentários */}
          {comentarios.length === 0 ? (
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
                  ></path>
                </svg>
              </div>
              <p className="text-gray-500 text-lg font-medium">
                Nenhum comentário ainda
              </p>
              <p className="text-gray-400 text-sm mt-1">
                Seja o primeiro a comentar!
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {comentarios.map((coment) => (
                <div
                  key={coment.id}
                  className="bg-white rounded-xl p-5 shadow-md border border-gray-200 hover:shadow-lg transition-all duration-300 relative group"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={coment.avatar  }
                      alt={coment.nomeUsuario || "Usuário"}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-2">
                        <div>
                          <p className="text-base font-bold text-gray-800">
                            {coment.nomeUsuario || "Usuário"}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            {coment.dataHoraCriacao
                              ? new Date(coment.dataHoraCriacao).toLocaleString(
                                  "pt-BR",
                                  {
                                    day: "2-digit",
                                    month: "short",
                                    year: "numeric",
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  }
                                )
                              : "agora"}
                          </p>
                        </div>
                        {((coment.idUsuario === usuarioLogado.id ||
                          coment.emailUsuario === usuarioLogado.email) ||
                          isAdmin) && (
                          <button
                            onClick={() =>
                              setModalDeletar({
                                isOpen: true,
                                comentarioId: coment.id,
                              })
                            }
                            className="p-2 rounded-lg hover:bg-red-50 text-red-500 hover:text-red-700 transition-all duration-200"
                            title="Excluir comentário"
                          >
                            <svg
                              className="w-5 h-5"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              ></path>
                            </svg>
                          </button>
                        )}
                      </div>
                      <div className="bg-gray-50 rounded-lg p-4 text-gray-700 text-sm leading-relaxed break-words">
                        {coment.texto}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Modal de Confirmação para Excluir Produto */}
        <ModalConfirmacao
          isOpen={modalDeletarProduto}
          onClose={() => setModalDeletarProduto(false)}
          onConfirm={handleDeletarProduto}
          titulo="Excluir Produto"
          mensagem="Tem certeza que deseja excluir este produto? Esta ação não pode ser desfeita."
          textoBotaoConfirmar="Excluir"
          textoBotaoCancelar="Cancelar"
          corBotaoConfirmar="#ef4444"
        />

        {/* Modal de Confirmação de Exclusão de Comentário */}
        <ModalConfirmacao
          isOpen={modalDeletar.isOpen}
          onClose={() => setModalDeletar({ isOpen: false, comentarioId: null })}
          onConfirm={handleDeletarComentario}
          titulo="Excluir Comentário"
          mensagem="Tem certeza que deseja excluir este comentário? Esta ação não pode ser desfeita."
          textoBotaoConfirmar="Excluir"
          textoBotaoCancelar="Cancelar"
          corBotaoConfirmar="#ef4444"
        />
      </div>
    </div>
  );
}
