import CarrosselVendas from "../../components/carrossels/CarrosselVendas";
import SelecaoAnuncios from "../../components/selecoes/SelecaoAnuncios";
import { FiPlus } from "react-icons/fi";
import { useState, useEffect } from "react";
import ModalProduto from "../../components/modals/ModalProduto";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";

export default function Vendas() {
  const [modalAberto, setModalAberto] = useState(false);
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";

  useEffect(() => {
    if (modalAberto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [modalAberto]);

  return (
    <div className="max-w-6xl mx-auto pt-24 px-6 relative">
      {/* Botão flutuante de adicionar */}
      <div className="fixed top-28 right-6 z-50">
        <button
          onClick={() => setModalAberto(true)}
          className="bg-[color:var(--corPrincipal)] text-white p-3 rounded-full shadow-lg hover:bg-opacity-90"
          style={{ backgroundColor: corPrincipal }}
          title="Adicionar novo produto"
        >
          <FiPlus size={24} />
        </button>
      </div>

      {/* Modal de adicionar produto */}
      {modalAberto && (
        <ModalProduto
          modalAberto={modalAberto}
          setModalAberto={setModalAberto}
          corPrincipal={corPrincipal}
        />
      )}

      <CarrosselVendas />
      <SelecaoAnuncios />
    </div>
  );
}
