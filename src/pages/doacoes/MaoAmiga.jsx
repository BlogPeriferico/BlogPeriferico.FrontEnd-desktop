import CarrosselDoacoes from "../../components/carrossels/CarrosselDoacao";
import SelecaoDoacoes from "../../components/selecoes/SelecaoDoacoes";
import { FiPlus } from "react-icons/fi";
import { useState, useEffect } from "react";
import ModalDoacao from "../../components/modals/ModalDoacao";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";

export default function Doacoes() {
  const [modalAberto, setModalAberto] = useState(false);
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";

  useEffect(() => {
    document.body.style.overflow = modalAberto ? "hidden" : "auto";
  }, [modalAberto]);

  return (
    <div className="max-w-6xl mx-auto pt-24 px-6 relative ">
      {/* Botão flutuante de adicionar doação */}
      <div className="fixed top-28 right-6 z-50 hover:scale-105">
        <button
          onClick={() => setModalAberto(true)}
          className="bg-[color:var(--corPrincipal)] text-white p-3 rounded-full shadow-lg hover:bg-opacity-90 "
          style={{ backgroundColor: corPrincipal }}
          title="Adicionar nova doação"
        >
          <FiPlus size={24} />
        </button>
      </div>

      {/* Modal de adicionar doação */}
      {modalAberto && (
        <ModalDoacao
          modalAberto={modalAberto}
          setModalAberto={setModalAberto}
          corPrincipal={corPrincipal}
        />
      )}

      <CarrosselDoacoes />
      <SelecaoDoacoes />
    </div>
  );
}
