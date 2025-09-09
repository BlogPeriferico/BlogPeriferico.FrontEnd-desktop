import CarrosselCorreCerto from "../../components/carrossels/CarrosselCorreCerto";
import SelecaoCorreCerto from "../../components/selecoes/SelecaoCorreCerto";
import { FiPlus } from "react-icons/fi";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ModalCorreCerto from "../../components/modals/ModalCorreCerto";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import CorreCertoService from "../../services/CorreCertoService";

export default function CorreCerto() {
  const [modalAberto, setModalAberto] = useState(false);
  const [correcertos, setCorrecertos] = useState([]);
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";

  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = modalAberto ? "hidden" : "auto";
  }, [modalAberto]);

  // Função para carregar vagas do backend
  const carregarCorrecertos = async () => {
    try {
      const data = await CorreCertoService.listarCorrecertos();
      setCorrecertos(data);
    } catch (err) {
      console.error("Erro ao carregar vagas:", err);
    }
  };

  useEffect(() => {
    carregarCorrecertos();
  }, []);

  // Abre modal somente se estiver logado
  const abrirModal = () => {
    const token = localStorage.getItem("userToken");
    if (!token) {
      alert("Você precisa estar logado para criar uma vaga.");
      navigate("/"); // redireciona para página principal
      return;
    }
    setModalAberto(true);
  };

  return (
    <div className="max-w-6xl mx-auto pt-24 px-6 relative">
      <div className="fixed top-28 right-6 z-50 hover:scale-105">
        <button
          onClick={abrirModal}
          className="bg-[color:var(--corPrincipal)] text-white p-3 rounded-full shadow-lg hover:bg-opacity-90"
          style={{ backgroundColor: corPrincipal }}
          title="Adicionar sua Vaga de emprego"
        >
          <FiPlus size={24} />
        </button>
      </div>

      {modalAberto && (
        <ModalCorreCerto
          modalAberto={modalAberto}
          setModalAberto={setModalAberto}
          corPrincipal={corPrincipal}
          atualizarCorreCerto={carregarCorrecertos}
        />
      )}

      <CarrosselCorreCerto correcertos={correcertos} />
      <SelecaoCorreCerto correcertos={correcertos} />
    </div>
  );
}
