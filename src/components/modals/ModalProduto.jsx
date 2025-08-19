import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import { criarAnuncio } from "../../services/AnuncioService";

export default function ModalAdicionar({ modalAberto, setModalAberto }) {
  const [titulo, setTitulo] = useState("");
  const [valor, setValor] = useState("");
  const [telefone, setTelefone] = useState("");
  const [local, setLocal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagem, setImagem] = useState(null);

  const maxDescricao = 120;
  const maxLength = 60;

  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";
  const corSecundaria = regionColors[regiao]?.[1] || "#3B82F6";
  const navigate = useNavigate();

  useEffect(() => {
    document.body.style.overflow = modalAberto ? "hidden" : "auto";
  }, [modalAberto]);

  const handleImageChange = (e) => setImagem(e.target.files[0]);

  const closeModal = () => {
    setModalAberto(false);
    navigate("/achadinhos");
    limparCampos();
  };

  const limparCampos = () => {
    setTitulo("");
    setValor("");
    setTelefone("");
    setLocal("");
    setDescricao("");
    setImagem(null);
  };

  const handleSubmit = async () => {
    if (!titulo || !valor || !telefone || !local || !descricao) {
      alert("Por favor, preencha todos os campos.");
      return;
    }

    try {
      const formData = new FormData();
      formData.append("titulo", titulo);

      const precoNum = parseFloat(valor.replace(/\D/g, "")) / 100;
      formData.append("preco", precoNum);
      formData.append("telefone", telefone);
      formData.append("regiao", local);
      formData.append("descricaoCompleta", descricao);
      if (imagem) formData.append("imagem", imagem);

      formData.append("autor", "Usuário Logado");

      await criarAnuncio(formData);

      alert("Anúncio criado com sucesso!");
      closeModal();
    } catch (error) {
      console.error(error);
      alert("Erro ao criar anúncio. Tente novamente.");
    }
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

  const handleTelefoneChange = (e) => {
    const valorFormatado = formatarTelefone(e.target.value);
    setTelefone(valorFormatado);
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

  const handleValorChange = (e) => {
    setValor(formatarValor(e.target.value));
  };

  const zonas = [
    "Centro",
    "Leste",
    "Norte",
    "Sul",
    "Oeste",
    "Sudeste",
    "Sudoeste",
    "Noroeste",
    "Nordeste",
  ];

  return (
    <div
      className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-2"
      onClick={closeModal} // Fecha ao clicar fora
    >
      {modalAberto && (
        <div
          className="bg-white rounded-2xl w-full shadow-xl relative p-6"
          style={{
            border: `2px solid ${corPrincipal}`,
            maxWidth: "842px",
            maxHeight: "475px",
            overflowY: "hidden",
          }}
          onClick={(e) => e.stopPropagation()} // Evita fechar ao clicar dentro
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
            Anuncie seu produto
          </h2>

          <div className="flex gap-4 items-center">
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
                onChange={handleImageChange}
                className="hidden"
              />
            </div>

            <form className="flex-1 space-y-3 text-xs font-poppins">
              <div className="relative">
                <label className="text-gray-700 font-semibold block">
                  Título
                </label>
                <input
                  type="text"
                  value={titulo}
                  onChange={(e) => setTitulo(e.target.value)}
                  placeholder="escreva o nome do produto"
                  className="w-full border border-gray-400 rounded px-2 py-2"
                  maxLength={maxLength}
                />
                {titulo.length > 0 && (
                  <div className="absolute right-2 bottom-1 text-gray-400 text-[10px]">
                    {maxLength - titulo.length}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="text-gray-700 font-semibold block">
                  Descrição
                </label>
                <textarea
                  value={descricao}
                  onChange={(e) => setDescricao(e.target.value)}
                  placeholder="descreva o produto a venda..."
                  className="w-full border border-gray-400 rounded px-2 py-2 resize-none"
                  rows={2}
                  maxLength={maxDescricao}
                ></textarea>
                {descricao.length > 0 && (
                  <div className="absolute right-2 bottom-1 text-gray-400 text-[10px]">
                    {maxDescricao - descricao.length}
                  </div>
                )}
              </div>

              <div className="relative">
                <label className="text-gray-700 font-semibold block">
                  Preço
                </label>
                <input
                  type="text"
                  value={valor}
                  onChange={handleValorChange}
                  placeholder="R$199,99"
                  className="w-full border border-gray-400 rounded px-2 py-2"
                />
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
                    <option key={idx} value={zona}>
                      {zona}
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
                  onChange={handleTelefoneChange}
                  placeholder="(11) 98765-4321"
                  className="w-full border border-gray-400 rounded px-2 py-2"
                />
                {telefone.length > 0 && (
                  <div className="absolute right-2 bottom-1 text-gray-400 text-[10px]">
                    {11 - telefone.replace(/\D/g, "").length} dígitos restantes
                  </div>
                )}
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
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
