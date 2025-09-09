import React, { useState, useEffect } from "react";
import { FaTimes } from "react-icons/fa";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import NoticiaService from "../../services/NoticiasService";
import { useNavigate } from "react-router-dom";

export default function ModalNoticia({
  modalAberto,
  setModalAberto,
  corPrincipal,
  atualizarNoticias, // função do parent para atualizar lista
}) {
  const [titulo, setTitulo] = useState("");
  const [texto, setTexto] = useState(""); // renomeado para texto
  const [local, setLocal] = useState("");
  const [imagem, setImagem] = useState(null);
  const [erroToast, setErroToast] = useState("");
  const maxLength = 60;
  const maxTexto = 120;

  const { regiao } = useRegiao();
  const corSecundaria = regionColors[regiao]?.[1] || "#3B82F6";
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = modalAberto ? "hidden" : "auto";
  }, [modalAberto]);

  const closeModal = () => {
    setModalAberto(false);
    setTitulo("");
    setTexto("");
    setLocal("");
    setImagem(null);
    setErroToast("");
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
  ];

  const handleSubmit = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      alert("Você precisa estar logado para criar uma notícia.");
      navigate("/");
      return;
    }

    const dto = {
      titulo,
      texto, // agora envia como texto
      zona: local,
    };

    const formData = new FormData();
    formData.append("dto", JSON.stringify(dto));
    if (imagem) formData.append("file", imagem);

    try {
      const novaNoticia = await NoticiaService.criarNoticia(formData);
      closeModal();
      if (atualizarNoticias) atualizarNoticias(novaNoticia); // adiciona na lista
    } catch (err) {
      setErroToast(
        "Erro ao criar notícia. Verifique os dados e tente novamente."
      );
      setTimeout(() => setErroToast(""), 3000);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-2"
      onClick={closeModal}
    >
      {modalAberto && (
        <div
          className="bg-white rounded-2xl w-full shadow-xl relative p-6"
          style={{
            border: `2px solid ${corPrincipal}`,
            maxWidth: "842px",
            maxHeight: "475px",
            overflowY: "auto",
          }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="absolute top-4 right-4">
            <button
              onClick={closeModal}
              className="text-2xl text-gray-600 hover:text-black"
            >
              <FaTimes />
            </button>
          </div>

          <h2 className="text-3xl font-bold text-black mb-4 font-poppins">
            Publicar notícia
          </h2>

          {erroToast && (
            <div className="absolute top-6 left-1/2 transform -translate-x-1/2 bg-red-500 text-white px-4 py-2 rounded shadow-lg">
              {erroToast}
            </div>
          )}

          <div className="flex gap-4 items-center">
            {/* Imagem */}
            <div className="flex-shrink-0 border border-dashed border-gray-400 rounded-lg w-[200px] h-[200px] flex flex-col items-center justify-center text-center text-gray-700 text-xs px-2 overflow-hidden">
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
                      src="/src/assets/gifs/upload.gif"
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
            <div className="flex-1 space-y-3 text-xs font-poppins">
              <div className="relative">
                <label className="text-gray-700 font-semibold block">
                  Título
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="título da notícia"
                  className="w-full border border-gray-400 rounded px-2 py-2"
                  maxLength={maxLength}
                />
              </div>

              <div className="relative">
                <label className="text-gray-700 font-semibold block">
                  Texto
                </label>
                <textarea
                  value={texto}
                  onChange={(e) => setTexto(e.target.value)}
                  placeholder="escreva a notícia..."
                  className="w-full border border-gray-400 rounded px-2 py-2 resize-none"
                  rows={2}
                  maxLength={maxTexto}
                ></textarea>
              </div>

              <div className="relative">
                <label className="text-gray-700 font-semibold block">
                  Zona
                </label>
                <select
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

              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="hover:bg-gray-700 text-white font-bold py-2 px-6 rounded shadow duration-300 hover:scale-105"
                  style={{ backgroundColor: corSecundaria }}
                >
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
