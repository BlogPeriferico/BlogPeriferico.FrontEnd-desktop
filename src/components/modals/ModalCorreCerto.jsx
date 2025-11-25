import React, { useState, useEffect, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import CorreCertoService from "../../services/CorreCertoService";

const MAX_DESCRICAO = 120;
const MAX_TITULO = 60;

const ZONAS = [
  "CENTRO",
  "LESTE",
  "NORTE",
  "NORDESTE",
  "SUL",
  "OESTE",
  "SUDESTE",
  "SUDOESTE",
  "NOROESTE",
];

// função fora do componente (não recria a cada render)
const formatarTelefone = (valor) => {
  const numeros = valor.replace(/\D/g, "").slice(0, 11);
  const parte1 = numeros.slice(0, 2);
  const parte2 = numeros.slice(2, 7);
  const parte3 = numeros.slice(7, 11);
  if (numeros.length <= 2) return `(${parte1}`;
  if (numeros.length <= 7) return `(${parte1}) ${parte2}`;
  return `(${parte1}) ${parte2}-${parte3}`;
};

function ModalCorreCertoBase({
  modalAberto,
  setModalAberto,
  corPrincipal,
  atualizarCorrecertos,
}) {
  const [titulo, setTitulo] = useState("");
  const [telefone, setTelefone] = useState("");
  const [local, setLocal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagem, setImagem] = useState(null);
  const [erroToast, setErroToast] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const { regiao } = useRegiao();
  const corSecundaria = regionColors[regiao]?.[1] || "#3B82F6";
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = modalAberto ? "hidden" : "auto";
    return () => {
      document.body.style.overflow = "auto";
    };
  }, [modalAberto]);

  const closeModal = useCallback(() => {
    setModalAberto(false);
    setTitulo("");
    setTelefone("");
    setLocal("");
    setDescricao("");
    setImagem(null);
    setErroToast("");
  }, [setModalAberto]);

  const handleTelefoneChange = useCallback((e) => {
    setTelefone(formatarTelefone(e.target.value));
  }, []);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        closeModal();
      }
    },
    [closeModal]
  );

  const previewUrl = useMemo(
    () => (imagem ? URL.createObjectURL(imagem) : null),
    [imagem]
  );

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  const handleSubmit = useCallback(async () => {
    if (isSubmitting) return;

    const token = localStorage.getItem("token");
    if (!token) {
      setErroToast("Você precisa estar logado para criar uma vaga.");
      navigate("/");
      setTimeout(() => setErroToast(""), 3000);
      return;
    }

    if (!titulo || !descricao || !telefone || !local) {
      setErroToast("Preencha todos os campos obrigatórios antes de publicar.");
      setTimeout(() => setErroToast(""), 3000);
      return;
    }

    setIsSubmitting(true);

    const dto = { titulo, descricao, telefone, zona: local };
    const formData = new FormData();
    formData.append("dto", JSON.stringify(dto));
    if (imagem) formData.append("file", imagem);

    try {
      await CorreCertoService.criarCorrecerto(formData);
      closeModal();
      if (atualizarCorrecertos) atualizarCorrecertos();
    } catch (err) {
      console.error(err);
      setErroToast(
        "Erro ao criar a vaga. Verifique os dados e tente novamente."
      );
      setTimeout(() => setErroToast(""), 3000);
    } finally {
      setIsSubmitting(false);
    }
  }, [
    isSubmitting,
    titulo,
    descricao,
    telefone,
    local,
    imagem,
    closeModal,
    atualizarCorrecertos,
    navigate,
  ]);

  if (!modalAberto) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-2"
      onClick={closeModal}
    >
      <div
        className="bg-white rounded-2xl w-full shadow-xl relative p-6"
        style={{
          border: `2px solid ${corPrincipal}`,
          maxWidth: "842px",
          maxHeight: "475px",
          overflowY: "auto",
        }}
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-corre-titulo"
        aria-describedby="modal-corre-descricao"
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
      >
        <div className="absolute top-4 right-4">
          <button
            type="button"
            onClick={closeModal}
            className="text-2xl text-gray-600 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-full"
            aria-label="Fechar modal de criação de vaga"
          >
            <FaTimes />
          </button>
        </div>

        <h2
          id="modal-corre-titulo"
          className="text-3xl font-bold text-black mb-2 font-poppins"
        >
          Anuncie sua vaga
        </h2>
        <p
          id="modal-corre-descricao"
          className="text-sm text-gray-600 mb-4 font-poppins"
        >
          Preencha os campos abaixo para divulgar seu corre na quebrada.
        </p>

        {erroToast && (
          <div
            className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg text-sm"
            role="alert"
            aria-live="assertive"
          >
            {erroToast}
          </div>
        )}

        <div className="flex gap-4 items-center mt-2">
          {/* Imagem */}
          <div className="flex-shrink-0 border border-dashed border-gray-400 rounded-lg w-[200px] h-[200px] flex flex-col items-center justify-center text-center text-gray-700 text-xs px-2 overflow-hidden">
            <label
              htmlFor="imagem-correcerto"
              className="cursor-pointer flex flex-col items-center justify-center h-full w-full"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Pré-visualização da imagem selecionada"
                  className="w-full h-full object-cover rounded-lg"
                  loading="lazy"
                />
              ) : (
                <>
                  <img
                    src="/src/assets/gifs/upload.gif"
                    alt="Ícone de upload de imagem"
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
              id="imagem-correcerto"
              accept="image/*"
              onChange={(e) => setImagem(e.target.files[0])}
              className="hidden"
            />
          </div>

          {/* Formulário */}
          <div className="flex-1 space-y-3 text-xs font-poppins">
            <div className="relative">
              <label
                htmlFor="corre-titulo"
                className="text-gray-700 font-semibold block"
              >
                Título <span className="text-red-500">*</span>
              </label>
              <input
                id="corre-titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Anuncie sua vaga"
                className="w-full border border-gray-400 rounded px-2 py-2"
                maxLength={MAX_TITULO}
                required
              />
              <div className="flex justify-end mt-1 text-[10px] text-gray-500">
                {titulo.length}/{MAX_TITULO} caracteres
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="corre-descricao"
                className="text-gray-700 font-semibold block"
              >
                Descrição <span className="text-red-500">*</span>
              </label>
              <textarea
                id="corre-descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva a vaga"
                className="w-full border border-gray-400 rounded px-2 py-2 resize-none"
                rows={2}
                maxLength={MAX_DESCRICAO}
                required
                aria-describedby="corre-descricao-help"
              ></textarea>
              <div className="flex justify-between mt-1 text-[10px] text-gray-500">
                <span id="corre-descricao-help">
                  Máximo de {MAX_DESCRICAO} caracteres.
                </span>
                <span>
                  {descricao.length}/{MAX_DESCRICAO}
                </span>
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="corre-zona"
                className="text-gray-700 font-semibold block"
              >
                Zona <span className="text-red-500">*</span>
              </label>
              <select
                id="corre-zona"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                className="w-full border border-gray-400 rounded px-2 py-2"
                required
              >
                <option value="" disabled>
                  Selecione uma zona
                </option>
                {ZONAS.map((zona) => (
                  <option key={zona} value={zona}>
                    {zona}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label
                htmlFor="corre-telefone"
                className="text-gray-700 font-semibold block"
              >
                Telefone <span className="text-red-500">*</span>
              </label>
              <input
                id="corre-telefone"
                type="text"
                value={telefone}
                onChange={handleTelefoneChange}
                placeholder="(11) 98765-4321"
                className="w-full border border-gray-400 rounded px-2 py-2"
                required
              />
            </div>

            <div className="flex justify-end pt-1">
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className={`hover:bg-gray-700 text-white font-bold py-2 px-6 rounded shadow duration-300 ${
                  isSubmitting
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:scale-105"
                }`}
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

const ModalCorreCerto = React.memo(ModalCorreCertoBase);
export default ModalCorreCerto;
