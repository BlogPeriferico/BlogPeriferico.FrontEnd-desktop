import CarrosselDoacao from "../../components/carrossels/CarrosselDoacao";
import SelecaoDoacoes from "../../components/selecoes/SelecaoDoacoes";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import ModalDoacao from "../../components/modals/ModalDoacao";
import { useRegiao } from "../../contexts/RegionContext";
import { useUser } from "../../contexts/UserContext";
import { regionColors } from "../../utils/regionColors";
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

  // Controla o scroll do body quando qualquer modal está aberto
  useEffect(() => {
    const algumModalAberto = modalAberto || showAuthModal;
    document.body.style.overflow = algumModalAberto ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [modalAberto, showAuthModal]);

  // Função para normalizar os dados da doação
  const mapDoacaoFromDTO = (d) => ({
    id: String(d.id),
    titulo: d.titulo || "",
    descricao: d.descricao || "",
    imagem: d.imagem || "",
    regiao: d.regiao || d.zona || d.local || "Centro",
    dataHoraCriacao: d.dataHoraCriacao || new Date().toISOString(),
    status: d.status || "Ativa",
  });

  // Função para recarregar as doações mantendo o filtro de região
  const recarregarDoacoes = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/doacoes");
      const dados = Array.isArray(response.data) ? response.data : [];

      const doacoesNormalizadas = dados.map(mapDoacaoFromDTO);

      const doacoesOrdenadas = [...doacoesNormalizadas].sort(
        (a, b) => new Date(b.dataHoraCriacao) - new Date(a.dataHoraCriacao)
      );

      let doacoesFiltradas = doacoesOrdenadas;
      if (regiao) {
        const regiaoFiltro =
          regiao.toLowerCase() === "central" ? "Centro" : regiao;
        doacoesFiltradas = doacoesOrdenadas.filter(
          (doacao) =>
            doacao.regiao &&
            doacao.regiao.toLowerCase() === regiaoFiltro.toLowerCase()
        );
      }

      setDoacoes(doacoesFiltradas);
    } catch (err) {
      console.error("Erro ao carregar doações:", err);
    } finally {
      setLoading(false);
    }
  }, [regiao]);

  // Função para carregar as doações (mantida para compatibilidade)
  const carregarDoacoes = useCallback(async () => {
    await recarregarDoacoes();
  }, [recarregarDoacoes]);

  // Carrega as doações quando o componente for montado ou a região mudar
  useEffect(() => {
    recarregarDoacoes();
  }, [recarregarDoacoes]);

  // Abre modal somente se estiver logado
  const abrirModal = () => {
    if (!isVisitor) {
      setModalAberto(true);
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <main
      className="max-w-6xl mx-auto pt-24 px-6 relative"
      role="main"
      aria-label="Página de doações"
    >
      {/* Botão flutuante de adicionar doação */}
      <div className="fixed top-28 right-6 z-50 hover:scale-105">
        <button
          type="button"
          onClick={abrirModal}
          className="text-white p-3 rounded-full shadow-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          style={{ backgroundColor: corPrincipal }}
          title="Adicionar sua doação"
          aria-label="Adicionar nova doação"
        >
          <FiPlus size={24} aria-hidden="true" />
        </button>
      </div>

      {/* Modal de autenticação para visitantes */}
      <ModalVisitantes
        abrir={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={() => {
          setShowAuthModal(false);
          setTimeout(() => {
            navigate("/login");
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

      {/* Carrossel de destaques */}
      <section className="mb-16" aria-label="Doações em destaque">
        <CarrosselDoacao doacoes={doacoes} />
      </section>

      {/* Header da seção de lista + botão atualizar */}
      <section
        className="relative mb-16"
        aria-label="Lista de doações disponíveis"
      >
        <div className="flex justify-between items-center">
          <div className="text-center w-full">
            <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 relative inline-block">
              Doações Disponíveis
              <div
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 rounded-full"
                style={{ backgroundColor: corPrincipal }}
              ></div>
            </h2>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Encontre itens que podem fazer a diferença na vida de alguém
            </p>
          </div>

          <div className="absolute right-0 top-0">
            <button
              type="button"
              onClick={recarregarDoacoes}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                loading
                  ? "bg-gray-200 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              title="Atualizar doações"
              aria-label="Atualizar lista de doações"
              aria-busy={loading ? "true" : "false"}
            >
              <FiRefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
                aria-hidden="true"
              />
              <span className="text-sm font-medium">
                {loading ? "Atualizando..." : "Atualizar"}
              </span>
            </button>
          </div>
        </div>
      </section>

      {/* Lista / grade de doações */}
      <section aria-label="Grade de doações">
        <SelecaoDoacoes doacoes={doacoes} loading={loading} />
      </section>
    </main>
  );
}
