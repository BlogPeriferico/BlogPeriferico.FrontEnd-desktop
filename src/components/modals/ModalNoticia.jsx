import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import NoticiaService from "../../services/NoticiasService";
import { useNavigate } from "react-router-dom";

// ✅ Importando o GIF do upload (Vite cuida do caminho no build)
import uploadGif from "../../assets/gifs/upload.gif";

export default function ModalNoticia({
  modalAberto,
  setModalAberto,
  corPrincipal,
  atualizarNoticias,
}) {
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState("");
  const [local, setLocal] = useState(""); // texto livre
  const [zona, setZona] = useState(""); // select enum
  const [imagem, setImagem] = useState(null);
  const [erroToast, setErroToast] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ✅ Agora título com até 120 caracteres
  const maxLength = 120;
  const maxTexto = 2000; // Aumentado para 2000 conforme solicitado

  const { regiao } = useRegiao();
  const corSecundaria = regionColors[regiao]?.[1] || "#3B82F6";
  const navigate = useNavigate();

  // ❌ Ajuste scroll no body
  useEffect(() => {
    document.body.style.overflow = modalAberto ? "hidden" : "auto";

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [modalAberto]);

  const closeModal = () => {
    setModalAberto(false);
    setTitulo("");
    setTexto("");
    setLocal("");
    setZona("");
    setImagem(null);
    setErroToast("");
    document.body.style.overflow = "auto";
  };

  const zonas = [
    "CENTRO",
    "LESTE",
    "NORTE",
    "SUL",
    "OESTE",
    "SUDESTE",
    "SUDOESTE",
    "NOROESTE",
    "NORDESTE",
  ];

  const handleSubmit = async () => {
    if (isSubmitting) return;

    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para criar uma notícia.");
      navigate("/");
      return;
    }

    setIsSubmitting(true);

    const dto = {
      titulo,
      texto,
      local,
      zona,
    };

    const formData = new FormData();
    formData.append("dto", JSON.stringify(dto));
    if (imagem) formData.append("file", imagem);

    try {
      const novaNoticia = await NoticiaService.criarNoticia(formData);
      closeModal();
      if (atualizarNoticias) atualizarNoticias(novaNoticia);
    } catch (err) {
      setErroToast(
        "Erro ao criar notícia. Verifique os dados e tente novamente."
      );
      setTimeout(() => setErroToast(""), 3000);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!modalAberto) {
    return null;
  }

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
          Publicar notícia
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
              htmlFor="imagem"
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
              id="imagem"
              accept="image/*"
              onChange={(e) => setImagem(e.target.files[0])}
              className="hidden"
            />
          </div>

          {/* Formulário */}
          <div className="flex-1 space-y-3 text-xs sm:text-sm font-poppins">
            <div className="relative">
              <label className="text-gray-700 font-semibold block">Título</label>
              <div>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="título da notícia"
                  className="w-full border border-gray-400 rounded px-2 py-2"
                  maxLength={maxLength}
                />
                <div className="flex justify-end text-[10px] sm:text-xs text-gray-500 mt-1">
                  {titulo.length}/{maxLength}
                </div>
              </div>
            </div>

            <div className="relative">
              <label className="text-gray-700 font-semibold block">Texto</label>
              <div>
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="escreva a notícia..."
                  className="
                    w-full border border-gray-400 rounded px-2 py-2 
                    resize-y 
                    min-h-[120px] sm:min-h-[150px]
                  "
                  rows={4}
                  maxLength={maxTexto}
                ></textarea>
                <div className="flex justify-end text-[10px] sm:text-xs text-gray-500 mt-1">
                  {texto.length}/{maxTexto}
                </div>
              </div>
            </div>

            {/* Local */}
            <div className="relative">
              <label className="text-gray-700 font-semibold block">Local</label>
              <input
                type="text"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder="Digite o local da notícia"
                className="w-full border border-gray-400 rounded px-2 py-2"
              />
            </div>

            {/* Zona */}
            <div className="relative">
              <label className="text-gray-700 font-semibold block">Zona</label>
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