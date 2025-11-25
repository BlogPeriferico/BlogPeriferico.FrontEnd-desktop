// src/pages/Doacoes/Doacoes.jsx
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

  const isVisitor = !user || user.isVisitor === true;

  useEffect(() => {
    document.body.style.overflow = modalAberto ? "hidden" : "auto";
  }, [modalAberto]);

  // Normaliza DTO vindo do back
  const mapDoacaoFromDTO = (d) => ({
    id: String(d.id),
    titulo: d.titulo || "",
    descricao: d.descricao || d.resumo || "",
    imagem: d.imagem || d.imagemCapa || "",
    regiao: d.regiao || d.zona || d.local || "Centro",
    zona: d.zona || d.regiao || d.local || "Centro",
    telefone:
      d.telefone || d.contato || d.celular || d.whatsapp || "",
    categoria: d.categoria || "",
    dataHoraCriacao:
      d.dataHoraCriacao || d.createdAt || new Date().toISOString(),
    status: d.status || "Ativa",
    idUsuario: d.idUsuario || d.usuarioId || d.usuario?.id || null,
    autor: d.autor || d.nomeDoador || d.usuario?.nome || "",
    fotoPerfil: d.fotoPerfil || d.usuario?.fotoPerfil || null,
  });

  // Recarregar doações
  const recarregarDoacoes = useCallback(async () => {
    try {
      setLoading(true);

      const response = await api.get("/doacoes");
      const dados = Array.isArray(response.data) ? response.data : [];

      const doacoesNormalizadas = dados.map(mapDoacaoFromDTO);

      const doacoesOrdenadas = [...doacoesNormalizadas].sort(
        (a, b) =>
          new Date(b.dataHoraCriacao) - new Date(a.dataHoraCriacao)
      );

      let doacoesFiltradas = doacoesOrdenadas;

      if (regiao) {
        const regiaoFiltro =
          regiao.toLowerCase() === "central" ? "Centro" : regiao;
        doacoesFiltradas = doacoesOrdenadas.filter((doacao) =>
          doacao.regiao
            ? doacao.regiao.toLowerCase() === regiaoFiltro.toLowerCase()
            : false
        );
      }

      setDoacoes(doacoesFiltradas);
    } catch (err) {
      console.error("Erro ao carregar doações:", err);
      setDoacoes([]);
    } finally {
      setLoading(false);
    }
  }, [regiao]);

  const carregarDoacoes = useCallback(async () => {
    await recarregarDoacoes();
  }, [recarregarDoacoes]);

  useEffect(() => {
    recarregarDoacoes();
  }, [recarregarDoacoes]);

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
          setShowAuthModal(false);
          setTimeout(() => {
            navigate("/login");
          }, 100);
        }}
      />

      {/* Modal de adicionar doação */}
      {!isVisitor && modalAberto && (
        <ModalDoacao
          modalAberto={modalAberto}
          setModalAberto={setModalAberto}
          corPrincipal={corPrincipal}
          atualizarDoacoes={carregarDoacoes}
        />
      )}

      {/* Carrossel */}
      <div className="mb-16">
        <CarrosselDoacao doacoes={doacoes} />
      </div>

      <div className="relative mb-16">
        <div className="relative">
          <div className="text-center mb-8">
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
          
          {/* Botão de atualizar - visível apenas em telas grandes */}
          <div className="absolute right-0 top-0 hidden md:block">
            <button
              onClick={recarregarDoacoes}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                loading
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  : "text-white hover:opacity-90"
              } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              title="Atualizar doações"
              aria-label="Atualizar doações"
              style={{ backgroundColor: loading ? "" : corPrincipal }}
            >
              <FiRefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
              <span className="text-sm font-medium">Atualizar</span>
            </button>
          </div>

          {/* Botão de atualizar - visível apenas em telas pequenas */}
          <div className="flex justify-center mt-6 mb-8 md:hidden">
            <button
              onClick={recarregarDoacoes}
              disabled={loading}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                loading
                  ? "bg-gray-200 dark:bg-gray-700 text-gray-500"
                  : "text-white hover:opacity-90"
              } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
              title="Atualizar doações"
              aria-label="Atualizar doações"
              style={{ backgroundColor: loading ? "" : corPrincipal }}
            >
              <FiRefreshCw
                className={`w-5 h-5 ${loading ? "animate-spin" : ""}`}
              />
              <span className="text-sm font-medium">Atualizar</span>
            </button>
          </div>
        </div>
      </div>

      {/* Lista / seleção */}
      <SelecaoDoacoes doacoes={doacoes} loading={loading} />
    </div>
  );
}
