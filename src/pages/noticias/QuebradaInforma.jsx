// src/pages/News/QuebradaInforma.jsx
import React, {
  useEffect,
  useState,
  useCallback,
  Suspense,
  useMemo,
} from "react";
import axios from "axios";
import { useRegiao } from "../../contexts/RegionContext";
import { useUser } from "../../contexts/UserContext";
import { useNavigate, Link } from "react-router-dom";
import api from "../../services/Api";
import { regionColors } from "../../utils/regionColors";
import { FiPlus, FiRefreshCw } from "react-icons/fi";
import NoticiaService from "../../services/NoticiasService"; // se não usar, pode remover depois

const ModalNoticia = React.lazy(() =>
  import("../../components/modals/ModalNoticia")
);

const ModalVisitantesLazy = React.lazy(() =>
  import("../../components/modals/ModalVisitantes").then((m) => ({
    default: m.ModalVisitantes,
  }))
);

const API_KEY = "56fd2180ff9c0389b8ebc9c566b4d563";

const zonasClima = {
  Central: { bairro: "Sé", lat: -23.5505, lon: -46.6333 },
  Leste: { bairro: "Tatuapé", lat: -23.5407, lon: -46.5766 },
  Nordeste: { bairro: "Penha", lat: -23.5294, lon: -46.548 },
  Noroeste: { bairro: "Brasilândia", lat: -23.4565, lon: -46.6795 },
  Norte: { bairro: "Santana", lat: -23.5018, lon: -46.6246 },
  Oeste: { bairro: "Butantã", lat: -23.5673, lon: -46.7269 },
  Sudeste: { bairro: "Mooca", lat: -23.5542, lon: -46.5926 },
  Sudoeste: { bairro: "Vila Olímpia", lat: -23.5958, lon: -46.6845 },
  Sul: { bairro: "Santo Amaro", lat: -23.6486, lon: -46.7133 },
};

export default function QuebradaInforma() {
  // Clima
  const [dadosClima, setDadosClima] = useState({});
  const [ultimaAtualizacaoClima, setUltimaAtualizacaoClima] = useState(
    new Date()
  );

  // Modais / usuário
  const [modalAberto, setModalAberto] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Notícias
  const [todasNoticias, setTodasNoticias] = useState([]);
  const [loadingNoticias, setLoadingNoticias] = useState(true);
  const [paginaAtual, setPaginaAtual] = useState(1);
  const itensPorPagina = 5;

  const { user } = useUser();
  const navigate = useNavigate();
  const isVisitor = !user || user.isVisitor === true;

  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";
  const corSecundaria = regionColors[regiao]?.[1] || "#3B82F6";

  // ========== Helpers ==========

  const mapNoticiaFromDTO = useCallback((n) => {
    return {
      id: String(n.id),
      titulo: n.titulo || "",
      texto: n.texto || "",
      imagem: n.imagem || "",
      regiao: n.regiao || n.zona || n.local || "Centro",
      dataHoraCriacao: n.dataHoraCriacao || new Date().toISOString(),
      views: n.views || 0,
      comments: n.comments || 0,
    };
  }, []);

  // ========== Clima: fetch otimizado ==========

  const buscarClima = useCallback(async () => {
    try {
      const entries = Object.entries(zonasClima);

      const resultados = await Promise.all(
        entries.map(async ([nome, zona]) => {
          try {
            const res = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${zona.lat}&lon=${zona.lon}&appid=${API_KEY}&units=metric&lang=pt_br`
            );
            return [nome, res.data];
          } catch (err) {
            console.error(`Erro ao buscar clima de ${nome}:`, err);
            return [nome, null];
          }
        })
      );

      const novosDados = {};
      resultados.forEach(([nome, data]) => {
        if (data) novosDados[nome] = data;
      });

      setDadosClima(novosDados);
      setUltimaAtualizacaoClima(new Date());
    } catch (err) {
      console.error("Erro geral ao buscar clima:", err);
    }
  }, []);

  useEffect(() => {
    buscarClima();
    // Atualiza clima a cada 10 minutos
    const climaTimer = setInterval(buscarClima, 10 * 60 * 1000);
    return () => clearInterval(climaTimer);
  }, [buscarClima]);

  // ========== Notícias: fetch + filtro + paginação ==========

  const buscarNoticias = useCallback(async () => {
    try {
      setLoadingNoticias(true);

      const response = await api.get("/noticias");
      const dados = Array.isArray(response.data) ? response.data : [];

      const noticiasNormalizadas = dados.map(mapNoticiaFromDTO);

      const noticiasOrdenadas = [...noticiasNormalizadas].sort(
        (a, b) => new Date(b.dataHoraCriacao) - new Date(a.dataHoraCriacao)
      );

      let noticiasFiltradas = noticiasOrdenadas;
      if (regiao) {
        const regiaoFiltro =
          regiao.toLowerCase() === "central" ? "Centro" : regiao;
        noticiasFiltradas = noticiasOrdenadas.filter(
          (noticia) =>
            noticia.regiao &&
            noticia.regiao.toLowerCase() === regiaoFiltro.toLowerCase()
        );
      }

      setTodasNoticias(noticiasFiltradas);
      setPaginaAtual(1);
    } catch (err) {
      console.error("Erro ao buscar notícias:", err);
      setTodasNoticias([]);
    } finally {
      setLoadingNoticias(false);
    }
  }, [mapNoticiaFromDTO, regiao]);

  useEffect(() => {
    buscarNoticias();
  }, [buscarNoticias]);

  const totalPaginas = useMemo(
    () =>
      Math.max(1, Math.ceil(todasNoticias.length / itensPorPagina)),
    [todasNoticias.length, itensPorPagina]
  );

  const noticiasVisiveis = useMemo(
    () =>
      todasNoticias.slice(0, paginaAtual * itensPorPagina),
    [todasNoticias, paginaAtual, itensPorPagina]
  );

  useEffect(() => {
    if (paginaAtual > totalPaginas) {
      setPaginaAtual(1);
    }
  }, [paginaAtual, totalPaginas]);

  const carregarMais = () => {
    if (paginaAtual < totalPaginas) {
      setPaginaAtual((prev) => prev + 1);
    }
  };

  // ========== JSX ==========

  return (
    <main
      className="px-4 md:px-10 mt-24 max-w-[1600px] mx-auto relative"
      aria-labelledby="titulo-quebrada-informa"
    >
      {/* Botão flutuante de adicionar */}
      <div className="fixed top-28 right-6 z-50">
        <button
          onClick={() => {
            if (!isVisitor) {
              setModalAberto(true);
            } else {
              setShowAuthModal(true);
            }
          }}
          className="bg-[color:var(--corPrincipal)] text-white p-3 rounded-full shadow-lg hover:bg-opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          style={{ backgroundColor: corPrincipal }}
          title="Adicionar nova notícia"
          aria-label="Adicionar nova notícia"
          type="button"
        >
          <FiPlus size={24} aria-hidden="true" />
        </button>
      </div>

      {/* Modal de autenticação para visitantes (lazy) */}
      {showAuthModal && (
        <Suspense fallback={null}>
          <ModalVisitantesLazy
            abrir={showAuthModal}
            onClose={() => setShowAuthModal(false)}
            onLogin={() => {
              setShowAuthModal(false);
              setTimeout(() => {
                navigate("/login");
              }, 100);
            }}
          />
        </Suspense>
      )}

      {/* Modal de adicionar notícia (lazy, só se não for visitante) */}
      {!isVisitor && modalAberto && (
        <Suspense fallback={null}>
          <ModalNoticia
            modalAberto={modalAberto}
            setModalAberto={setModalAberto}
            corPrincipal={corPrincipal}
            atualizarNoticias={(novaNoticia) =>
              setTodasNoticias((prev) => [
                mapNoticiaFromDTO(novaNoticia),
                ...prev,
              ])
            }
          />
        </Suspense>
      )}

      {/* Área de clima */}
      <div className="flex flex-col lg:flex-row lg:gap-20 mb-24 items-start">
        <section
          className="relative border px-10 py-8 w-full lg:w-[45%] bg-white lg:mt-[125px]"
          style={{ borderColor: corSecundaria }}
          aria-label="Informações sobre as cores e zonas de clima"
        >
          <div className="absolute -top-3 left-0 flex h-3 w-full">
            <div className="w-3/6" />
            <div
              className="w-3/6"
              style={{ backgroundColor: corPrincipal }}
            />
            <div
              className="w-2/6"
              style={{ backgroundColor: corSecundaria }}
            />
          </div>
          <h2 className="text-2xl font-fraunces font-semibold mb-4">
            Área de Climatização
          </h2>
          <p className="text-gray-400 font-fraunces text-lg leading-tight mb-4">
            Nossas cores são <br />
            baseadas nas cores das <br />
            zonas da SpTrans
          </p>
          <button
            type="button"
            className="underline-offset-2 hover:underline text-sm font-medium"
            style={{ color: corSecundaria }}
          >
            Por que das cores?
          </button>
          <p className="mt-4 text-xs text-gray-500">
            Última atualização do clima:{" "}
            {ultimaAtualizacaoClima.toLocaleTimeString("pt-BR", {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </p>
        </section>

        <section
          className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full lg:w-[60%] mt-10"
          aria-label="Cartões de clima por zona de São Paulo"
        >
          {Object.entries(zonasClima).map(([nome, zona]) => {
            const clima = dadosClima[nome];
            const precipitacao = clima?.rain?.["1h"] ?? 10;
            const descricaoClima =
              clima?.weather?.[0]?.description ||
              `Condição do tempo em ${zona.bairro}`;

            return (
              <article
                key={nome}
                className="relative rounded-xl text-white p-4 shadow-md overflow-hidden h-[150px] flex flex-col justify-between transition-transform duration-300 hover:scale-105 cursor-default"
                style={{
                  backgroundImage:
                    `url(https://blogperic0.blob.core.windows.net/zonas/zona_${nome.toLowerCase()}.png)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                aria-label={`Clima na região ${nome}, bairro ${zona.bairro}`}
              >
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl" />
                <div className="relative z-10 text-xs space-y-0.5">
                  <p>Precipitação: {precipitacao}%</p>
                  <p>Umidade: {clima?.main?.humidity ?? "--"}%</p>
                  <p>
                    Vento:{" "}
                    {clima?.wind?.speed != null
                      ? `${clima.wind.speed} Km/h`
                      : "--"}
                  </p>
                </div>
                <div className="relative z-10 flex justify-between items-end">
                  <div className="flex items-center">
                    {clima && clima.weather?.[0]?.icon && (
                      <img
                        src={`https://openweathermap.org/img/wn/${clima.weather[0].icon}@2x.png`}
                        alt={descricaoClima}
                        className="w-10 h-10"
                        loading="lazy"
                      />
                    )}
                    <span className="text-xl ml-2 font-semibold">
                      {clima?.main?.temp != null
                        ? `${Math.round(clima.main.temp)}°C`
                        : "--°C"}
                    </span>
                  </div>
                  <div className="text-right text-[11px] sm:text-sm">
                    <p className="font-bold">
                      {nome}
                    </p>
                    <p>{zona.bairro}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      </div>

      {/* Notícias */}
      <div className="max-w-7xl mx-auto px-4">
          <div className="mb-16">
          {/* Cabeçalho com título e botão de atualizar */}
          <div className="relative">
            <div className="text-center mb-8">
              <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4 relative inline-block">
                Últimas Notícias
                <div
                  className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 w-24 h-1 rounded-full"
                  style={{ backgroundColor: corPrincipal }}
                />
              </h2>
              <p className="text-gray-600 text-lg max-w-2xl mx-auto">
                Fique por dentro das principais notícias e
                acontecimentos da sua região
              </p>
            </div>
            
            {/* Botão de atualizar - posicionado à direita em telas grandes */}
            <div className="absolute right-0 top-0 hidden md:block">
              <button
                onClick={buscarNoticias}
                disabled={loadingNoticias}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  loadingNoticias
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-500"
                    : "text-white hover:opacity-90"
                } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                title="Atualizar notícias"
                aria-label="Atualizar notícias"
                type="button"
                style={{ backgroundColor: loadingNoticias ? "" : corPrincipal }}
              >
                <FiRefreshCw
                  className={`w-5 h-5 ${
                    loadingNoticias ? "animate-spin" : ""
                  }`}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">
                  Atualizar
                </span>
              </button>
            </div>

            {/* Botão de atualizar - visível apenas em telas pequenas */}
            <div className="flex justify-center mt-6 mb-8 md:hidden">
              <button
                onClick={buscarNoticias}
                disabled={loadingNoticias}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg ${
                  loadingNoticias
                    ? "bg-gray-200 dark:bg-gray-700 text-gray-500"
                    : "text-white hover:opacity-90"
                } transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500`}
                title="Atualizar notícias"
                aria-label="Atualizar notícias"
                type="button"
                style={{ backgroundColor: loadingNoticias ? "" : corPrincipal }}
              >
                <FiRefreshCw
                  className={`w-5 h-5 ${
                    loadingNoticias ? "animate-spin" : ""
                  }`}
                  aria-hidden="true"
                />
                <span className="text-sm font-medium">
                  Atualizar
                </span>
              </button>
            </div>
          </div>

        {loadingNoticias ? (
          <div className="flex justify-center items-center py-20">
            <div
              className="animate-spin rounded-full h-12 w-12 border-b-2"
              style={{ borderColor: corPrincipal }}
            />
            <span className="ml-3 text-gray-600">
              Carregando notícias...
            </span>
          </div>
        ) : todasNoticias.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-24 h-24 mx-auto mb-6 bg-gray-100 rounded-full flex items-center justify-center">
              <svg
                className="w-12 h-12 text-gray-400"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              Nenhuma notícia publicada ainda
            </h3>
            <p className="text-gray-600">
              Seja o primeiro a compartilhar uma notícia da sua
              região!
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-8">
            {noticiasVisiveis.map((n, index) => (
              <Link
                to={`/noticia/${n.id}`}
                key={n.id}
                className="group block animate-slideInUp"
                style={{
                  animationDelay: `${index * 100}ms`,
                }}
              >
                <article className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-100 overflow-hidden hover:-translate-y-2">
                  {/* Imagem */}
                  <div className="relative h-48 overflow-hidden">
                    {n.imagem ? (
                      <img
                        src={n.imagem}
                        alt={n.titulo}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        onError={(e) => {
                          e.currentTarget.src =
                            "https://via.placeholder.com/400x200?text=Imagem+indispon%C3%ADvel";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center">
                        <svg
                          className="w-12 h-12 text-gray-400"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      </div>
                    )}

                    {/* Badge da Região */}
                    {n.regiao && (
                      <div className="absolute top-4 right-4">
                        <span
                          className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-white/90 backdrop-blur-sm text-gray-800 shadow-lg border border-gray-200"
                          style={{
                            backgroundColor: `${corPrincipal}20`,
                            color: corPrincipal,
                            borderColor: corPrincipal,
                          }}
                        >
                          {n.regiao}
                        </span>
                      </div>
                    )}

                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>

                  {/* Conteúdo */}
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-3">
                      <span className="text-sm text-gray-500 flex items-center gap-1">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                        {new Date(
                          n.dataHoraCriacao
                        ).toLocaleDateString("pt-BR")}
                      </span>
                      <span className="text-sm text-gray-500">
                        {new Date(n.dataHoraCriacao).toLocaleTimeString(
                          "pt-BR",
                          {
                            hour: "2-digit",
                            minute: "2-digit",
                          }
                        )}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2 transition-colors duration-200">
                      {n.titulo}
                    </h3>

                    <p className="text-gray-600 text-sm leading-relaxed line-clamp-3 mb-4">
                      {n.texto}
                    </p>

                    <div className="flex items-center justify-between pt-4 border-t border-gray-100">
                      <span className="text-xs text-gray-400 group-hover:text-gray-600 transition-colors cursor-pointer">
                        Ler mais →
                      </span>
                      <div className="flex items-center gap-1 text-xs text-gray-400">
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                          aria-hidden="true"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M17 8h2a2 2 0 012 2v6a2 2 0 01-2 2h-2v4l-4-4H9a1.994 1.994 0 01-1.414-.586m0 0L11 14h4a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2v4l.586-.586z"
                          />
                        </svg>
                        <span>Comentários</span>
                      </div>
                    </div>
                  </div>
                </article>
              </Link>
            ))}

            {/* Botão Carregar Mais */}
            {paginaAtual < totalPaginas && (
              <div className="col-span-full flex justify-center mt-10">
                <button
                  type="button"
                  onClick={carregarMais}
                  className="px-6 py-3 rounded-full text-white font-medium shadow-lg hover:shadow-xl transition-all duration-300 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  style={{ backgroundColor: corPrincipal }}
                >
                  Carregar mais notícias
                </button>
              </div>
            )}

            {/* Contador de notícias */}
            <div className="col-span-full text-center mt-6 text-sm text-gray-500">
              Mostrando {noticiasVisiveis.length} de{" "}
              {todasNoticias.length} notícias
              {regiao && ` na região ${regiao}`}
            </div>
          </div>
        )}
        </div>
      </div>
    </main>
  );
}
