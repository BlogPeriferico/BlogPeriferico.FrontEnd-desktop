import React, { useState, useEffect, useRef } from "react";
import { FaTimes } from "react-icons/fa";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import AnuncioService from "../../services/AnuncioService";
import { useNavigate } from "react-router-dom";

export default function ModalProduto({
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

  const maxDescricao = 120;
  const maxLength = 60;

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

  // trava scroll do body quando o modal está aberto
  useEffect(() => {
    document.body.style.overflow = modalAberto ? "hidden" : "auto";
    return () => {
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
    setTelefone("");
    setLocal("");
    setDescricao("");
    setValor("");
    setImagem(null);
    setErroToast("");
    document.body.style.overflow = "auto";
  };

  const formatarTelefone = (valor) => {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    const parte1 = numeros.slice(0, 2);
    const parte2 = numeros.slice(2, 7);
    const parte3 = numeros.slice(7, 11);
    if (numeros.length === 0) return "";
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

  const handleKeyDown = (e) => {
    // ESC fecha o modal
    if (e.key === "Escape") {
      e.stopPropagation();
      closeModal();
      return;
    }

    // trap de foco com Tab
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
      valor: parseFloat(valor.replace(/\D/g, "")) / 100, // valor numérico
      telefone,
      zona: local,
      descricao,
    };

    const formData = new FormData();
    formData.append("dto", JSON.stringify(dto));
    if (imagem) formData.append("file", imagem);

    try {
      const novoAnuncio = await AnuncioService.criarAnuncio(formData);
      closeModal();

      // Atualiza a lista automaticamente
      if (atualizarAnuncios) {
        await atualizarAnuncios();
      }
    } catch (err) {
      console.error(err);
      setErroToast(
        "Erro ao criar anúncio. Verifique os dados e tente novamente."
      );
      setTimeout(() => setErroToast(""), 3000);
    }
  };

  if (!modalAberto) return null;

  const tituloId = "modal-produto-titulo";
  const descricaoId = "modal-produto-descricao";
  const imagemInputId = "modal-produto-imagem";
  const tituloInputId = "modal-produto-input-titulo";
  const descInputId = "modal-produto-input-descricao";
  const zonaSelectId = "modal-produto-select-zona";
  const telefoneInputId = "modal-produto-input-telefone";
  const precoInputId = "modal-produto-input-preco";

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
          maxHeight: "500px",
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
            aria-label="Fechar modal de anúncio de produto"
          >
            <FaTimes aria-hidden="true" />
          </button>
        </div>

        <h2
          id={tituloId}
          className="text-3xl font-bold text-black mb-4 font-poppins"
        >
          Anuncie seu produto
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
              aria-label="Selecionar imagem para o anúncio do produto"
            >
              {imagem ? (
                <img
                  src={URL.createObjectURL(imagem)}
                  alt="Pré-visualização da imagem selecionada para o produto"
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
                placeholder="nome do produto"
                className="w-full border border-gray-400 rounded px-2 py-2"
                maxLength={maxLength}
              />
            </div>

            <div className="relative">
              <label
                htmlFor={descInputId}
                className="text-gray-700 font-semibold block"
              >
                Descrição
              </label>
              <textarea
                id={descInputId}
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                placeholder="descreva o produto..."
                className="w-full border border-gray-400 rounded px-2 py-2 resize-none"
                rows={2}
                maxLength={maxDescricao}
              ></textarea>
            </div>

            <div className="relative">
              <label
                htmlFor={zonaSelectId}
                className="text-gray-700 font-semibold block"
              >
                Zona
              </label>
              <select
                id={zonaSelectId}
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                className="w-full border border-gray-400 rounded px-2 py-2"
              >
                <option value="" disabled>
                  Selecione uma zona
                </option>
                {zonas.map((zona, idx) => (
                  <option key={`${zona}-${idx}`} value={zona}>
                    {zona}
                  </option>
                ))}
              </select>
            </div>

            <div className="relative">
              <label
                htmlFor={telefoneInputId}
                className="text-gray-700 font-semibold block"
              >
                Telefone
              </label>
              <input
                id={telefoneInputId}
                type="tel"
                value={telefone}
                onChange={(e) => setTelefone(formatarTelefone(e.target.value))}
                placeholder="(11) 98765-4321"
                className="w-full border border-gray-400 rounded px-2 py-2"
              />
            </div>

            <div className="relative">
              <label
                htmlFor={precoInputId}
                className="text-gray-700 font-semibold block"
              >
                Preço
              </label>
              <input
                id={precoInputId}
                type="text"
                value={valor}
                onChange={(e) => setValor(formatarValor(e.target.value))}
                placeholder="R$ 199,99"
                className="w-full border border-gray-400 rounded px-2 py-2"
              />
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
