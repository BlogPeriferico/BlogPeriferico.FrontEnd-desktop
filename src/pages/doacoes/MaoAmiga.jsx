import CarrosselDoacao from "../../components/carrossels/CarrosselDoacao";
import SelecaoDoacoes from "../../components/selecoes/SelecaoDoacoes";
import { FiPlus } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ModalDoacao from "../../components/modals/ModalDoacao";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import DoacaoService from "../../services/DoacaoService";

export default function Doacoes() {
  const [modalAberto, setModalAberto] = useState(false);
  const [doacoes, setDoacoes] = useState([]);
  const [loading, setLoading] = useState(true); // ✅ Estado de loading
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";

  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = modalAberto ? "hidden" : "auto";
  }, [modalAberto]);

  // Função para carregar doações do backend
  const carregarDoacoes = async () => {
    try {
      setLoading(true); // ✅ Inicia loading
      const data = await DoacaoService.listarDoacoes();
      setDoacoes(data);
    } catch (err) {
      console.error("Erro ao carregar doações:", err);
    } finally {
      setLoading(false); // ✅ Finaliza loading
    }
  };

  useEffect(() => {
    carregarDoacoes();
  }, []);

  // Abre modal somente se estiver logado
  const abrirModal = () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      alert("Você precisa estar logado para criar uma doação.");
      navigate("/"); // redireciona para página principal
      return;
    }
    setModalAberto(true);
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

      {/* Modal */}
      {modalAberto && (
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
