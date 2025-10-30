import CarrosselVendas from "../../components/carrossels/CarrosselVendas";
import SelecaoAnuncios from "../../components/selecoes/SelecaoAnuncios";
import { FiPlus } from "react-icons/fi";
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

  // Busca os produtos baseado na região atual
  const fetchProdutos = useCallback(async () => {
    try {
      setLoadingProdutos(true);
      console.log(`Buscando produtos para a região: ${regiao || 'Todas as regiões'}`);
      
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
  
  // Atualiza quando a região mudar
  useEffect(() => {
    fetchProdutos();
  }, [fetchProdutos]);

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
            navigate('/auth/login');
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

      <CarrosselVendas produtos={produtos} />

      {/* SelecaoAnuncios cuida do cabeçalho, loading e estado vazio */}
      <SelecaoAnuncios produtos={produtos} loading={loadingProdutos} />
    </div>
  );
}
