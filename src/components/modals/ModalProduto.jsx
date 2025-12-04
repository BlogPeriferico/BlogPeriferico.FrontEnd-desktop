import React, { useState, useEffect, useMemo, useCallback } from "react";
import { FaTimes } from "react-icons/fa";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import AnuncioService from "../../services/AnuncioService";
import { useNavigate } from "react-router-dom";

// ✅ GIF importado (funciona no Vite em dev e build)
import uploadGif from "../../assets/gifs/upload.gif";

const MAX_DESCRICAO = 800; // Aumentado para 800 conforme solicitado
const MAX_TITULO = 120; // alinhado com ModalNoticia

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

const formatarValor = (valor) => {
  const numeros = valor.replace(/\D/g, "");
  const numeroFloat = parseFloat(numeros) / 100;
  if (isNaN(numeroFloat)) return "";
  return numeroFloat.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
};

function ModalProdutoBase({
  modalAberto,
  setModalAberto,
  corPrincipal,
  atualizarAnuncios,
}) {
  const [titulo, setTitulo] = useState("");
  const [telefone, setTelefone] = useState("");
  const [local, setLocal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [valor, setValor] = useState("");
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
    setValor("");
    setImagem(null);
    setErroToast("");
  }, [setModalAberto]);

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

  const handleSubmit = useCallback(
    async () => {
      if (isSubmitting) return;

      const token = localStorage.getItem("token");
      if (!token) {
        setErroToast("Você precisa estar logado para criar um anúncio.");
        navigate("/login");
        setTimeout(() => setErroToast(""), 3000);
        return;
      }

      if (!titulo || !valor || !telefone || !local || !descricao) {
        setErroToast("Preencha todos os campos obrigatórios.");
        setTimeout(() => setErroToast(""), 3000);
        return;
      }

      setIsSubmitting(true);

      const dto = {
        titulo,
        valor: parseFloat(valor.replace(/\D/g, "")) / 100,
        telefone,
        zona: local,
        descricao,
      };

      const formData = new FormData();
      formData.append("dto", JSON.stringify(dto));
      if (imagem) formData.append("file", imagem);

      try {
        await AnuncioService.criarAnuncio(formData);
        closeModal();
        if (atualizarAnuncios) {
          await atualizarAnuncios();
        }
      } catch (err) {
        console.error(err);
        setErroToast(
          "Erro ao criar anúncio. Verifique os dados e tente novamente."
        );
        setTimeout(() => setErroToast(""), 3000);
      } finally {
        setIsSubmitting(false);
      }
    },
    [
      isSubmitting,
      titulo,
      valor,
      telefone,
      local,
      descricao,
      imagem,
      navigate,
      atualizarAnuncios,
      closeModal,
    ]
  );

  if (!modalAberto) return null;

  return (
    <div
      className="
        fixed inset-0 z-50 bg-black bg-opacity-50 
        flex items-center justify-center 
        p-3 sm:p-4
      "
      onClick={closeModal}
      onKeyDown={handleKeyDown}
      tabIndex={-1}
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
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-produto-titulo"
        aria-describedby="modal-produto-descricao"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4">
          <button
            type="button"
            onClick={closeModal}
            className="text-xl sm:text-2xl text-gray-600 hover:text-black focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 rounded-full"
            aria-label="Fechar modal de anúncio de produto"
          >
            <FaTimes />
          </button>
        </div>

        <h2
          id="modal-produto-titulo"
          className="text-2xl sm:text-3xl font-bold text-black mb-2 font-poppins mr-8"
        >
          Anuncie seu produto
        </h2>
        <p
          id="modal-produto-descricao"
          className="text-xs sm:text-sm text-gray-600 mb-4 font-poppins"
        >
          Preencha os campos abaixo para divulgar seu produto para a comunidade.
        </p>

        {erroToast && (
          <div
            className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg text-xs sm:text-sm"
            role="alert"
            aria-live="assertive"
          >
            {erroToast}
          </div>
        )}

        <div className="flex flex-col md:flex-row gap-4 md:gap-6 md:items-start">
          {/* Imagem */}
          <div className="flex-shrink-0 border border-dashed border-gray-400 rounded-lg w-full md:w-[220px] h-[200px] flex flex-col items-center justify-center text-center text-gray-700 text-xs sm:text-sm px-2 overflow-hidden">
            <label
              htmlFor="imagem-produto"
              className="cursor-pointer flex flex-col items-center justify-center h-full w-full"
            >
              {previewUrl ? (
                <img
                  src={previewUrl}
                  alt="Pré-visualização da imagem do produto selecionado"
                  className="w-full h-full object-cover rounded-lg"
                  loading="lazy"
                />
              ) : (
                <>
                  <img
                    src={uploadGif}
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
              id="imagem-produto"
              accept="image/*"
              onChange={(e) => setImagem(e.target.files[0])}
              className="hidden"
            />
          </div>

          {/* Formulário */}
          <div className="flex-1 space-y-3 text-xs sm:text-sm font-poppins">
            <div className="relative">
              <label
                htmlFor="produto-titulo"
                className="text-gray-700 font-semibold block"
              >
                Título <span className="text-red-500">*</span>
              </label>
              <input
                id="produto-titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                placeholder="Nome do produto"
                className="w-full border border-gray-400 rounded px-2 py-2"
                maxLength={MAX_TITULO}
                required
              />
              <div className="flex justify-end mt-1 text-[10px] sm:text-xs text-gray-500">
                {titulo.length}/{MAX_TITULO}
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="produto-descricao"
                className="text-gray-700 font-semibold block"
              >
                Descrição <span className="text-red-500">*</span>
              </label>
              <textarea
                id="produto-descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="Descreva o produto..."
                className="
                  w-full border border-gray-400 rounded px-2 py-2 
                  resize-y 
                  min-h-[120px] sm:min-h-[150px]
                "
                rows={4}
                maxLength={MAX_DESCRICAO}
                required
              ></textarea>
              <div className="flex justify-end mt-1 text-[10px] sm:text-xs text-gray-500">
                {descricao.length}/{MAX_DESCRICAO}
              </div>
            </div>

            <div className="relative">
              <label
                htmlFor="produto-zona"
                className="text-gray-700 font-semibold block"
              >
                Zona <span className="text-red-500">*</span>
              </label>
              <select
                id="produto-zona"
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
                htmlFor="produto-telefone"
                className="text-gray-700 font-semibold block"
              >
                Telefone <span className="text-red-500">*</span>
              </label>
              <input
                id="produto-telefone"
                type="text"
                value={telefone}
                onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                placeholder="(11) 98765-4321"
                className="w-full border border-gray-400 rounded px-2 py-2"
                required
              />
            </div>

            <div className="relative">
              <label
                htmlFor="produto-preco"
                className="text-gray-700 font-semibold block"
              >
                Preço <span className="text-red-500">*</span>
              </label>
              <input
                id="produto-preco"
                type="text"
                value={valor}
                onChange={(e) => setValor(formatarValor(e.target.value))}
                placeholder="R$ 199,99"
                className="w-full border border-gray-400 rounded px-2 py-2"
                required
              />
            </div>

            <div className="flex justify-end pt-1">
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

const ModalProduto = React.memo(ModalProdutoBase);
export default ModalProduto;