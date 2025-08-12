import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes } from "react-icons/fa";
import { useRegiao } from "../../contexts/RegionContext"; // Para aplicar a cor da região
import { regionColors } from "../../utils/regionColors";
import "./ModalNoticia.css";

export default function ModalAdicionar({ modalAberto, setModalAberto }) {
  const [titulo, setTitulo] = useState("");
  const [valor, setValor] = useState("");
  const [telefone, setTelefone] = useState("");
  const [local, setLocal] = useState("");
  const [descricao, setDescricao] = useState("");
  const [imagem, setImagem] = useState(null);

  const { regiao } = useRegiao();
  const corSecundaria = regionColors[regiao]?.[1] || "#3B82F6"; // cor secundária para bordas

  const navigate = useNavigate();

  // Bloquear o scroll da página ao abrir o modal
  useEffect(() => {
    if (modalAberto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [modalAberto]);

  const handleImageChange = (e) => {
    setImagem(e.target.files[0]);
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

  const closeModal = () => {
    setModalAberto(false); // Fecha o modal
    navigate("/quebrada-informa"); // Navega de volta para a página QuebradaInforma
  };

  // Função para formatar telefone no padrão (11) 99999-9999
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
  
  const handleSubmit = () => {
    // Aqui você pode adicionar a lógica para enviar os dados para o servidor ou contexto
    console.log({
      titulo,
      valor,
      telefone,
      local,
      descricao,
      imagem,
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-50 flex justify-center items-center px-4">
      {modalAberto && (
        <div
          className="bg-white p-6 rounded-2xl w-full max-w-[70vw] shadow-xl relative scrollbar-hide"
          style={{
            border: `2px solid ${corSecundaria}`,
            maxHeight: "70vh",
            overflowY: "auto",
          }}
        >
          {/* Botão de fechar */}
          <div className="sticky top-0 flex justify-end bg-white p-2 z-50 ">
            <button
              onClick={closeModal}
              className="text-xl text-gray-500 hover:text-gray-800"
            >
              <FaTimes />
            </button>
          </div>

          {/* Título do Modal */}
          <h2 className="text-2xl font-semibold text-gray-800 mb-6">
            Adicionar nova postagem
          </h2>

          {/* Campos de formulário */}
          <form className="space-y-6" onSubmit={(e) => e.preventDefault()}>
            {/* Título */}
            <div className="flex flex-col">
              <label htmlFor="titulo" className="text-sm text-gray-600 mb-2">
                Digite o título de sua postagem...
              </label>
              <input
                id="titulo"
                type="text"
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Exemplo: Nintendo Switch usado"
              />
            </div>

            {/* Valor */}
            <div className="flex flex-col">
              <label htmlFor="valor" className="text-sm text-gray-600 mb-2">
                Digite o valor do item que você vai vender...
              </label>
              <input
                id="valor"
                type="text"
                value={valor}
                onChange={handleValorChange}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Exemplo: R$ 789,50"
              />
            </div>

            {/* Telefone */}
            <div className="flex flex-col">
              <label htmlFor="telefone" className="text-sm text-gray-600 mb-2">
                Digite seu número de telefone...
              </label>
              <input
                id="telefone"
                type="text"
                value={telefone}
                onChange={handleTelefoneChange}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Exemplo: (11) 99999-9999"
              />
            </div>

            {/* Local de venda */}
            <div className="flex flex-col">
              <label htmlFor="local" className="text-sm text-gray-600 mb-2">
                Digite o local onde o produto está sendo vendido...
              </label>
              <input
                id="local"
                type="text"
                value={local}
                onChange={(e) => setLocal(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Exemplo: São Paulo, SP"
              />
            </div>

            {/* Descrição */}
            <div className="flex flex-col">
              <label htmlFor="descricao" className="text-sm text-gray-600 mb-2">
                Digite uma pequena descrição sobre o produto...
              </label>
              <textarea
                id="descricao"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Exemplo: Produto novo, com garantia."
              />
            </div>

            {/* Upload de imagem */}
            <div className="flex flex-col">
              <label className="text-sm text-gray-600 mb-2">
                Faça o upload de uma imagem
              </label>
              <input
                type="file"
                onChange={handleImageChange}
                className="p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Botão para enviar */}
            <div className="flex justify-between items-center mt-4">
              <button
                type="button"
                onClick={handleSubmit}
                className="bg-orange-500 hover:bg-orange-600 text-white font-semibold text-sm py-2 px-6 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 duration-300 hover:scale-105"
                style={{
                  borderRadius: "8px",
                  padding: "12px 20px",
                  backgroundColor: corSecundaria,
                }}
              >
                Publicar
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
