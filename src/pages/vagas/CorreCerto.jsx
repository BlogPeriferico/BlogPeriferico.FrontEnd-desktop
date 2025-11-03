import { FiPlus, FiRefreshCw } from "react-icons/fi";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../services/Api";
import ModalCorreCerto from "../../components/modals/ModalCorreCerto";
import { useRegiao } from "../../contexts/RegionContext";
import { useUser } from "../../contexts/UserContext";
import { regionColors } from "../../utils/regionColors";
import CarrosselCorreCerto from "../../components/carrossels/CarrosselCorreCerto";
import SelecaoCorreCerto from "../../components/selecoes/SelecaoCorreCerto";
import CorreCertoService from "../../services/CorreCertoService";
import { ModalVisitantes } from "../../components/modals/ModalVisitantes";

export default function CorreCerto() {
  const [modalAberto, setModalAberto] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [correcertos, setCorrecertos] = useState([]);
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

  // Função para normalizar os dados da vaga
  const mapVagaFromDTO = (v) => ({
    id: String(v.id),
    titulo: v.titulo || "",
    descricao: v.descricao || "",
    empresa: v.empresa || "",
    salario: v.salario || "A combinar",
    tipo: v.tipo || "CLT",
    regiao: v.regiao || v.zona || v.local || "Centro",
    dataHoraCriacao: v.dataHoraCriacao || new Date().toISOString(),
    // Contatos normalizados: garante que `telefone` seja preenchido para a listagem
    telefone: v.telefone || v.contato || v.celular || v.whatsapp || "",
    contato: v.contato || v.telefone || "",
    imagem: v.imagem || ""
  });

  // Função para recarregar as vagas mantendo o filtro de região
  const recarregarVagas = useCallback(async () => {
    try {
      setLoading(true);
      console.log(`Atualizando vagas para a região: ${regiao || "Todas as regiões"}`);
      
      // Busca todas as vagas
      const response = await api.get("/vagas");
      const dados = Array.isArray(response.data) ? response.data : [];
      
      // Normaliza os dados das vagas
      const vagasNormalizadas = dados.map(mapVagaFromDTO);
      
      // Ordena por data de criação (mais recentes primeiro)
      const vagasOrdenadas = [...vagasNormalizadas].sort((a, b) => 
        new Date(b.dataHoraCriacao) - new Date(a.dataHoraCriacao)
      );
      
      // Filtra por região se necessário (trata Central vs Centro)
      let vagasFiltradas = vagasOrdenadas;
      if (regiao) {
        const regiaoFiltro = regiao.toLowerCase() === 'central' ? 'Centro' : regiao;
        vagasFiltradas = vagasOrdenadas.filter(vaga => 
          vaga.regiao && vaga.regiao.toLowerCase() === regiaoFiltro.toLowerCase()
        );
      }
      
      setCorrecertos(vagasFiltradas);
      console.log(`✅ ${vagasFiltradas.length} vagas carregadas`);
    } catch (err) {
      console.error("❌ Erro ao carregar vagas:", err);
    } finally {
      setLoading(false);
    }
  }, [regiao]);
  
  // Função para carregar as vagas (mantida para compatibilidade)
  const carregarCorrecertos = useCallback(async () => {
    await recarregarVagas();
  }, [recarregarVagas]);

  // Busca as vagas quando a região mudar
  useEffect(() => {
    recarregarVagas();
  }, [recarregarVagas]);

  return (
    <div className="max-w-6xl mx-auto pt-24 px-6 relative">
      {/* Botão flutuante de adicionar vaga */}
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
          title="Adicionar sua Vaga de emprego"
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

      {/* Modal de adicionar vaga - Só mostra se não for visitante */}
      {!isVisitor && modalAberto && (
        <ModalCorreCerto
          modalAberto={modalAberto}
          setModalAberto={setModalAberto}
          corPrincipal={corPrincipal}
          atualizarCorrecertos={carregarCorrecertos}
        />
      )}

      <div className="mb-16">
        <CarrosselCorreCerto />
      </div>

      <div className="relative mb-16">
        <div className="flex justify-between items-center">
          <div className="text-center w-full">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 relative inline-block">
              Vagas Recentes
              <div
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 rounded-full"
                style={{ backgroundColor: corPrincipal }}
              ></div>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Encontre as melhores oportunidades de trabalho na sua região
            </p>
          </div>
          <div className="absolute right-0 top-0">
            <button
              onClick={recarregarVagas}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                loading 
                  ? 'bg-gray-200 dark:bg-gray-700 text-gray-500' 
                  : 'bg-blue-600 hover:bg-blue-700 text-white'
              } transition-colors`}
              title="Atualizar vagas"
              aria-label="Atualizar vagas"
            >
              <FiRefreshCw className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Atualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* SelecaoCorreCerto sempre visível: título estático e conteúdo alterna entre spinner e grid */}
      <SelecaoCorreCerto correcertos={correcertos} loading={loading} />
    </div>
  );
}