import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import { Link } from "react-router-dom";
import { FiPlus } from "react-icons/fi";
import { noticias } from "../../data/NoticiasData";
import ModalNoticia from "../../components/modals/ModalNoticia"; // Importando o Modal

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
  const [dados, setDados] = useState({});
  const [horaAtual, setHoraAtual] = useState(new Date());
  const [modalAberto, setModalAberto] = useState(false); // Controle do modal de adicionar

  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";
  const corSecundaria = regionColors[regiao]?.[1] || "#3B82F6";

  const buscarClima = async () => {
    const novosDados = {};
    for (const [nome, zona] of Object.entries(zonasClima)) {
      try {
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${zona.lat}&lon=${zona.lon}&appid=${API_KEY}&units=metric&lang=pt_br`
        );
        novosDados[nome] = res.data;
      } catch (err) {
        console.error(`Erro ao buscar clima de ${nome}:`, err);
      }
    }
    setDados(novosDados);
  };

  useEffect(() => {
    buscarClima();
    const climaTimer = setInterval(buscarClima, 10 * 60 * 1000);
    return () => clearInterval(climaTimer);
  }, []);

  useEffect(() => {
    const horaTimer = setInterval(() => {
      setHoraAtual(new Date());
    }, 1000);
    return () => clearInterval(horaTimer);
  }, []);

  useEffect(() => {
    if (modalAberto) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [modalAberto]);

  return (
    <main className="px-4 md:px-10 mt-24 max-w-[1600px] mx-auto relative">
      {/* Botão flutuante de adicionar */}
      <div className="fixed top-28 right-6 z-50">
        <button
          onClick={() => setModalAberto(true)}
          className="bg-[color:var(--corPrincipal)] text-white p-3 rounded-full shadow-lg hover:bg-opacity-90"
          style={{ backgroundColor: corPrincipal }}
          title="Adicionar nova notícia"
        >
          <FiPlus size={24} />
        </button>
      </div>

      {/* Modal de adicionar notícia */}
      {modalAberto && (
        <ModalNoticia
          modalAberto={modalAberto}
          setModalAberto={setModalAberto}
          corPrincipal={corPrincipal}
        />
      )}

      {/* Conteúdo da página */}
      <div className="flex flex-col lg:flex-row lg:gap-20 mb-24 items-start">
        {/* Introdução */}
        <div
          className="relative border px-10 py-8 w-full lg:w-[45%] bg-white lg:mt-[125px]"
          style={{ borderColor: corSecundaria }}
        >
          <div className="absolute -top-3 left-0 flex h-3 w-full">
            <div className="w-3/6"></div>
            <div
              className="w-3/6"
              style={{ backgroundColor: corPrincipal }}
            ></div>
            <div
              className="w-2/6"
              style={{ backgroundColor: corSecundaria }}
            ></div>
          </div>
          <h2 className="text-2xl font-fraunces font-semibold mb-4">
            Área de Climatização
          </h2>
          <p className="text-gray-400 font-fraunces text-lg leading-tight mb-4">
            Nossas cores são <br />
            baseadas nas cores das <br />
            zonas da SpTrans
          </p>
          <a
            href="#"
            className="text-sm font-bold underline"
            style={{ color: corSecundaria }}
          >
            Por que das cores?
          </a>
        </div>

        {/* Cards Clima */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3 w-full lg:w-[60%] mt-10">
          {Object.entries(zonasClima).map(([nome]) => {
            const clima = dados[nome];
            return (
              <div
                key={nome}
                className="relative rounded-xl text-white p-4 shadow-md overflow-hidden h-[150px] flex flex-col justify-between transition-transform duration-300 hover:scale-105 cursor-pointer "
                style={{
                  backgroundImage: `url(https://blogperiferico.blob.core.windows.net/zonas/zona_${nome.toLowerCase()}.png)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl " />
                <div className="relative z-10 text-xs">
                  <p>Precipitação: {clima?.rain?.["1h"] || "10"}%</p>
                  <p>Umidade: {clima?.main?.humidity || "--"}%</p>
                  <p>Vento: {clima?.wind?.speed || "--"} Km/H</p>
                </div>
                <div className="relative z-10 flex justify-between items-end ">
                  <div className="flex items-center">
                    {clima && (
                      <img
                        src={`https://openweathermap.org/img/wn/${clima.weather[0].icon}@2x.png`}
                        alt="icone"
                        className="w-10 h-10"
                      />
                    )}
                    <span className="text-xl ml-2">
                      {Math.round(clima?.main?.temp || 0)}°C
                    </span>
                  </div>
                  <div className="text-right text-sm">
                    <p className="font-bold">{nome}</p>
                    <p>{horaAtual.toLocaleTimeString("pt-BR")}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Notícias */}
      <h2 className="text-4xl font-semibold mb-10 w-max mx-auto text-center">
        Seleções de doações
      </h2>
      <div className="space-y-6">
        {noticias.map((n) => (
          <Link to={`/noticia/${n.id}`} key={n.id} className="block px-20">
            <div className="flex flex-col sm:flex-row gap-4 border-b pb-4 hover:opacity-90 transition-all">
              <img
                src={n.imagem}
                alt={n.titulo}
                className="w-full sm:w-48 h-32 object-cover rounded-md"
              />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {n.titulo}
                </h3>
                <p className="text-sm text-gray-700">{n.resumo}</p>
                <div className="text-xs text-gray-400 mt-2 flex justify-between items-center">
                  <span>{n.regiao}</span>
                  <span>
                    Por: {n.autor} | {n.data} às {n.hora}
                  </span>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
