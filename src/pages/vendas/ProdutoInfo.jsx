import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";
import AnuncioService from "../../services/AnuncioService";
import api from "../../services/Api";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import { FaTrash } from "react-icons/fa";
import ModalConfirmacao from "../../components/modals/ModalConfirmacao";

export default function ProdutoInfo() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";

  const [produto, setProduto] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);
  const [usuarioLogado, setUsuarioLogado] = useState({ id: null, email: null, nome: "Visitante", papel: null });
  const [modalDeletarProduto, setModalDeletarProduto] = useState(false);
  const [nomeAutor, setNomeAutor] = useState(null);

  // Carregar perfil do usuário
  useEffect(() => {
    const carregarPerfil = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        console.error("Usuário não está logado");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const email = decoded.sub;
        const papel =
          decoded.role ||
          decoded.authorities ||
          localStorage.getItem("role") ||
          null;
        console.log("📧 Email do token:", email);
        console.log("🔑 Papel do usuário:", papel);

        // Buscar usuário na lista de todos os usuários
        try {
          const response = await api.get("/usuarios/listar");
          const usuarios = response.data;
          const usuarioEncontrado = usuarios.find((u) => u.email === email);

          if (usuarioEncontrado) {
            setUsuarioLogado({
              id: usuarioEncontrado.id,
              email: email,
              nome: usuarioEncontrado.nome,
              papel: papel || usuarioEncontrado.papel || usuarioEncontrado.role,
            });
            console.log("✅ Usuário encontrado:", usuarioEncontrado);
          } else {
            console.error("⚠️ Usuário não encontrado na lista");
          }
        } catch (err) {
          console.error("❌ Erro ao buscar lista de usuários:", err);
        }
      } catch (err) {
        console.error("❌ Erro geral ao carregar perfil:", err);
      }
    };
    carregarPerfil();
  }, []);

  // Carregar produto se não vier via state
  useEffect(() => {
    window.scrollTo(0, 0);

    if (!produto && id) {
      setLoading(true);
      AnuncioService.buscarAnuncioPorId(id)
        .then((data) => {
          console.log("🔍 PRODUTO RECEBIDO DO BACKEND:", data);
          console.log("📝 Campos disponíveis:", Object.keys(data));
          setProduto(data);
        })
        .catch((err) => {
          console.error("❌ Erro ao buscar produto:", err);
          setProduto(null);
        })
        .finally(() => setLoading(false));
    } else if (produto) {
      console.log("🔍 PRODUTO VIA STATE:", produto);
      console.log("📝 Campos disponíveis:", Object.keys(produto));
    }
  }, [id, produto]);

  // Buscar nome do autor do produto
  useEffect(() => {
    const buscarAutor = async () => {
      if (produto && produto.idUsuario) {
        try {
          const response = await api.get("/usuarios/listar");
          const usuarios = response.data;
          const autor = usuarios.find((u) => u.id === produto.idUsuario);
          if (autor) {
            setNomeAutor(autor.nome);
            console.log("✅ Autor do produto:", autor.nome);
          }
        } catch (err) {
          console.error(
            "❌ Erro ao buscar autor (403 - backend bloqueando):",
            err
          );
          // Fallback: usa o campo autor se existir
          setNomeAutor(produto.autor || "Vendedor");
        }
      } else if (produto && produto.autor) {
        // Se não tem idUsuario, usa o campo autor direto
        setNomeAutor(produto.autor);
      }
    };
    buscarAutor();
  }, [produto]);

  // Verificação de propriedade do produto (IGUAL AO NOTICIASINFO)
  const podeExcluirProduto = Boolean(
    produto &&
      usuarioLogado &&
      // ADMIN pode deletar qualquer produto
      (usuarioLogado.papel === "ADMINISTRADOR" ||
        usuarioLogado.papel === "ADMIN" ||
        // Autor pode deletar apenas seu próprio produto
        produto.idUsuario === usuarioLogado.id ||
        produto.emailUsuario === usuarioLogado.email ||
        produto.autor === usuarioLogado.nome)
  );

  // Debug: log de permissões (IGUAL AO NOTICIASINFO)
  useEffect(() => {
    if (produto && usuarioLogado.id) {
      console.log("🔍 Verificação de permissões:");
      console.log("  - Papel do usuário:", usuarioLogado.papel);
      console.log(
        "  - É ADMIN?",
        usuarioLogado.papel === "ADMINISTRADOR" ||
          usuarioLogado.papel === "ADMIN"
      );
      console.log("  - ID do autor do produto:", produto.idUsuario);
      console.log("  - Nome do autor:", nomeAutor);
      console.log("  - ID do usuário logado:", usuarioLogado.id);
      console.log("  - Nome do usuário:", usuarioLogado.nome);
      console.log("  - Pode excluir?", podeExcluirProduto);
    }
  }, [produto, usuarioLogado, podeExcluirProduto, nomeAutor]);

  // Deletar produto (IGUAL AO NOTICIASINFO)
  const handleDeletarProduto = async () => {
    try {
      // ✅ USA O ID DO PRODUTO OU DA URL
      const produtoId = produto?.id || id;
      
      console.log("🗑️ Tentando excluir produto ID:", produtoId);
      console.log("🔑 Token no localStorage:", localStorage.getItem("token"));
      console.log("👤 Usuário logado:", usuarioLogado);

      if (!produtoId) {
        alert("Erro: ID do produto não encontrado.");
        return;
      }

      await AnuncioService.excluirAnuncio(produtoId);
      setModalDeletarProduto(false);
      alert("Produto excluído com sucesso.");
      navigate("/achadinhos");
    } catch (err) {
      console.error("❌ Erro ao excluir produto:", err);
      console.error("❌ Status HTTP:", err.response?.status);
      console.error("❌ Dados do erro:", err.response?.data);
      
      const status = err?.response?.status;
      if (status === 403 || status === 401) {
        alert("Você não tem permissão para excluir este produto.");
      } else {
        alert("Não foi possível excluir o produto. Tente novamente.");
      }
    }
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 mt-[80px]">
        <p className="text-gray-600">Carregando produto...</p>
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

            {/* Badge da Zona */}
            <div
              className="absolute top-6 right-6 px-4 py-2 rounded-full text-white font-bold text-sm shadow-lg backdrop-blur-sm"
              style={{ backgroundColor: corPrincipal }}
            >
              {produto.zona || "VENDA"}
            </div>

            {/* Vendedor - CANTO SUPERIOR ESQUERDO */}
            <div className="absolute top-6 left-6 flex items-center gap-4">
              <img
                src={produto.fotoAutor || "https://i.pravatar.cc/80"}
                alt={produto.autor}
                className="w-16 h-16 rounded-full object-cover border-4 border-white shadow-lg"
              />
              <div>
                <p className="text-sm font-medium text-black">Vendido por</p>
                <p className="text-lg font-bold text-black">
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
      </div>
    </div>
  );
}
