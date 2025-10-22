import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import DoacaoService from "../../services/DoacaoService";
import ComentariosService from "../../services/ComentariosService";
import AuthService from "../../services/AuthService";
import api from "../../services/Api";
import { useRegiao } from "../../contexts/RegionContext";
import { useUser } from "../../contexts/UserContext.jsx";
import { regionColors } from "../../utils/regionColors";
import { FaTrash } from "react-icons/fa";
import ModalConfirmacao from "../../components/modals/ModalConfirmacao";
import NoPicture from "../../assets/images/NoPicture.webp";

export default function DoacaoInfo() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { regiao } = useRegiao();
  const { user } = useUser();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";

  const [doacao, setDoacao] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [comentLoading, setComentLoading] = useState(false);
  const [usuarioLogado, setUsuarioLogado] = useState({
    id: null,
    email: null,
    nome: "Visitante",
    papel: null,
  });
  const [modalDeletar, setModalDeletar] = useState({
    isOpen: false,
    comentarioId: null,
  });
  const [modalDeletarDoacao, setModalDeletarDoacao] = useState(false);
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
      
      console.log('🔄 Dados do usuário do contexto:', user);
      console.log('🔄 Dados normalizados do usuário:', userData);
      
      setUsuarioLogado(userData);
    }
  }, [user]);

  // Carregar doação e comentários
  useEffect(() => {
    console.log('🚀 [1] - Iniciando carregamento da doação e comentários');
    console.log('   - ID da doação:', id);
    console.log('   - Doação atual no estado:', doacao);
    window.scrollTo(0, 0);

    if (!doacao) {
      console.log('🔄 [2] - Doação não carregada ainda, iniciando carregamento...');
      setLoading(true);
      
      const carregarDoacao = async () => {
        console.log('📡 [3] - Iniciando busca da doação no servidor...');
        try {
          console.log('🔎 [4] - Chamando DoacaoService.buscarDoacaoPorId com ID:', id);
          const data = await DoacaoService.buscarDoacaoPorId(id);
          console.log('✅ [5] - Dados da doação recebidos:');
          console.log('   - Tipo:', typeof data);
          console.log('   - Conteúdo:', data);
          console.log('   - idUsuario:', data?.idUsuario);
          console.log('   - autor:', data?.autor);
          console.log('   - JSON:', JSON.stringify(data, null, 2));

          // Buscar dados do usuário junto com a doação
          if (data.idUsuario) {
            console.log('👤 [6] - ID do usuário encontrado na doação:', data.idUsuario);
            try {
              console.log('🔍 [7] - Buscando dados do doador na API...');
              const response = await api.get("/usuarios/listar");
              console.log('👥 [8] - Lista de usuários recebida:');
              console.log('   - Total de usuários:', response.data.length);
              console.log('   - IDs dos usuários:', response.data.map(u => u.id).join(', '));
              console.log('   - Buscando usuário com ID:', data.idUsuario);
              
              const doador = response.data.find((u) => u.id === data.idUsuario);
              console.log('🔎 [9] - Resultado da busca:');
              console.log('   - ID procurado:', data.idUsuario);
              console.log('   - Doador encontrado:', doador ? 'Sim' : 'Não');
              console.log('   - Dados do doador:', doador);

              if (doador) {
                console.log('✅ [10] - Dados do doador encontrados:', {
                  id: doador.id,
                  nome: doador.nome,
                  temFoto: !!doador.fotoPerfil,
                  zona: doador.zona || 'Não informada'
                });

                // Inclui fotoPerfil e nome do autor diretamente na doação
                data.fotoPerfil = doador.fotoPerfil || NoPicture;
                data.autor = doador.nome;
                
                console.log('🔄 [11] - Atualizando dados da doação com informações do doador');
                console.log('   - fotoPerfil:', data.fotoPerfil ? 'Definida' : 'Não definida');
                console.log('   - autor:', data.autor);

                // Se a zona não estiver definida na doação, usa a do usuário
                if (!data.zona && doador.zona) {
                  console.log('📍 [12] - Usando zona do perfil do usuário:', doador.zona);
                  data.zona = doador.zona;
                }
              } else {
                console.warn('⚠️ [13] - Doador não encontrado na lista de usuários');
              }
            } catch (err) {
              console.error('❌ [14] - Erro ao buscar dados do doador:', err);
              console.error('Detalhes do erro:', {
                status: err.response?.status,
                data: err.response?.data,
                message: err.message
              });
            }
          } else {
            console.warn('⚠️ [15] - Doação não possui idUsuario definido');
          }

          console.log('💾 [16] - Salvando doação no estado');
          setDoacao(data);
          console.log('✅ [17] - Estado da doação atualizado com sucesso');
          
        } catch (err) {
          console.error('❌ [18] - Erro ao carregar doação:', err);
          console.error('Detalhes do erro:', {
            status: err.response?.status,
            data: err.response?.data,
            message: err.message
          });
          setDoacao(null);
        } finally {
          console.log('🏁 [19] - Finalizando carregamento (loading = false)');
          setLoading(false);
        }
      };
      
      carregarDoacao();
    } else {
      console.log('ℹ️ [20] - Doação já carregada, pulando busca');
    }

    const carregarComentarios = async () => {
      console.log('💬 [21] - Iniciando carregamento de comentários');
      try {
        const dados = await ComentariosService.listarComentariosDoacao(id);
        console.log('💬 [22] - Comentários carregados:', dados.length, 'comentários');
        setComentarios(dados);
      } catch (err) {
        console.error('❌ [23] - Erro ao buscar comentários:', err);
        setComentarios([]);
      }
    };

    carregarComentarios();
  }, [id, doacao]);

  // Monitora alterações no estado da doação
  useEffect(() => {
    console.log('🔍 [25] - Estado da doação alterado:', {
      id: doacao?.id,
      idUsuario: doacao?.idUsuario,
      autor: doacao?.autor,
      temFoto: !!doacao?.fotoPerfil,
      zona: doacao?.zona
    });
  }, [doacao]);

  console.log('🔄 [24] - Renderização do componente DoacaoInfo');
  console.log('   - doacao:', doacao ? 'Carregada' : 'Não carregada');
  if (doacao) {
    console.log('   - idUsuario:', doacao.idUsuario);
    console.log('   - autor:', doacao.autor);
    console.log('   - zona:', doacao.zona);
  }
  console.log('   - loading:', loading);
  console.log('   - comentarios:', comentarios.length, 'comentários');

  // Força o recarregamento da doação quando o componente é montado
  useEffect(() => {
    console.log('🔄 [26] - Componente montado, forçando recarregamento da doação');
    setDoacao(null); // Isso forçará um novo carregamento
  }, [id]);

  // Atualiza fotoPerfil da doação quando foto do usuário muda
  useEffect(() => {
    if (doacao && user?.id && doacao.idUsuario === user.id) {
      const novaFoto = user.fotoPerfil || NoPicture;

      // Só atualiza se a foto realmente mudou
      if (novaFoto !== doacao.fotoPerfil) {
        console.log("🔄 DoacaoInfo - Atualizando fotoPerfil da doação:", doacao.id);
        console.log("📷 Foto antes:", doacao.fotoPerfil);
        console.log("📷 Foto depois:", novaFoto);

        setDoacao(prevDoacao => ({
          ...prevDoacao,
          fotoPerfil: novaFoto
        }));

        console.log("✅ DoacaoInfo - fotoPerfil atualizada");
      } else {
        console.log("🔄 DoacaoInfo - Foto já está atualizada:", novaFoto);
      }
    }
  }, [user?.fotoPerfil, doacao?.id, doacao?.idUsuario, user?.id]);

  // Sincroniza fotoPerfil inicial quando doação e usuário estão disponíveis
  useEffect(() => {
    if (doacao && user?.id && doacao.idUsuario === user.id && user.fotoPerfil && !doacao.fotoPerfil) {
      console.log("🔄 DoacaoInfo - Sincronizando fotoPerfil inicial:", doacao.id);
      console.log("📷 Foto do usuário:", user.fotoPerfil);

      setDoacao(prevDoacao => ({
        ...prevDoacao,
        fotoPerfil: user.fotoPerfil
      }));

      console.log("✅ DoacaoInfo - fotoPerfil inicial sincronizada");
    }
  }, [doacao, user]);

  // Atualiza avatar dos comentários existentes quando foto do usuário muda
  useEffect(() => {
    console.log("🔄 DoacaoInfo - User mudou:", {
      id: user?.id,
      fotoPerfil: user?.fotoPerfil,
      comentariosCount: comentarios.length
    });

    if (user?.id && comentarios.length > 0) {
      console.log("🔄 DoacaoInfo - Atualizando comentários existentes...");

      setComentarios(prevComentarios => {
        const updated = prevComentarios.map(coment => {
          const isUserComment = coment.idUsuario === user.id || coment.emailUsuario === user.email;

          if (isUserComment) {
            console.log(`✅ DoacaoInfo - Atualizando comentário ${coment.id}:`, {
              de: coment.avatar,
              para: user.fotoPerfil || NoPicture
            });
            return { ...coment, avatar: user.fotoPerfil || NoPicture };
          }
          return coment;
        });

        console.log("✅ DoacaoInfo - Comentários atualizados:", updated.length);
        return updated;
      });
    }
  }, [user?.fotoPerfil, user?.id, comentarios.length]);

  // Buscar nome do autor da doação
  useEffect(() => {
    const buscarAutor = async () => {
      if (doacao && doacao.idUsuario) {
        try {
          const response = await api.get("/usuarios/listar");
          const usuarios = response.data;
          const autor = usuarios.find((u) => u.id === doacao.idUsuario);
          if (autor) {
            setNomeAutor(autor.nome);
            console.log("✅ Autor da doação:", autor.nome);
          }
        } catch (err) {
          console.error(
            "❌ Erro ao buscar autor (403 - backend bloqueando):",
            err
          );
          // Fallback: usa o campo autor se existir
          setNomeAutor(doacao.autor || "Autor");
        }
      } else if (doacao && doacao.autor) {
        // Se não tem idUsuario, usa o campo autor direto
        setNomeAutor(doacao.autor);
      }
    };
    buscarAutor();
  }, [doacao]);

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
        idDoacao: Number(id),
        idUsuario: usuarioLogado.id,
        tipo: "DOACAO",  
      };

      console.log("📤 Enviando comentário:", dto);

      const comentarioCriado = await ComentariosService.criarComentarioDoacao(dto);

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

  // Verificação de propriedade da doação
  // Verifica role, roles ou papel, em qualquer caso
  const userRole = usuarioLogado?.role || usuarioLogado?.roles || usuarioLogado?.papel || "";
  const roleNormalizado = String(userRole).toUpperCase();
  
  // Verificação de permissões
  const isAdmin = roleNormalizado.includes("ADMIN") || roleNormalizado.includes("ADMINISTRADOR");
  const isDoador = doacao && (
    doacao.idUsuario === usuarioLogado?.id ||
    doacao.emailUsuario === usuarioLogado?.email ||
    doacao.autor === usuarioLogado?.nome
  );
  
  const podeExcluirDoacao = Boolean(doacao && usuarioLogado && (isAdmin || isDoador));

  // Debug: log detalhado
  useEffect(() => {
    if (doacao && usuarioLogado?.id) {
      console.log("🔍 DETALHES DE PERMISSÕES:", {
        usuario: usuarioLogado.nome,
        role: userRole,
        roleNormalizado,
        isAdmin,
        isDoador,
        podeExcluirDoacao,
        doacaoId: doacao.id,
        doacaoDoador: doacao.autor || doacao.nomeAutor,
        usuarioLogado: { 
          id: usuarioLogado.id, 
          nome: usuarioLogado.nome,
          email: usuarioLogado.email,
          role: usuarioLogado.role,
          roles: usuarioLogado.roles,
          papel: usuarioLogado.papel
        }
      });
    }
  }, [doacao, usuarioLogado, isAdmin, isDoador, podeExcluirDoacao, userRole, roleNormalizado]);

  // Deletar doação
  const handleDeletarDoacao = async () => {
    try {
      await DoacaoService.excluirDoacao(id);
      setModalDeletarDoacao(false);
      alert("Doação excluída com sucesso.");
      navigate("/doacoes");
    } catch (err) {
      console.error("❌ Erro ao excluir doação:", err);
      console.error("❌ Resposta do servidor:", err.response?.data);
      const status = err?.response?.status;
      if (status === 403 || status === 401) {
        alert(
          "❌ ERRO DE AUTORIZAÇÃO NO BACKEND\n\n" +
            "O servidor está negando a exclusão desta doação.\n\n" +
            "Possíveis causas:\n" +
            "1. Você não é o doador\n" +
            "2. Seu token JWT não tem o papel ADMIN\n" +
            "3. O backend precisa ajustar a lógica de autorização\n\n" +
            "O endpoint DELETE /doacoes/{id} no backend precisa permitir:\n" +
            "- ADMIN pode deletar qualquer doação\n" +
            "- Doador pode deletar apenas sua própria doação"
        );
      } else {
        alert("Não foi possível excluir a doação. Tente novamente.");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 mt-[80px]">
          {/* Botão Voltar */}
          <button
            onClick={() => navigate("/doacoes")}
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
            <span className="font-medium">Voltar para doações</span>
          </button>

          {/* Loading Elaborado */}
          <div className="flex flex-col items-center justify-center py-20">
            <div className="animate-spin rounded-full h-16 w-16 border-b-4 mb-6" style={{ borderColor: corPrincipal }}></div>
            <div className="text-center">
              <h2 className="text-2xl font-bold text-gray-900 mb-3">Carregando doação...</h2>
              <p className="text-gray-600 text-lg max-w-md mx-auto">
                Aguarde enquanto buscamos todos os detalhes desta doação
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

  if (!doacao) {
    return (
      <div className="max-w-6xl mx-auto p-6 mt-[80px]">
        <button onClick={() => navigate(-1)} className="text-blue-600">
          Voltar
        </button>
        <p className="text-gray-600">Doação não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12 mt-[80px]">
        {/* Botão Voltar */}
        <button
          onClick={() => navigate("/doacoes")}
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
          <span className="font-medium">Voltar para doações</span>
        </button>

        {/* Card Principal da Doação */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border border-gray-200">
          {/* Imagem de Capa */}
          <div className="relative h-[300px] lg:h-[500px] overflow-hidden">
            <img
              src={doacao.imagem}
              alt={doacao.titulo}
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>

            {/* Badge da Zona */}
            <div
              className="absolute top-6 right-6 px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg backdrop-blur-sm"
              style={{ backgroundColor: corPrincipal }}
            >
              {doacao.zona}
            </div>

            {/* Doador - MOVIDO PARA CANTO SUPERIOR ESQUERDO */}
            <div className="absolute top-6 left-6 flex items-center gap-4">
              <img
                src={doacao.fotoPerfil || NoPicture}
                alt={doacao.autor}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div>
                <p className="text-sm font-medium text-black" style={{ color: corPrincipal }}>Doado por</p>
                <p className="text-lg font-bold text-black" style={{ color: corPrincipal }}>
                  {nomeAutor || "Carregando..."}
                </p>
              </div>
            </div>

            {/* Botão Excluir - CANTO INFERIOR DIREITO */}
            {podeExcluirDoacao && (
              <div className="absolute bottom-6 right-6">
                <button
                  onClick={() => setModalDeletarDoacao(true)}
                  className="p-3 bg-red-500 hover:bg-red-600 text-white rounded-full shadow-lg transition-all duration-200 transform hover:scale-110"
                  title="Excluir doação"
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
              {doacao.titulo}
            </h1>

            {/* Texto/Resumo da Doação - ACIMA DOS METADADOS */}
            {(doacao.resumo || doacao.descricao) && (
              <p className="text-xl text-gray-600 mb-6 font-medium leading-relaxed">
                {doacao.resumo || doacao.descricao}
              </p>
            )}

            {/* Metadados - COM HORÁRIO */}
            <div className="flex flex-wrap items-center gap-4 pb-6 mb-6 border-b border-gray-200">
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
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                  ></path>
                </svg>
                <span className="text-sm font-medium">
                  {doacao.categoria || "Categoria não informada"}
                </span>
              </div>
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
                  {doacao.dataHoraCriacao
                    ? `Publicado em ${new Date(
                        doacao.dataHoraCriacao
                      ).toLocaleDateString("pt-BR")} às ${new Date(
                        doacao.dataHoraCriacao
                      ).toLocaleTimeString("pt-BR")}`
                    : "Hoje"}
                </span>
              </div>
            </div>

            {/* Botão de Contato */}
            {doacao.telefone && (
              <a
                href={`https://wa.me/${doacao.telefone}`}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 bg-green-500 hover:bg-green-600 text-white px-8 py-4 rounded-xl font-bold text-lg shadow-lg transition-all duration-200 transform hover:scale-105"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
                </svg>
                Entrar em contato
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
          <div className="mb-8 bg-white rounded-xl shadow-md border border-gray-200 overflow-hidden transition-all duration-300 hover:shadow-lg">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 p-4">
              <img
                src={user?.fotoPerfil || NoPicture}
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
                      src={coment.avatar || NoPicture}
                      alt={coment.nomeUsuario || "Usuário"}
                      className="w-12 h-12 rounded-full object-cover border-2 border-gray-200 flex-shrink-0"
                      onError={(e) => {
                        e.target.src = NoPicture;
                      }}
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
                          // ✅ ADMIN pode deletar qualquer comentário
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

        {/* Modal de Confirmação para Excluir Doação */}
        <ModalConfirmacao
          isOpen={modalDeletarDoacao}
          onClose={() => setModalDeletarDoacao(false)}
          onConfirm={handleDeletarDoacao}
          titulo="Excluir Doação"
          mensagem="Tem certeza que deseja excluir esta doação? Esta ação não pode ser desfeita."
          textoBotaoConfirmar="Excluir"
          textoBotaoCancelar="Cancelar"
          corBotaoConfirmar="#ef4444"
        />
      </div>
    </div>
  );
}
