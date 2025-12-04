import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import DoacaoService from "../../services/DoacaoService";
import { useNavigate } from "react-router-dom";

// ✅ GIF importado
import uploadGif from "../../assets/gifs/upload.gif";

export default function ModalDoacao({
  modalAberto,
  setModalAberto,
  corPrincipal,
  atualizarDoacoes,
}) {
  const [titulo, setTitulo] = useState("");
  const [categoria, setCategoria] = useState("");
  const [descricao, setDescricao] = useState("");
  const [zona, setZona] = useState("");
  const [telefone, setTelefone] = useState("");
  const [imagem, setImagem] = useState(null);
  const [erroToast, setErroToast] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxDescricao = 800;
  const maxLength = 120; // alinhado com ModalNoticia

  const { regiao } = useRegiao();
  const corSecundaria = regionColors[regiao]?.[1] || "#3B82F6";
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = modalAberto ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [modalAberto]);

  const closeModal = () => {
    setModalAberto(false);
    setTitulo("");
    setCategoria("");
    setDescricao("");
    setZona("");
    setTelefone("");
    setImagem(null);
    setErroToast("");
  };

  const categorias = [
    "Alimentos",
    "Roupas",
    "Brinquedos",
    "Livros",
    "Eletrônicos",
    "Outros",
  ];

  const zonas = [
    "CENTRO",
    "LESTE",
    "NORTE",
    "NORDESTE",
    "SUL",
    "OESTE",
    "SUDESTE",
    "SUDOESTE",
    "NOROESTE",
    "NORDESTE",

  ];

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    const parte1 = numeros.slice(0, 2);
    const parte2 = numeros.slice(2, 7);
    const parte3 = numeros.slice(7, 11);
    if (numeros.length <= 2) return `(${parte1}`;
    if (numeros.length <= 7) return `(${parte1}) ${parte2}`;
    return `(${parte1}) ${parte2}-${parte3}`;
  };

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para criar uma doação.");
      navigate("/");
      return;
    }

    setIsSubmitting(true);

    const dto = { titulo, descricao, categoria, zona, telefone };

    const formData = new FormData();
    formData.append("dto", JSON.stringify(dto));
    if (imagem) formData.append("file", imagem);

    try {
      const novaDoacao = await DoacaoService.criarDoacao(formData);
      closeModal();
      if (atualizarDoacoes) atualizarDoacoes(novaDoacao);
    } catch (err) {
      console.error(err);
      setErroToast(
        "Erro ao criar a doação. Verifique os dados e tente novamente."
      );
      setTimeout(() => setErroToast(""), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!modalAberto) return null;

  return (
    <div
      className="
        fixed inset-0 z-50 bg-black bg-opacity-50 
        flex items-center justify-center 
        p-3 sm:p-4
      "
      onClick={closeModal}
    >
      <div
        className="
          bg-white rounded-2xl w-full shadow-xl relative 
          p-4 sm:p-6 
          max-w-[900px]
          max-h-[90vh]
          overflow-y-auto
        "
        style={{
          border: `2px solid ${corPrincipal}`,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <button
            onClick={closeModal}
            className="text-xl sm:text-2xl text-gray-600 hover:text-black"
          >
            <FaTimes />
          </button>
        </div>

        <h2 className="text-2xl sm:text-3xl font-bold text-black mb-4 font-poppins mr-8">
          Anuncie sua doação
        </h2>

        {erroToast && (
          <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg text-xs sm:text-sm">
            {erroToast}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-start">
          {/* Imagem */}
          <div className="flex-shrink-0 border border-dashed border-gray-400 rounded-lg w-full md:w-[220px] h-[200px] flex flex-col items-center justify-center text-center text-gray-700 text-xs sm:text-sm px-2 overflow-hidden">
            <label
              htmlFor="imagem-doacao"
              className="cursor-pointer flex flex-col items-center justify-center h-full w-full"
            >
              {imagem ? (
                <img
                  src={URL.createObjectURL(imagem)}
                  alt="pré-visualização"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <>
                  <img
                    src={uploadGif}
                    alt="upload"
                    className="w-16 h-16 object-contain"
                  />
                  <p className="mt-2">
                    Coloque sua imagem
                    <br />
                    <strong style={{ color: corSecundaria }}>navegar</strong>
                  </p>
                </>
              )}
            </label>
            <input
              type="file"
              id="imagem-doacao"
              accept="image/*"
              onChange={(e) => setImagem(e.target.files[0])}
              className="hidden"
            />
          </div>

          {/* Formulário */}
          <div className="flex-1 space-y-3 text-xs sm:text-sm font-poppins">
            <div className="relative">
              <label className="text-gray-700 font-semibold block">
                Título
              </label>
              <div>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="Anuncie sua doação"
                  className="w-full border border-gray-400 rounded px-2 py-2"
                  maxLength={maxLength}
                />
                <div className="flex justify-end text-[10px] sm:text-xs text-gray-500 mt-1">
                  {titulo.length}/{maxLength}
                </div>
              </div>
            </div>

            <div className="relative">
              <label className="text-gray-700 font-semibold block">
                Descrição
              </label>
              <div>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="Descreva a doação"
                  className="
                    w-full border border-gray-400 rounded px-2 py-2 
                    resize-y 
                    min-h-[120px] sm:min-h-[150px]
                  "
                  rows={4}
                  maxLength={maxDescricao}
                ></textarea>
                <div className="flex justify-end text-[10px] sm:text-xs text-gray-500 mt-1">
                  {descricao.length}/{maxDescricao}
                </div>
              </div>
            </div>

            <div className="relative">
              <label className="text-gray-700 font-semibold block">
                Categoria
              </label>
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value)}
                className="w-full border border-gray-400 rounded px-2 py-2"
              >
                <option value="" disabled>
                  Selecione uma categoria
                </option>
                {categorias.map((cat, idx) => (
                  <option key={`${cat}-${idx}`} value={cat}>
                    {cat}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="text-gray-700 font-semibold block">
                Zona
              </label>
              <select
                value={zona}
                onChange={(e) => setZona(e.target.value)}
                className="w-full border border-gray-400 rounded px-2 py-2"
              >
                <option value="" disabled>
                  Selecione uma zona
                </option>
                {zonas.map((z, idx) => (
                  <option key={`${z}-${idx}`} value={z}>
                    {z}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label className="text-gray-700 font-semibold block">
                Telefone
              </label>
              <input
                type="text"
                value={telefone}
                onChange={(e) =>
                  setTelefone(formatarTelefone(e.target.value))
                }
                placeholder="(11) 98765-4321"
                className="w-full border border-gray-400 rounded px-2 py-2"
              />
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`
                  text-white font-bold py-2 px-6 rounded shadow duration-300 
                  ${isSubmitting ? "opacity-50 cursor-not-allowed" : "hover:scale-105"}
                `}
                style={{
                  backgroundColor: isSubmitting ? "#9CA3AF" : corSecundaria,
                }}
              >
                {isSubmitting ? "Publicando..." : "Publicar"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}