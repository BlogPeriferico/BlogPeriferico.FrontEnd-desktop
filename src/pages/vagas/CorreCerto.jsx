// src/pages/CorreCerto.jsx
import React, { useState, useEffect, useCallback } from "react";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import { useNavigate } from "react-router-dom";
import api from "../../services/Api";
import ModalCorreCerto from "../../components/modals/ModalCorreCerto";
import { useRegiao } from "../../contexts/RegionContext";
import { useUser } from "../../contexts/UserContext";
import { regionColors } from "../../utils/regionColors";
import CarrosselCorreCerto from "../../components/carrossels/CarrosselCorreCerto";
import SelecaoCorreCerto from "../../components/selecoes/SelecaoCorreCerto";
import { ModalVisitantes } from "../../components/modals/ModalVisitantes";

// Função para normalizar os dados da vaga (fora do componente = mais performático)
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
  imagem: v.imagem || "",
});

export default function CorreCerto() {
  const [modalAberto, setModalAberto] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [correcertos, setCorrecertos] = useState([]);
  const [loading, setLoading] = useState(true);

  const { regiao } = useRegiao();
  const { user } = useUser();
  const navigate = useNavigate();

  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";

  // Verifica se o usuário é um visitante
  const isVisitor = !user || user.isVisitor === true;

  // Controla o scroll do body quando o modal está aberto (mais seguro/acessível)
  useEffect(() => {
    if (typeof document === "undefined") return;

    const originalOverflow = document.body.style.overflow;

    if (modalAberto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = originalOverflow || "auto";
    }

    return () => {
      document.body.style.overflow = originalOverflow || "auto";
    };
  }, [modalAberto]);

  // Função para recarregar as vagas mantendo o filtro de região
  const recarregarVagas = useCallback(async () => {
    try {
      setLoading(true);

      // Busca todas as vagas
      const response = await api.get("/vagas");
      const dados = Array.isArray(response.data) ? response.data : [];

      // Normaliza os dados das vagas
      const vagasNormalizadas = dados.map(mapVagaFromDTO);

      // Ordena por data de criação (mais recentes primeiro)
      const vagasOrdenadas = [...vagasNormalizadas].sort(
        (a, b) => new Date(b.dataHoraCriacao) - new Date(a.dataHoraCriacao)
      );

      // Filtra por região se necessário (trata Central vs Centro)
      let vagasFiltradas = vagasOrdenadas;
      if (regiao) {
        const regiaoFiltro =
          regiao.toLowerCase() === "central" ? "Centro" : regiao;
        vagasFiltradas = vagasOrdenadas.filter(
          (vaga) =>
            vaga.regiao &&
            vaga.regiao.toLowerCase() === regiaoFiltro.toLowerCase()
        );
      }

      setCorrecertos(vagasFiltradas);
    } catch (err) {
      // Erro silencioso (poderia ter um toast se quiser feedback visual)
      console.error("Erro ao carregar vagas:", err);
    } finally {
      setLoading(false);
    }
  }, [regiao]);

  // Função para carregar as vagas (mantida para compatibilidade com o modal)
  const carregarCorrecertos = useCallback(async () => {
    await recarregarVagas();
  }, [recarregarVagas]);

  // Busca as vagas quando a região mudar / página carregar
  useEffect(() => {
    recarregarVagas();
  }, [recarregarVagas]);

  const handleAbrirModal = () => {
    if (!isVisitor) {
      setModalAberto(true);
    } else {
      setShowAuthModal(true);
    }
  };

  return (
    <main
      className="max-w-6xl mx-auto pt-24 px-6 relative"
      aria-label="Página Corre Certo - vagas de emprego da comunidade"
    >
      {/* Botão flutuante de adicionar vaga */}
      <div className="fixed top-28 right-6 z-50 hover:scale-105 transition-transform duration-200">
        <button
          type="button"
          onClick={handleAbrirModal}
          className="bg-[color:var(--corPrincipal)] text-white p-3 rounded-full shadow-lg hover:bg-opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600"
          style={{ backgroundColor: corPrincipal }}
          title="Adicionar sua vaga de emprego"
          aria-label="Adicionar nova vaga de emprego"
          aria-haspopup="dialog"
          aria-expanded={modalAberto}
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

      {/* Modal de adicionar vaga - Só mostra se não for visitante */}
      {!isVisitor && modalAberto && (
        <ModalCorreCerto
          modalAberto={modalAberto}
          setModalAberto={setModalAberto}
          corPrincipal={corPrincipal}
          atualizarCorrecertos={carregarCorrecertos}
        />
      )}

      {/* Carrossel de destaques / contexto de vagas */}
      <section
        className="mb-16"
        aria-label="Carrossel com destaques e orientações sobre vagas de emprego"
      >
        <CarrosselCorreCerto />
      </section>

      {/* Cabeçalho da seção de vagas + botão de atualizar */}
      <section className="relative mb-16">
        <div className="flex justify-between items-center">
          <div className="text-center w-full">
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 relative inline-block">
              Vagas Recentes
              <span
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 rounded-full"
                style={{ backgroundColor: corPrincipal }}
                aria-hidden="true"
              ></span>
            </h1>
            <p className="text-gray-600 text-lg max-w-2xl mx-auto">
              Encontre as melhores oportunidades de trabalho na sua região
            </p>
          </div>

          <div className="absolute right-0 top-0">
            <button
              type="button"
              onClick={recarregarVagas}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-blue-600 ${
                loading
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 text-white"
              } transition-colors`}
              title="Atualizar vagas"
              aria-label="Atualizar lista de vagas"
              aria-busy={loading}
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

      {/* Lista / seleção de vagas – região viva pra leitor de tela */}
      <section
        aria-label="Lista de vagas de emprego disponíveis"
        aria-live="polite"
        aria-busy={loading}
      >
        <SelecaoCorreCerto correcertos={correcertos} loading={loading} />
      </section>
    </main>
  );
}
