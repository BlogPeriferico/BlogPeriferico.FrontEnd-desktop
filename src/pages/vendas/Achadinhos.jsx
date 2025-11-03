import CarrosselVendas from "../../components/carrossels/CarrosselVendas";
import SelecaoAnuncios from "../../components/selecoes/SelecaoAnuncios";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ModalProduto from "../../components/modals/ModalProduto";
import { useRegiao } from "../../contexts/RegionContext";
import { useUser } from "../../contexts/UserContext";
import { regionColors } from "../../utils/regionColors";
import VendasService from "../../services/AnuncioService";
import { ModalVisitantes } from "../../components/modals/ModalVisitantes";

export default function Vendas() {
  const [modalAberto, setModalAberto] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [produtos, setProdutos] = useState([]);
  const [loadingProdutos, setLoadingProdutos] = useState(true);
  const { regiao } = useRegiao();
  const { user } = useUser();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";
  const navigate = useNavigate();
  
  // Verifica se o usuário é um visitante
  const isVisitor = !user || user.isVisitor === true;

  useEffect(() => {
    document.body.style.overflow = modalAberto ? "hidden" : "auto";
  }, [modalAberto]);

  // Função para normalizar os dados do produto
  const mapProdutoFromDTO = (p) => ({
    id: String(p.id),
    titulo: p.titulo || "",
    descricao: p.descricao || "",
    // Preço e valor: mantém ambos para compatibilidade na listagem
    preco: p.preco ?? p.valor ?? null,
    valor: p.valor ?? p.preco ?? null,
    // Região/Zona
    regiao: p.regiao || p.zona || p.local || "Centro",
    dataHoraCriacao: p.dataHoraCriacao || new Date().toISOString(),
    // Contatos: preserva diferentes possíveis chaves
    telefone: p.telefone || p.contato || p.celular || p.whatsapp || "",
    contato: p.contato || p.telefone || "",
    imagem: p.imagem || "",
    categoria: p.categoria || "Outros"
  });

  // Função para recarregar os produtos mantendo o filtro de região
  const recarregarProdutos = useCallback(async () => {
    try {
      setLoadingProdutos(true);
      console.log(`Atualizando produtos para a região: ${regiao || "Todas as regiões"}`);
      
      // Busca todos os produtos
      const response = await VendasService.getAnuncios();
      const dados = Array.isArray(response) ? response : [];
      
      // Normaliza os dados dos produtos
      const produtosNormalizados = dados.map(mapProdutoFromDTO);
      
      // Ordena por data de criação (mais recentes primeiro)
      const produtosOrdenados = [...produtosNormalizados].sort((a, b) => 
        new Date(b.dataHoraCriacao) - new Date(a.dataHoraCriacao)
      );
      
      // Filtra por região se necessário (trata Central vs Centro)
      let produtosFiltrados = produtosOrdenados;
      if (regiao) {
        const regiaoFiltro = regiao.toLowerCase() === 'central' ? 'Centro' : regiao;
        produtosFiltrados = produtosOrdenados.filter(produto => 
          produto.regiao && produto.regiao.toLowerCase() === regiaoFiltro.toLowerCase()
        );
      }
      
      setProdutos(produtosFiltrados);
      console.log(`✅ ${produtosFiltrados.length} produtos carregados`);
    } catch (err) {
      console.error("❌ Erro ao carregar produtos:", err);
    } finally {
      setLoadingProdutos(false);
    }
  }, [regiao]);
  
  // Busca os produtos quando a região mudar
  useEffect(() => {
    recarregarProdutos();
  }, [recarregarProdutos]);

  // Função para buscar os produtos (mantida para compatibilidade)
  const fetchProdutos = useCallback(async () => {
    await recarregarProdutos();
  }, [recarregarProdutos]);

  return (
    <div className="max-w-6xl mx-auto pt-24 px-6 relative">
      {/* Botão flutuante de adicionar */}
      <div className="fixed top-28 right-6 z-50 hover:scale-105">
        <button
          onClick={() => {
            if (!isVisitor) {
              setModalAberto(true);
            } else {
              setShowAuthModal(true);
            }
          }}
          className="bg-[color:var(--corPrincipal)] text-white p-3 rounded-full shadow-lg hover:bg-opacity-90"
          style={{ backgroundColor: corPrincipal }}
          title="Adicionar novo produto"
        >
          <FiPlus size={24} />
        </button>
      </div>

      {/* Modal de autenticação para visitantes */}
      <ModalVisitantes
        abrir={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={() => {
          // Fecha o modal primeiro
          setShowAuthModal(false);
          // Adiciona um pequeno atraso para garantir que a animação de fechamento ocorra
          setTimeout(() => {
            navigate('/login');
          }, 100);
        }}
      />

      {/* Modal de adicionar produto - Só mostra se não for visitante */}
      {!isVisitor && modalAberto && (
        <ModalProduto
          modalAberto={modalAberto}
          setModalAberto={setModalAberto}
          corPrincipal={corPrincipal}
          atualizarAnuncios={fetchProdutos}
        />
      )}

      <div className="mb-16">
        <CarrosselVendas produtos={produtos} />
      </div>

      <div className="relative mb-16">
        <div className="flex justify-between items-center">
          <div className="text-center w-full">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 relative inline-block">
              Anúncios Recentes
              <div
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 rounded-full"
                style={{ backgroundColor: corPrincipal }}
              ></div>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Confira as melhores ofertas e descontos na sua região
            </p>
          </div>
          <div className="absolute right-0 top-0">
            <button
              onClick={recarregarProdutos}
              disabled={loadingProdutos}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                loadingProdutos 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-500' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } transition-colors`}
              title="Atualizar anúncios"
              aria-label="Atualizar anúncios"
            >
              <FiRefreshCw className={`w-5 h-5 ${loadingProdutos ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Atualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* SelecaoAnuncios cuida do cabeçalho, loading e estado vazio */}
      <SelecaoAnuncios produtos={produtos} loading={loadingProdutos} />
    </div>
  );
}