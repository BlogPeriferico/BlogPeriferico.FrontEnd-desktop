import { FiPlus } from "react-icons/fi";
import { useState, useEffect } from "react";
import ModalCorreCerto from "../../components/modals/ModalCorreCerto";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import CarrosselCorreCerto from "../../components/carrossels/CarrosselCorreCerto";
import SelecaoCorreCerto from "../../components/selecoes/SelecaoCorreCerto";
import CorreCertoService from "../../services/CorreCertoService";

export default function CorreCerto() {
  const [modalAberto, setModalAberto] = useState(false);
  const [correcertos, setCorrecertos] = useState([]); // aqui vai o array do backend
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";

  useEffect(() => {
    document.body.style.overflow = modalAberto ? "hidden" : "auto";
  }, [modalAberto]);

  // Pegar lista de correcertos do backend
  const carregarCorrecertos = async () => {
    try {
      const dados = await CorreCertoService.listarCorrecertos();
      setCorrecertos(dados);
    } catch (err) {
      console.error("Erro ao carregar vagas:", err);
    }
  };

  useEffect(() => {
    carregarCorrecertos();
  }, []);

  return (
    <div className="max-w-6xl mx-auto pt-24 px-6 relative">
      {/* Botão flutuante de adicionar vaga */}
      <div className="fixed top-28 right-6 z-50 hover:scale-105">
        <button
          onClick={() => setModalAberto(true)}
          className="bg-[color:var(--corPrincipal)] text-white p-3 rounded-full shadow-lg hover:bg-opacity-90"
          style={{ backgroundColor: corPrincipal }}
          title="Adicionar sua Vaga de emprego"
        >
          <FiPlus size={24} />
        </button>
      </div>

      {/* Modal de adicionar vaga */}
      {modalAberto && (
        <ModalCorreCerto
          modalAberto={modalAberto}
          setModalAberto={setModalAberto}
          corPrincipal={corPrincipal}
          atualizarCorrecertos={carregarCorrecertos} // atualiza a lista após criar
        />
      )}

      <CarrosselCorreCerto />
      {/* Passa o array do backend */}
      <SelecaoCorreCerto correcertos={correcertos} />
    </div>
  );
}
