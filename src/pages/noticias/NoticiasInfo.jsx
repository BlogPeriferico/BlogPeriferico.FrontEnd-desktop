import React, { useEffect, useState } from "react";
import { useParams, useLocation, useNavigate } from "react-router-dom";
import NoticiaService from "../../services/NoticiasService";
import ComentariosService from "../../services/ComentariosService"; 
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
  const [comentarios, setComentarios] = useState([]);
  const [novoComentario, setNovoComentario] = useState("");
  const [comentLoading, setComentLoading] = useState(false);

  // Usuário mock caso não haja login
  const usuarioLogado = JSON.parse(localStorage.getItem("usuario")) || { id: 1, nome: "Teste" };

  // Carregar notícia e comentários
  useEffect(() => {
    window.scrollTo(0, 0);

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

    const carregarComentarios = async () => {
      try {
        const dados = await ComentariosService.listarComentariosNoticia(id);
        setComentarios(dados);
      } catch (err) {
        console.error("❌ Erro ao buscar comentários:", err);
        setComentarios([]);
      }
    };

    carregarComentarios();
  }, [id]);

  // Publicar comentário
  const handlePublicarComentario = async () => {
    if (!novoComentario.trim()) return;
    setComentLoading(true);

    try {
      const dto = {
        texto: novoComentario,
        idNoticia: Number(id),
        idUsuario: usuarioLogado.id,
      };

      const comentarioCriado = await ComentariosService.criarComentario(dto);

      if (!comentarioCriado.nomeUsuario) {
        comentarioCriado.nomeUsuario = usuarioLogado.nome;
        comentarioCriado.dataHoraCriacao = new Date().toISOString();
      }

      setComentarios(prev => [...prev, comentarioCriado]);
      setNovoComentario("");
    } catch (err) {
      console.error("❌ Erro ao publicar comentário:", err);
      alert("Erro ao publicar comentário, tente novamente.");
    } finally {
      setComentLoading(false);
    }
  };

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
        <button onClick={() => navigate(-1)} className="text-blue-600">Voltar</button>
        <p className="text-gray-600">Notícia não encontrada.</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-6 py-10 font-poppins mt-[80px]">
      {/* Parte superior */}
      <div className="flex flex-col lg:flex-row items-start gap-10 relative">
        <div className="relative">
          <img
            src={noticia.imagem}
            alt={noticia.titulo}
            className="w-full lg:w-[400px] h-auto rounded-xl object-cover"
          />
          <div className="absolute top-4 left-4">
            <img
              src={noticia.fotoAutor || "https://via.placeholder.com/65"}
              alt={noticia.autor}
              className="w-[65px] h-[65px] rounded-full object-cover"
              style={{ border: `2px solid ${corPrincipal}` }}
            />
          </div>
        </div>

        <div className="flex-1 w-full relative">
          <button
            onClick={() => navigate("/quebrada-informa")}
            className="absolute top-0 right-0 text-black text-2xl"
            title="Fechar"
          >
            <FaTimes />
          </button>

          <h1 className="text-[40px] font-semibold text-[#272727] leading-tight break-words">
            {noticia.titulo}
          </h1>

          {noticia.subtitulo && (
            <p className="text-[20px] text-gray-600 mt-2">{noticia.subtitulo}</p>
          )}

          <p className="text-[22px] text-[#4B4B4B] font-medium leading-relaxed mt-4 whitespace-pre-line">
            {noticia.conteudo}
          </p>
        </div>
      </div>

      {/* Comentários */}
      <div className="mt-10">
        <h2 className="text-xl font-semibold mb-4">Comentários</h2>

        <div className="flex flex-col lg:flex-row items-center gap-4 mb-8">
          <div className="flex items-center w-full lg:w-[70%] bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
            <input
              type="text"
              placeholder="Digite seu comentário aqui"
              value={novoComentario}
              onChange={(e) => setNovoComentario(e.target.value)}
              className="flex-grow px-4 py-3 outline-none text-sm"
            />
            <button
              onClick={handlePublicarComentario}
              disabled={comentLoading}
              className="text-white text-sm font-semibold rounded-[15px]"
              style={{
                backgroundColor: corPrincipal,
                padding: "6px 18px",
                marginRight: "10px",
                opacity: comentLoading ? 0.7 : 1,
              }}
            >
              {comentLoading ? "Publicando..." : "Publique"}
            </button>
          </div>
        </div>

        {comentarios.length === 0 ? (
          <p className="text-gray-500">Nenhum comentário ainda. Seja o primeiro!</p>
        ) : (
          comentarios.map((coment) => (
            <div
              key={coment.id}
              className="bg-gray-50 rounded-xl p-4 mb-4 shadow-sm border hover:shadow-md transition-shadow duration-200 relative"
            >
              <div className="flex items-center gap-3 mb-2">
                <img
                  src={coment.avatar || "https://via.placeholder.com/40"}
                  alt={coment.nomeUsuario || "Usuário"}
                  className="w-10 h-10 rounded-full object-cover border"
                />
                <div>
                  <p className="text-sm font-semibold text-gray-800">
                    {coment.nomeUsuario || "Usuário"}{" "}
                    <span className="font-normal text-gray-500 text-xs">
                      comentou em {coment.dataHoraCriacao || "agora"}
                    </span>
                  </p>
                </div>
                {coment.idUsuario === usuarioLogado.id && (
                  <button
                    onClick={async () => {
                      if (!window.confirm("Deseja excluir este comentário?")) return;
                      try {
                        await ComentariosService.excluirComentario(coment.id);
                        setComentarios(prev => prev.filter(c => c.id !== coment.id));
                      } catch (err) {
                        console.error("Erro ao deletar comentário:", err);
                        alert("Não foi possível excluir o comentário.");
                      }
                    }}
                    className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-sm"
                    title="Excluir comentário"
                  >
                    ✖
                  </button>
                )}
              </div>
              <div className="bg-white text-gray-800 rounded-md p-3 text-sm break-words">
                {coment.texto}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
