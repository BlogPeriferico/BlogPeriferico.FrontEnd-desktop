 import React, { useEffect, useState, useCallback } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import CorreCertoService from "../../services/CorreCertoService";
import ComentariosService from "../../services/ComentariosService";
import AuthService from "../../services/AuthService";
import api from "../../services/Api";
import { useRegiao } from "../../contexts/RegionContext";
import { useUser } from "../../contexts/UserContext.jsx";
import { regionColors } from "../../utils/regionColors";
import { FaTrash } from "react-icons/fa";
import ModalConfirmacao from "../../components/modals/ModalConfirmacao";

export default function VagaInfo() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { regiao } = useRegiao();
  const { user } = useUser();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";

  const [vaga, setVaga] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [comentLoading, setComentLoading] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState({ id: null, email: null, nome: "Visitante", papel: null });
  const [modalDeletar, setModalDeletar] = useState({
    isOpen: false,
    comentarioId: null,
  });
  const [modalDeletarVaga, setModalDeletarVaga] = useState(false);
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

  // Função para carregar os dados do autor da vaga
  const carregarAutor = useCallback(async (vagaData) => {
    if (!vagaData) return null;
    
    console.log('🔍 Buscando autor para a vaga:', {
      id: vagaData.id,
      idUsuario: vagaData.idUsuario,
      emailUsuario: vagaData.emailUsuario,
      autorAtual: vagaData.autor
    });

    // Tenta buscar por idUsuario primeiro (caso mais comum)
    if (vagaData.idUsuario) {
      try {
        console.log(`🔍 Buscando usuário por ID: ${vagaData.idUsuario}`);
        const response = await api.get(`/usuarios/${vagaData.idUsuario}`);
        if (response.data) {
          console.log('✅ Usuário encontrado por ID:', response.data.nome);
          return {
            id: response.data.id,
            nome: response.data.nome,
            fotoPerfil: response.data.fotoPerfil || 'https://i.pravatar.cc/80'
          };
        }
      } catch (err) {
        console.warn('❌ Erro ao buscar usuário por ID, tentando listar todos...', err);
        
        // Se falhar, tenta listar todos e filtrar localmente
        try {
          console.log('🔍 Listando todos os usuários para encontrar por ID...');
          const response = await api.get('/usuarios/listar');
          const usuario = response.data.find(u => u.id === vagaData.idUsuario);
          if (usuario) {
            console.log('✅ Usuário encontrado na lista:', usuario.nome);
            return {
              id: usuario.id,
              nome: usuario.nome,
              fotoPerfil: usuario.fotoPerfil || 'https://i.pravatar.cc/80'
            };
          }
        } catch (listErr) {
          console.error('❌ Erro ao listar usuários:', listErr);
        }
      }
    }

    // Se não encontrou por ID, tenta por email
    if (vagaData.emailUsuario) {
      try {
        console.log(`📧 Buscando usuário por email: ${vagaData.emailUsuario}`);
        const response = await api.get('/usuarios/listar');
        const usuario = response.data.find(u => u.email === vagaData.emailUsuario);
        if (usuario) {
          console.log('✅ Usuário encontrado por email:', usuario.nome);
          return {
            id: usuario.id,
            nome: usuario.nome,
            fotoPerfil: usuario.fotoPerfil || 'https://i.pravatar.cc/80'
          };
        }
      } catch (err) {
        console.error('❌ Erro ao buscar usuário por email:', err);
      }
    }

    // Se não encontrou de nenhuma forma, tenta usar o autor direto da vaga
    if (vagaData.autor) {
      console.log('ℹ️ Usando nome do autor diretamente da vaga');
      return {
        id: vagaData.idUsuario || null,
        nome: vagaData.autor,
        fotoPerfil: vagaData.fotoPerfil || 'https://i.pravatar.cc/80'
      };
    }

    console.warn('⚠️ Não foi possível encontrar informações do autor');
    return null;
  }, []);

  // Carregar vaga e comentários
  useEffect(() => {
    let isMounted = true;
    
    const carregarDados = async () => {
      try {
        setLoading(true);
        
        // Carrega a vaga
        const vagaData = await CorreCertoService.buscarCorrecertoPorId(id);
        
        if (!isMounted) return;
        
        // Busca os dados do autor
        const autorInfo = await carregarAutor(vagaData);
        
        if (autorInfo) {
          // Atualiza os dados da vaga com as informações do autor
          vagaData.autor = autorInfo.nome;
          vagaData.fotoPerfil = autorInfo.fotoPerfil;
          vagaData.idUsuario = autorInfo.id;
        } else {
          // Se não encontrou o autor, limpa as informações
          vagaData.autor = null;
          vagaData.fotoPerfil = null;
        }
        
        setVaga(vagaData);
        
        // Carrega os comentários
        try {
          const comentariosData = await ComentariosService.listarComentariosVaga(id);
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
        console.error('Erro ao carregar vaga:', err);
        if (isMounted) {
          setVaga(null);
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

  // Atualiza o nome do autor quando a vaga for carregada
  useEffect(() => {
    if (vaga?.autor) {
      setNomeAutor(vaga.autor);
    } else {
      setNomeAutor(null);
    }
  }, [vaga]);

  // Atualiza fotoPerfil da vaga quando foto do usuário muda
  useEffect(() => {
    if (vaga && user?.id && vaga.idUsuario === user.id) {
      const novaFoto = user.fotoPerfil || "https://i.pravatar.cc/80";

      // Só atualiza se a foto realmente mudou
      if (novaFoto !== vaga.fotoPerfil) {
        console.log("🔄 VagasInfo - Atualizando fotoPerfil da vaga:", vaga.id);
        console.log("📷 Foto antes:", vaga.fotoPerfil);
        console.log("📷 Foto depois:", novaFoto);

        setVaga(prevVaga => ({
          ...prevVaga,
          fotoPerfil: novaFoto
        }));

        console.log("✅ VagasInfo - fotoPerfil atualizada");
      } else {
        console.log("🔄 VagasInfo - Foto já está atualizada:", novaFoto);
      }
    }
  }, [user?.fotoPerfil, vaga?.id, vaga?.idUsuario, user?.id]);

  // Sincroniza fotoPerfil inicial quando vaga e usuário estão disponíveis
  useEffect(() => {
    if (vaga && user?.id && vaga.idUsuario === user.id && user.fotoPerfil && !vaga.fotoPerfil) {
      console.log("🔄 VagasInfo - Sincronizando fotoPerfil inicial:", vaga.id);
      console.log("📷 Foto do usuário:", user.fotoPerfil);

      setVaga(prevVaga => ({
        ...prevVaga,
        fotoPerfil: user.fotoPerfil
      }));

      console.log("✅ VagasInfo - fotoPerfil inicial sincronizada");
    }
  }, [vaga, user]);

  // Atualiza avatar dos comentários existentes quando foto do usuário muda
  useEffect(() => {
    console.log("🔄 VagasInfo - User mudou:", {
      id: user?.id,
      fotoPerfil: user?.fotoPerfil,
      comentariosCount: comentarios.length
    });

    if (user?.id && comentarios.length > 0) {
      console.log("🔄 VagasInfo - Atualizando comentários existentes...");

      setComentarios(prevComentarios => {
        const updated = prevComentarios.map(coment => {
          const isUserComment = coment.idUsuario === user.id || coment.emailUsuario === user.email;

          if (isUserComment) {
            console.log(`✅ VagasInfo - Atualizando comentário ${coment.id}:`, {
              de: coment.avatar,
              para: user.fotoPerfil || "https://i.pravatar.cc/40"
            });
            return { ...coment, avatar: user.fotoPerfil || "https://i.pravatar.cc/40" };
          }
          return coment;
        });

        console.log("✅ VagasInfo - Comentários atualizados:", updated.length);
        return updated;
      });
    }
  }, [user?.fotoPerfil, user?.id, comentarios.length]);

  // Verificação de permissões (alinhado a Notícias/Achadinhos)
  const userRole = usuarioLogado?.role || usuarioLogado?.roles || usuarioLogado?.papel || "";
  const roleNormalized = String(userRole).toUpperCase();
  const isAdmin = roleNormalized.includes("ADMINISTRADOR") || roleNormalized.includes("ADMIN");
  const isAutor = Boolean(
    vaga && usuarioLogado && (
      vaga.idUsuario === usuarioLogado.id ||
      vaga.emailUsuario === usuarioLogado.email ||
      vaga.autor === usuarioLogado.nome
    )
  );
  const podeExcluirVaga = Boolean(vaga && usuarioLogado && (isAdmin || isAutor));

  // Debug: log de permissões
  useEffect(() => {
    if (vaga && usuarioLogado.id) {
      console.log("🔍 Verificação de permissões:");
      console.log("  - Papel do usuário:", userRole);
      console.log("  - Papel normalizado:", roleNormalized);
      console.log("  - É ADMIN?", isAdmin);
      console.log("  - ID do autor da vaga:", vaga.idUsuario);
      console.log("  - Nome do autor:", nomeAutor);
      console.log("  - ID do usuário logado:", usuarioLogado.id);
      console.log("  - Nome do usuário:", usuarioLogado.nome);
      console.log("  - É autor?", isAutor);
      console.log("  - Pode excluir?", podeExcluirVaga);
    }
  }, [vaga, usuarioLogado, podeExcluirVaga]);

  const handleDeletarVaga = async () => {
    try {
      console.log("🗑️ Tentando excluir vaga ID:", id);
      console.log("🔑 Token no localStorage:", localStorage.getItem("token"));
      console.log("👤 Usuário logado:", usuarioLogado);
      console.log("📋 Dados da vaga completa:", vaga);

      await CorreCertoService.excluirVaga(id);
      setModalDeletarVaga(false);
      alert("Vaga excluída com sucesso.");
      navigate("/vagas");
    } catch (err) {
      console.error("❌ Erro ao excluir vaga:", err);
      console.error("❌ Resposta do servidor:", err.response?.data);
      const status = err?.response?.status;
      if (status === 403 || status === 401) {
        alert(
          "❌ ERRO DE AUTORIZAÇÃO\n\n" +
            "Você não tem permissão para excluir esta vaga.\n\n" +
            "Detalhes técnicos:\n" +
            "- ID do usuário logado: " + usuarioLogado?.id + "\n" +
            "- ID do autor da vaga: " + vaga?.idUsuario + "\n" +
            "- Nome do usuário: " + usuarioLogado?.nome + "\n" +
            "- Nome do autor: " + nomeAutor + "\n" +
            "- Papel do usuário: " + usuarioLogado?.papel + "\n\n" +
            "Apenas o autor da vaga ou um administrador podem excluí-la."
        );
      } else {
        alert("Não foi possível excluir a vaga. Tente novamente.");
      }
    }
  };

  // Publicar comentário
  const handlePublicarComentario = async () => {
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
        idVaga: Number(id),
        idUsuario: usuarioLogado.id,
        tipo: "VAGA", // ✅ Especifica o tipo de comentário
      };

      console.log("📤 VagasInfo - DTO antes de enviar:", dto);
      console.log("📤 VagasInfo - ID do parâmetro:", id);
      console.log("📤 VagasInfo - ID convertido:", Number(id));
      console.log("📤 VagasInfo - Usuario logado:", usuarioLogado);
      console.log("📤 VagasInfo - Novo comentário:", novoComentario);

      const comentarioCriado = await ComentariosService.criarComentarioVaga(dto);

      if (!comentarioCriado.nomeUsuario) {
        comentarioCriado.nomeUsuario = user.nome || "Você";
        comentarioCriado.dataHoraCriacao = new Date().toISOString();
        comentarioCriado.avatar = user.fotoPerfil || "https://i.pravatar.cc/40";
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
      setModalDeletar({ isOpen: false, comentarioId: null });
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
            onClick={() => navigate("/vagas")}
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
            <span className="font-medium">Voltar para vagas</span>
          </button>

          {/* Loading Elaborado */}
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 mb-6" style={{ borderColor: corPrincipal }}></div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Carregando vaga...</h2>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                Aguarde enquanto buscamos todos os detalhes desta vaga
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

  if (!vaga) {
    return (
      <div className="max-w-6xl mx-auto p-6 mt-[80px]">
        <button onClick={() => navigate(-1)} className="text-blue-600">
          Voltar
        </button>
        <p className="text-gray-600">Vaga não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 mt-[80px]">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate("/vagas")}
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
          <span className="font-medium">Voltar para vagas</span>
        </button>

        {/* Card Principal da Vaga */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Imagem de Capa */}
          <div className="relative h-[300px] lg:h-[500px] overflow-hidden">
            <img
              src={vaga.imagem}
              alt={vaga.titulo}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

            {/* Badge da Zona */}
            {vaga.zona && (
              <div
                className="absolute top-6 right-6 px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg backdrop-blur-sm"
                style={{ backgroundColor: corPrincipal }}
              >
                {vaga.zona}
              </div>
            )}

            {/* Autor */}
            <div className="absolute top-6 left-6 flex items-center gap-4">
              <img
                src={vaga.fotoPerfil || "https://i.pravatar.cc/80"}
                alt={vaga.usuario || vaga.autor}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div>
                <p className="text-sm font-medium text-white" style={{ color: corPrincipal }}>Publicado por</p>
                <p className="text-lg font-bold text-black" style={{ color: corPrincipal }}>
                  {nomeAutor || "Carregando..."}
                </p>
              </div>
            </div>

            {/* Botão Excluir */}
            {podeExcluirVaga && (
              <div className="absolute bottom-6 right-6">
                <button
                  onClick={() => setModalDeletarVaga(true)}
                  className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
                  title="Excluir vaga"
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
              {vaga.titulo}
            </h1>

            {/* Descrição */}
            {(vaga.descricaoCompleta || vaga.descricao || vaga.resumo) && (
              <p className="text-xl text-gray-600 mb-6 font-medium leading-relaxed">
                {vaga.descricaoCompleta || vaga.descricao || vaga.resumo}
              </p>
            )}

            {/* Metadados */}
            <div className="flex flex-wrap items-center gap-4 pb-6 mb-6 border-b border-gray-200">
              {vaga.local && (
                <div className="flex items-center gap-2 text-gray-600">
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
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    ></path>
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    ></path>
                  </svg>
                  <span className="text-sm font-medium">{vaga.local}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-gray-600">
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
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  ></path>
                </svg>
                <span className="text-sm font-medium">
                  {vaga.dataHoraCriacao
                    ? `Publicado em ${new Date(
                        vaga.dataHoraCriacao
                      ).toLocaleDateString("pt-BR")} às ${new Date(
                        vaga.dataHoraCriacao
                      ).toLocaleTimeString("pt-BR")}`
                    : vaga.tempo || "Hoje"}
                </span>
              </div>
            </div>

            {/* Conteúdo Completo */}
            {vaga.conteudo && (
              <div className="prose prose-lg max-w-none">
                <p className="text-lg text-gray-700 leading-relaxed whitespace-pre-line">
                  {vaga.conteudo}
                </p>
              </div>
            )}

            {/* Botão WhatsApp */}
            {vaga.telefone && (
              <div className="mt-8">
                <a
                  href={`https://wa.me/55${vaga.telefone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-semibold text-lg shadow-lg transition-all duration-200 transform hover:scale-105"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="w-6 h-6"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M20.52 3.48A11.94 11.94 0 0012.07 0C5.4 0 .07 5.37.07 12a11.87 11.87 0 001.6 6l-1.7 6.2 6.34-1.66a11.87 11.87 0 005.76 1.48H12c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22.07a9.89 9.89 0 01-5.06-1.37l-.36-.22-3.76.98.98-3.66-.23-.38a9.88 9.88 0 01-1.45-5.14c0-5.48 4.47-9.95 9.95-9.95 2.66 0 5.16 1.04 7.04 2.92A9.92 9.92 0 0122.07 12c0 5.49-4.47 9.95-9.95 9.95zm5.04-7.36c-.28-.14-1.64-.81-1.9-.9-.26-.1-.45-.14-.64.14-.19.28-.74.9-.9 1.08-.17.18-.33.21-.61.07-.28-.14-1.2-.44-2.29-1.4-.85-.76-1.42-1.7-1.58-1.98-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.18.19-.28.29-.47.1-.19.05-.36-.02-.5-.07-.14-.64-1.53-.88-2.1-.23-.56-.46-.48-.63-.49H7.4c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.28 0 1.34.98 2.64 1.11 2.82.14.18 1.93 2.95 4.69 4.14.65.28 1.15.45 1.54.58.65.21 1.24.18 1.71.11.52-.08 1.64-.67 1.87-1.31.23-.65.23-1.2.16-1.31-.07-.1-.26-.18-.55-.32z" />
                  </svg>
                  Contate o Empregador
                </a>
              </div>
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
          <div className="mb-8 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4">
              <img
                src={user?.fotoPerfil || "https://i.pravatar.cc/40"}
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
                  className="flex-1 px-4 py-3 bg-gray-50 rounded-lg outline-none text-sm text-gray-700 placeholder-gray-400 focus:bg-white focus:ring-2 transition-all duration-200"
                />
                <button
                  onClick={handlePublicarComentario}
                  disabled={comentLoading || !novoComentario.trim()}
                  className="w-full sm:w-auto px-6 py-3 text-white text-sm font-semibold rounded-lg transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-md"
                  style={{
                    backgroundColor: corPrincipal,
                  }}
                >
                  Publicar
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
                      src={coment.avatar || "https://i.pravatar.cc/40"}
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

        {/* Modal de Confirmação para Excluir Comentário */}
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

        {/* Modal de Confirmação para Excluir Vaga */}
        <ModalConfirmacao
          isOpen={modalDeletarVaga}
          onClose={() => setModalDeletarVaga(false)}
          onConfirm={handleDeletarVaga}
          titulo="Excluir Vaga"
          mensagem="Tem certeza que deseja excluir esta vaga? Esta ação não pode ser desfeita."
          textoBotaoConfirmar="Excluir"
          textoBotaoCancelar="Cancelar"
          corBotaoConfirmar="#ef4444"
        />
      </div>
    </div>
  );
}
