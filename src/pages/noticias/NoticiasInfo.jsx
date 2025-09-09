import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import NoticiaService from "../../services/NoticiasService";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import { FaTimes } from "react-icons/fa";

export default function NoticiasInfo() {
  const { id } = useParams();
  const location = useLocation();
  const navigate = useNavigate();
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";

  const [noticia, setNoticia] = useState(location.state || null);
  const [loading, setLoading] = useState(!location.state);

  useEffect(() => {
    window.scrollTo(0, 0);

    // Se não tiver estado passado pelo navigate, buscar do backend
    if (!noticia) {
      setLoading(true);
      NoticiaService.buscarNoticiaPorId(id)
        .then((data) => setNoticia(data))
        .catch((err) => {
          console.error("❌ Erro ao buscar notícia:", err);
          setNoticia(null);
        })
        .finally(() => setLoading(false));
    }
  }, [id, noticia]);

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6 mt-[80px]">
        <p className="text-gray-600">Carregando notícia...</p>
      </div>
    );
  }

  if (!noticia) {
    return (
      <div className="max-w-6xl mx-auto p-6 mt-[80px]">
        <button onClick={() => navigate(-1)} className="text-blue-600">
          Voltar
        </button>
        <p className="text-gray-600">Notícia não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-poppins mt-[80px]">
      {/* Parte superior */}
      <div className="flex flex-col lg:flex-row items-start gap-10 relative">
        {/* Imagem da notícia */}
        <div className="relative">
          <img
            src={noticia.imagem}
            alt={noticia.titulo}
            className="w-full lg:w-[400px] h-auto rounded-xl"
          />
          <div className="absolute top-4 left-4">
            <img
              src={noticia.fotoAutor || "https://www.instagram.com/_.vitinho07/p/Clfeu79OHED/"}
              alt={noticia.autor}
              className="w-[65px] h-[65px] rounded-full object-cover"
              style={{ border: `2px solid ${corPrincipal}` }}
            />
          </div>
        </div>

        {/* Conteúdo */}
        <div className="flex-1 w-full relative">
          {/* Botão de fechar */}
          <button
            onClick={() => navigate("/quebrada-informa")}
            className="absolute top-0 right-0 text-black text-2xl"
            title="Fechar"
          >
            <FaTimes />
          </button>

          {/* Título */}
          <h1 className="text-[40px] font-semibold text-[#272727] leading-tight break-words">
            {noticia.titulo}
          </h1>

          {/* Preço */}
          {noticia.preco && (
            <p className="text-[30px] font-semibold text-black mt-2">
              R$ {noticia.preco}
            </p>
          )}

          {/* Descrição */}
          <p className="text-[25px] text-[#4B4B4B] font-semibold leading-relaxed mt-4">
            {noticia.descricaoCompleta || noticia.resumo}
          </p>
        </div>
      </div>

      {/* Comentários + campo de novo comentário */}
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

          {noticia.telefone && (
            <a
              href={`https://wa.me/${noticia.telefone}`}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-green-500 hover:bg-green-600 text-white px-6 py-3 rounded-lg font-semibold flex items-center gap-2"
            >
              Contate o vendedor
            </a>
          )}
        </div>

        {noticia.comentarios?.map((coment, idx) => (
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
                    adicionou esse comentário às {coment.hora}
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
