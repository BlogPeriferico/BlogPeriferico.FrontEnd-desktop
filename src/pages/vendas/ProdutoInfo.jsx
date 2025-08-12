import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import { FaTimes } from "react-icons/fa";
import { FiTrash } from "react-icons/fi";

export default function ProdutoInfo() {
  const { state: produto } = useLocation();
  const navigate = useNavigate();
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";

  const [confirmarExclusao, setConfirmarExclusao] = useState(false);

  useEffect(() => {
    console.log("Produto recebido:", produto);
    window.scrollTo(0, 0);
  }, [produto]);

  if (!produto) {
    return (
      <div className="max-w-6xl mx-auto p-6 mt-[80px]">
        <button onClick={() => navigate(-1)} className="text-blue-600">
          Voltar
        </button>
        <p className="text-gray-600">Produto não encontrado.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-poppins mt-[80px]">
      {/* Modal de confirmação */}
      {confirmarExclusao && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center px-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-lg text-center">
            <h2 className="text-xl font-semibold text-gray-800 mb-4">Confirmar exclusão</h2>
            <p className="text-gray-600 mb-6">Tem certeza que deseja excluir este produto?</p>
            <div className="flex justify-center gap-4">
              <button
                onClick={() => {
                  console.log("Excluindo produto:", produto);
                  setConfirmarExclusao(false);
                  navigate("/achadinhos");
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
              >
                Excluir
              </button>
              <button
                onClick={() => setConfirmarExclusao(false)}
                className="bg-gray-300 hover:bg-gray-400 text-gray-800 font-semibold py-2 px-4 rounded"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Parte superior */}
      <div className="flex flex-col lg:flex-row items-start gap-10 relative">
        {/* Imagem do produto */}
        <div className="relative">
          <img
            src={produto.imagem}
            alt={produto.titulo}
            className="w-full lg:w-[400px] h-auto rounded-xl object-cover"
          />
          {produto.fotoAutor && (
            <div className="absolute top-4 left-4">
              <img
                src={produto.fotoAutor}
                alt={produto.usuario || produto.autor}
                className="w-[65px] h-[65px] rounded-full object-cover"
                style={{ border: `2px solid ${corPrincipal}` }}
              />
            </div>
          )}
        </div>

        {/* Conteúdo */}
        <div className="flex-1 w-full relative">
          <div className="absolute top-0 right-0 flex items-center gap-3">
            <button
              onClick={() => setConfirmarExclusao(true)}
              className="text-red-600 hover:text-red-800 text-xl"
              title="Excluir produto"
            >
              <FiTrash />
            </button>
            <button
              onClick={() => navigate("/achadinhos")}
              className="text-black text-2xl"
              title="Fechar"
            >
              <FaTimes />
            </button>
          </div>

          <h1 className="text-[40px] font-semibold text-[#272727] leading-tight break-words">
            {produto.titulo}
          </h1>

          <p className="text-[30px] font-semibold text-black mt-2">
            R$ {produto.preco}
          </p>

          {(produto.descricaoCompleta || produto.descricao || produto.resumo) && (
            <p className="text-[25px] text-[#4B4B4B] font-semibold leading-relaxed mt-4">
              {produto.descricaoCompleta || produto.descricao || produto.resumo}
            </p>
          )}
        </div>
      </div>

      {/* Comentários + botão WhatsApp */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Comentários</h2>

        <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
          <div className="flex items-center w-full lg:w-[70%] bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <input
              type="text"
              placeholder="Digite seu comentário aqui"
              className="flex-grow px-4 py-3 outline-none text-sm"
            />
            <button className="px-3 text-gray-500 hover:text-gray-700">🔗</button>
            <button
              className="text-white text-sm font-semibold rounded-[15px]"
              style={{
                backgroundColor: corPrincipal,
                padding: "6px 18px",
                marginRight: "10px",
              }}
            >
              Publique
            </button>
          </div>

          {produto.telefone && (
            <a
              href={`https://wa.me/55${produto.telefone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-5 h-5"
                fill="currentColor"
                viewBox="0 0 24 24"
              >
                <path d="M20.52 3.48A11.94 11.94 0 0012.07 0C5.4 0 .07 5.37.07 12a11.87 11.87 0 001.6 6l-1.7 6.2 6.34-1.66a11.87 11.87 0 005.76 1.48H12c6.63 0 12-5.37 12-12 0-3.2-1.25-6.21-3.48-8.52zM12 22.07a9.89 9.89 0 01-5.06-1.37l-.36-.22-3.76.98.98-3.66-.23-.38a9.88 9.88 0 01-1.45-5.14c0-5.48 4.47-9.95 9.95-9.95 2.66 0 5.16 1.04 7.04 2.92A9.92 9.92 0 0122.07 12c0 5.49-4.47 9.95-9.95 9.95zm5.04-7.36c-.28-.14-1.64-.81-1.9-.9-.26-.1-.45-.14-.64.14-.19.28-.74.9-.9 1.08-.17.18-.33.21-.61.07-.28-.14-1.2-.44-2.29-1.4-.85-.76-1.42-1.7-1.58-1.98-.16-.28-.02-.43.12-.57.13-.13.28-.33.42-.5.14-.18.19-.28.29-.47.1-.19.05-.36-.02-.5-.07-.14-.64-1.53-.88-2.1-.23-.56-.46-.48-.63-.49H7.4c-.18 0-.47.07-.72.34-.25.27-.95.93-.95 2.28 0 1.34.98 2.64 1.11 2.82.14.18 1.93 2.95 4.69 4.14.65.28 1.15.45 1.54.58.65.21 1.24.18 1.71.11.52-.08 1.64-.67 1.87-1.31.23-.65.23-1.2.16-1.31-.07-.1-.26-.18-.55-.32z" />
              </svg>
              Contate o vendedor
            </a>
          )}
        </div>

        {/* Comentários simulados se existirem */}
        {produto.comentarios?.map((coment, idx) => (
          <div
            key={idx}
            className="bg-gray-50 rounded-lg p-4 mb-4 shadow-sm border"
          >
            <div className="flex items-center gap-3 mb-2">
              <img
                src={coment.avatar}
                alt={coment.nome}
                className="w-10 h-10 rounded-full object-cover"
              />
              <div>
                <p className="text-sm font-semibold text-gray-800">
                  {coment.nome}{" "}
                  <span className="font-normal text-gray-500">
                    comentou às {coment.hora}
                  </span>
                </p>
              </div>
            </div>
            <div className="bg-white text-gray-800 rounded-md p-3 text-sm">
              {coment.texto}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
