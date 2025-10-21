import { FiPlus } from "react-icons/fi";
import { useState, useEffect, useCallback } from "react";
import api from "../../services/Api";
import ModalCorreCerto from "../../components/modals/ModalCorreCerto";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import CarrosselCorreCerto from "../../components/carrossels/CarrosselCorreCerto";
import SelecaoCorreCerto from "../../components/selecoes/SelecaoCorreCerto";
import CorreCertoService from "../../services/CorreCertoService";

export default function CorreCerto() {
  const [modalAberto, setModalAberto] = useState(false);
  const [correcertos, setCorrecertos] = useState([]); // aqui vai o array do backend
  const [loading, setLoading] = useState(true); // ✅ Estado de loading
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";

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
    contato: v.contato || "",
    imagem: v.imagem || ""
  });

  // Busca as vagas baseado na região atual
  const carregarCorrecertos = useCallback(async () => {
    try {
      setLoading(true);
      console.log(`Buscando vagas para a região: ${regiao || 'Todas as regiões'}`);
      
      // Busca todas as vagas
      const response = await api.get("/vagas");
      const dados = Array.isArray(response.data) ? response.data : [];
      
      // Normaliza os dados das vagas
      const vagasNormalizadas = dados.map(mapVagaFromDTO);
      
      // Ordena por data de criação (mais recentes primeiro)
      const vagasOrdenadas = [...vagasNormalizadas].sort((a, b) => 
        new Date(b.dataHoraCriacao) - new Date(a.dataHoraCriacao)
      );
      
      // Filtra por região se necessário
      let vagasFiltradas = vagasOrdenadas;
      if (regiao) {
        vagasFiltradas = vagasOrdenadas.filter(vaga => 
          vaga.regiao && vaga.regiao.toLowerCase() === regiao.toLowerCase()
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
  
  // Atualiza quando a região mudar
  useEffect(() => {
    carregarCorrecertos();
  }, [carregarCorrecertos]);

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
      
      {/* Mensagem quando não há vagas */}
      {!loading && correcertos.length === 0 && (
        <div className="text-center py-20">
          <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
            <svg className="w-12 h-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M12 18h.01M12 15a3 3 0 100-6 3 3 0 000 6z"></path>
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-gray-900 mb-2">
            {regiao 
              ? `Nenhuma vaga encontrada em ${regiao}`
              : "Nenhuma vaga publicada ainda"}
          </h3>
          <p className="text-gray-600">
            {regiao 
              ? "Verifique se há vagas em outras regiões ou tente novamente mais tarde."
              : "Seja o primeiro a compartilhar uma vaga da sua região!"}
          </p>
        </div>
      )}
      
      {/* Passa o array do backend */}
      {(!loading && correcertos.length > 0) && (
        <SelecaoCorreCerto correcertos={correcertos} loading={loading} />
      )}
    </div>
  );
}
