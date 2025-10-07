import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import AnuncioService from "../../services/AnuncioService";
import { useNavigate } from "react-router-dom";

export default function ModalProduto({ modalAberto, setModalAberto, corPrincipal, atualizarAnuncios }) {
  const [titulo, setTitulo] = useState("");
  const [telefone, setTelefone] = useState("");
  const [local, setLocal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
  const [imagem, setImagem] = useState(null);
  const [erroToast, setErroToast] = useState("");
  const maxDescricao = 120;
  const maxLength = 60;

  const { regiao } = useRegiao();
  const corSecundaria = regionColors[regiao]?.[1] || "#3B82F6";
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = modalAberto ? "hidden" : "auto";
  }, [modalAberto]);

  const closeModal = () => {
    setModalAberto(false);
    setTitulo("");
    setTelefone("");
    setLocal("");
    setDescricao("");
    setValor("");
    setImagem(null);
    setErroToast("");
  };

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    const parte1 = numeros.slice(0, 2);
    const parte2 = numeros.slice(2, 7);
    const parte3 = numeros.slice(7, 11);
    if (numeros.length <= 2) return `(${parte1}`;
    if (numeros.length <= 7) return `(${parte1}) ${parte2}`;
    return `(${parte1}) ${parte2}-${parte3}`;
  };

  const formatarValor = (valor) => {
    const numeros = valor.replace(/\D/g, "");
    const numeroFloat = parseFloat(numeros) / 100;
    if (isNaN(numeroFloat)) return "";
    return numeroFloat.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para criar um anúncio.");
      navigate("/login");
      return;
    }

    if (!titulo || !valor || !telefone || !local || !descricao) {
      alert("Preencha todos os campos.");
      return;
    }

    const dto = {
      titulo,
      valor: parseFloat(valor.replace(/\D/g, "")) / 100, // ✅ CORRIGIDO: valor (não preco)
      telefone,
      zona: local, // ✅ CORRIGIDO: zona (não regiao)
      descricao: descricao, // ✅ CORRIGIDO: descricao (não descricaoCompleta)
    };

    const formData = new FormData();
    formData.append("dto", JSON.stringify(dto));
    if (imagem) formData.append("file", imagem);

    try {
      const novoAnuncio = await AnuncioService.criarAnuncio(formData);
      closeModal();

      // Atualiza a lista automaticamente
      if (atualizarAnuncios) {
        await atualizarAnuncios(); // chama a função da page
      }
    } catch (err) {
      console.error(err);
      setErroToast("Erro ao criar anúncio. Verifique os dados e tente novamente.");
      setTimeout(() => setErroToast(""), 3000);
    }
  };

  const zonas = ["CENTRO", "LESTE", "NORTE", "SUL", "OESTE", "SUDESTE", "SUDOESTE", "NOROESTE"];

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-2" onClick={closeModal}>
      {modalAberto && (
        <div
          className="bg-white rounded-2xl w-full shadow-xl relative p-6"
          style={{ border: `2px solid ${corPrincipal}`, maxWidth: "842px", maxHeight: "500px", overflowY: "auto" }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-4 right-4">
            <button onClick={closeModal} className="text-2xl text-gray-600 hover:text-black">
              <FaTimes />
            </button>
          </div>

          <h2 className="text-3xl font-bold text-black mb-4 font-poppins">Anuncie seu produto</h2>

          {erroToast && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
              {erroToast}
            </div>
          )}

          <div className="flex gap-4 items-center">
            {/* Imagem */}
            <div className="flex-shrink-0 border border-dashed border-gray-400 rounded-lg w-[200px] h-[200px] flex flex-col items-center justify-center text-center text-gray-700 text-xs px-2 overflow-hidden">
              <label htmlFor="imagem" className="cursor-pointer flex flex-col items-center justify-center h-full w-full">
                {imagem ? (
                  <img src={URL.createObjectURL(imagem)} alt="pré-visualização" className="w-full h-full object-cover rounded-lg" />
                ) : (
                  <>
                    <img src="/src/assets/gifs/upload.gif" alt="upload" className="w-16 h-16 object-contain" />
                    <p className="mt-2">
                      Coloque sua imagem
                      <br />
                      <strong style={{ color: corSecundaria }}>navegar</strong>
                    </p>
                  </>
                )}
              </label>
              <input type="file" id="imagem" accept="image/*" onChange={(e) => setImagem(e.target.files[0])} className="hidden" />
            </div>

            {/* Formulário */}
            <div className="flex-1 space-y-3 text-xs font-poppins">
              <div className="relative">
                <label className="text-gray-700 font-semibold block">Título</label>
                <input type="text" value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="nome do produto" className="w-full border border-gray-400 rounded px-2 py-2" maxLength={maxLength} />
              </div>

              <div className="relative">
                <label className="text-gray-700 font-semibold block">Descrição</label>
                <textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} placeholder="descreva o produto..." className="w-full border border-gray-400 rounded px-2 py-2 resize-none" rows={2} maxLength={maxDescricao}></textarea>
              </div>

              <div className="relative">
                <label className="text-gray-700 font-semibold block">Zona</label>
                <select value={local} onChange={(e) => setLocal(e.target.value)} className="w-full border border-gray-400 rounded px-2 py-2">
                  <option value="" disabled>Selecione uma zona</option>
                  {zonas.map((zona, idx) => (
                    <option key={`${zona}-${idx}`} value={zona}>{zona}</option>
                  ))}
                </select>
              </div>

              <div className="relative">
                <label className="text-gray-700 font-semibold block">Telefone</label>
                <input type="text" value={telefone} onChange={(e) => setTelefone(formatarTelefone(e.target.value))} placeholder="(11) 98765-4321" className="w-full border border-gray-400 rounded px-2 py-2" />
              </div>

              <div className="relative">
                <label className="text-gray-700 font-semibold block">Preço</label>
                <input type="text" value={valor} onChange={(e) => setValor(formatarValor(e.target.value))} placeholder="R$ 199,99" className="w-full border border-gray-400 rounded px-2 py-2" />
              </div>

              <div className="flex justify-end">
                <button type="button" onClick={handleSubmit} className="hover:bg-gray-700 text-white font-bold py-2 px-6 rounded shadow duration-300 hover:scale-105" style={{ backgroundColor: corSecundaria }}>
                  Publicar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
