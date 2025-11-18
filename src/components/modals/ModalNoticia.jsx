import React, { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import NoticiaService from "../../services/NoticiasService";
import { useNavigate } from "react-router-dom";

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

  const maxLength = 60;
  const maxTexto = 120;

  const { regiao } = useRegiao();
  const corSecundaria = regionColors[regiao]?.[1] || "#3B82F6";
  const navigate = useNavigate();

  const dialogRef = useRef(null);

  const zonas = [
    "CENTRO",
    "LESTE",
    "NORTE",
    "SUL",
    "OESTE",
    "SUDESTE",
    "SUDOESTE",
    "NOROESTE",
  ];

  // Ajuste scroll
  useEffect(() => {
    document.body.style.overflow = modalAberto ? "hidden" : "auto";

    return () => {
      // garante scroll mesmo se o modal for desmontado
      document.body.style.overflow = "auto";
    };
  }, [modalAberto]);

  // foco inicial dentro do modal
  useEffect(() => {
    if (modalAberto && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length) {
        focusable[0].focus();
      }
    }
  }, [modalAberto]);

  const closeModal = () => {
    setModalAberto(false);
    setTitulo("");
    setTexto("");
    setLocal("");
    setZona("");
    setImagem(null);
    setErroToast("");
    document.body.style.overflow = "auto"; // garante scroll de volta
  };

  const handleKeyDown = (e) => {
    // ESC fecha
    if (e.key === "Escape") {
      e.stopPropagation();
      closeModal();
      return;
    }

    // Trap de foco (Tab)
    if (e.key === "Tab" && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab normal
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para criar uma notícia.");
      navigate("/");
      return;
    }

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
    }
  };

  if (!modalAberto) return null;

  const tituloId = "modal-noticia-titulo";
  const descricaoId = "modal-noticia-descricao";
  const imagemInputId = "modal-noticia-imagem";
  const tituloInputId = "modal-noticia-input-titulo";
  const textoInputId = "modal-noticia-input-texto";
  const localInputId = "modal-noticia-input-local";
  const zonaSelectId = "modal-noticia-select-zona";

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-2"
      onClick={closeModal}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl w-full shadow-xl relative p-6"
        style={{
          border: `2px solid ${corPrincipal}`,
          maxWidth: "842px",
          maxHeight: "475px",
          overflowY: "auto",
        }}
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby={tituloId}
        aria-describedby={descricaoId}
        onKeyDown={handleKeyDown}
      >
        <div className="absolute top-4 right-4">
          <button
            type="button"
            onClick={closeModal}
            className="text-2xl text-gray-600 hover:text-black focus:outline-none focus:ring-2 focus:ring-offset-2"
            aria-label="Fechar modal de publicação de notícia"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        <h2
          id={tituloId}
          className="text-3xl font-bold text-black mb-4 font-poppins"
        >
          Publicar notícia
        </h2>

        {erroToast && (
          <div
            className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg"
            role="alert"
            aria-live="assertive"
          >
            {erroToast}
          </div>
        )}

        <div id={descricaoId} className="flex gap-4 items-center">
          {/* Imagem */}
          <div className="flex-shrink-0 border border-dashed border-gray-400 rounded-lg w-[200px] h-[200px] flex flex-col items-center justify-center text-center text-gray-700 text-xs px-2 overflow-hidden">
            <label
              htmlFor={imagemInputId}
              className="cursor-pointer flex flex-col items-center justify-center h-full w-full"
              aria-label="Selecionar imagem para a notícia"
            >
              {imagem ? (
                <img
                  src={URL.createObjectURL(imagem)}
                  alt="Pré-visualização da imagem selecionada para a notícia"
                  className="w-full h-full object-cover rounded-lg"
                />
              ) : (
                <>
                  <img
                    src="/src/assets/gifs/upload.gif"
                    alt="Ícone de upload"
                    className="w-16 h-16 object-contain"
                    loading="lazy"
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
              id={imagemInputId}
              accept="image/*"
              onChange={(e) => setImagem(e.target.files[0])}
              className="hidden"
            />
          </div>

          {/* Formulário */}
          <div className="flex-1 space-y-3 text-xs font-poppins">
            <div className="relative">
              <label
                htmlFor={tituloInputId}
                className="text-gray-700 font-semibold block"
              >
                Título
              </label>
              <input
                id={tituloInputId}
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="título da notícia"
                className="w-full border border-gray-400 rounded px-2 py-2"
                maxLength={maxLength}
              />
            </div>

            <div className="relative">
              <label
                htmlFor={textoInputId}
                className="text-gray-700 font-semibold block"
              >
                Texto
              </label>
              <textarea
                id={textoInputId}
                value={texto}
                onChange={(e) => setTexto(e.target.value)}
                placeholder="escreva a notícia..."
                className="w-full border border-gray-400 rounded px-2 py-2 resize-none"
                rows={2}
                maxLength={maxTexto}
              ></textarea>
            </div>

            {/* Local */}
            <div className="relative">
              <label
                htmlFor={localInputId}
                className="text-gray-700 font-semibold block"
              >
                Local
              </label>
              <input
                id={localInputId}
                type="text"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                placeholder="Digite o local da notícia"
                className="w-full border border-gray-400 rounded px-2 py-2"
              />
            </div>

            {/* Zona */}
            <div className="relative">
              <label
                htmlFor={zonaSelectId}
                className="text-gray-700 font-semibold block"
              >
                Zona
              </label>
              <select
                id={zonaSelectId}
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

            <div className="flex justify-end">
              <button
                type="button"
                onClick={handleSubmit}
                className="hover:bg-gray-700 text-white font-bold py-2 px-6 rounded shadow duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ backgroundColor: corSecundaria }}
              >
                Publicar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
