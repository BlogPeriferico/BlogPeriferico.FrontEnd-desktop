import CarrosselDoacao from "../../components/carrossels/CarrosselDoacao";
import SelecaoDoacoes from "../../components/selecoes/SelecaoDoacoes";
import { FiPlus } from "react-icons/fi";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ModalDoacao from "../../components/modals/ModalDoacao";
import { useRegiao } from "../../contexts/RegionContext";
import { useUser } from "../../contexts/UserContext";
import { regionColors } from "../../utils/regionColors";
import DoacaoService from "../../services/DoacaoService";
import api from "../../services/Api";
import { ModalVisitantes } from "../../components/modals/ModalVisitantes";

export default function Doacoes() {
  const [modalAberto, setModalAberto] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [doacoes, setDoacoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const { regiao } = useRegiao();
  const { user } = useUser();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";
  const navigate = useNavigate();
  
  // Verifica se o usuário é um visitante
  const isVisitor = !user || user.isVisitor === true;

  useEffect(() => {
    document.body.style.overflow = modalAberto ? "hidden" : "auto";
  }, [modalAberto]);

  // Função para normalizar os dados da doação
  const mapDoacaoFromDTO = (d) => ({
    id: String(d.id),
    titulo: d.titulo || "",
    descricao: d.descricao || "",
    imagem: d.imagem || "",
    regiao: d.regiao || d.zona || d.local || "Centro",
    dataHoraCriacao: d.dataHoraCriacao || new Date().toISOString(),
    status: d.status || "Ativa"
  });

  // Função para carregar doações do backend
  const carregarDoacoes = useCallback(async () => {
    try {
      setLoading(true);
      console.log(`Buscando doações para a região: ${regiao || 'Todas as regiões'}`);
      
      // Busca todas as doações
      const response = await api.get("/doacoes");
      const dados = Array.isArray(response.data) ? response.data : [];
      
      // Normaliza os dados das doações
      const doacoesNormalizadas = dados.map(mapDoacaoFromDTO);
      
      // Ordena por data de criação (mais recentes primeiro)
      const doacoesOrdenadas = [...doacoesNormalizadas].sort((a, b) => 
        new Date(b.dataHoraCriacao) - new Date(a.dataHoraCriacao)
      );
      
      // Filtra por região se necessário (trata Central vs Centro)
      let doacoesFiltradas = doacoesOrdenadas;
      if (regiao) {
        const regiaoFiltro = regiao.toLowerCase() === 'central' ? 'Centro' : regiao;
        doacoesFiltradas = doacoesOrdenadas.filter(doacao => 
          doacao.regiao && doacao.regiao.toLowerCase() === regiaoFiltro.toLowerCase()
        );
      }
      
      setDoacoes(doacoesFiltradas);
      console.log(`✅ ${doacoesFiltradas.length} doações carregadas`);
    } catch (err) {
      console.error("❌ Erro ao carregar doações:", err);
    } finally {
      setLoading(false);
    }
  }, [regiao]);
  
  useEffect(() => {
    carregarDoacoes();
  }, [carregarDoacoes]);

  // Abre modal somente se estiver logado
  const abrirModal = () => {
    if (!isVisitor) {
      setModalAberto(true);
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <div className="max-w-6xl mx-auto pt-24 px-6 relative">
      {/* Botão de adicionar doação */}
      <div className="fixed top-28 right-6 z-50 hover:scale-105">
        <button
          onClick={abrirModal}
          className="bg-[color:var(--corPrincipal)] text-white p-3 rounded-full shadow-lg hover:bg-opacity-90"
          style={{ backgroundColor: corPrincipal }}
          title="Adicionar sua doação"
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

      {/* Modal de adicionar doação - Só mostra se não for visitante */}
      {!isVisitor && modalAberto && (
        <ModalDoacao
          modalAberto={modalAberto}
          setModalAberto={setModalAberto}
          corPrincipal={corPrincipal}
          atualizarDoacoes={carregarDoacoes}
        />
      )}

      {/* Carrossel */}
      <CarrosselDoacao doacoes={doacoes} />

      {/* Seleção */}
      <SelecaoDoacoes doacoes={doacoes} loading={loading} />
    </div>
  );
}
