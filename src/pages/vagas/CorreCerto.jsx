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
    // Contatos normalizados: garante que `telefone` seja preenchido para a listagem
    telefone: v.telefone || v.contato || v.celular || v.whatsapp || "",
    contato: v.contato || v.telefone || "",
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

      {/* SelecaoCorreCerto sempre visível: título estático e conteúdo alterna entre spinner e grid */}
      <SelecaoCorreCerto correcertos={correcertos} loading={loading} />
    </div>
  );
}
