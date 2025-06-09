import React, { useEffect, useState } from "react";
import axios from "axios";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";

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

const noticias = [
  {
    id: 1,
    titulo: "Desemprego aumentou",
    resumo: "Desemprego teve aumento de 6,5% no trimestre segundo o IBGE.",
    imagem: "https://blogger.googleusercontent.com/img/b/R29vZ2xl/...",
    autor: "Maria da Silva Pereira",
    data: "17/06/25",
    hora: "15:30",
    regiao: "Sudeste",
  },
];

export default function QuebradaInforma() {
  const [dados, setDados] = useState({});
  const [horaAtual, setHoraAtual] = useState(new Date());

  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";
  const corSecundaria = regionColors[regiao]?.[1] || "#3B82F6";

  useEffect(() => {
    const fetchData = async () => {
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

    fetchData();
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      setHoraAtual(new Date());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  return (
    <main className="px-4 md:px-10 mt-24 max-w-[1600px] mx-auto">
      <div className="flex flex-col lg:flex-row lg:gap-20 mb-16 items-start">
        {/* Introdução */}
        <div
          className="relative border px-10 py-12 w-full lg:w-[45%] bg-white lg:mt-[172px]"
          style={{ borderColor: corSecundaria }}
        >
          <div className="absolute -top-2 left-0 flex h-2 w-full">
            <div className="w-2/6"></div>
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
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4 w-full lg:w-[60%]">
          {Object.entries(zonasClima).map(([nome]) => {
            const clima = dados[nome];
            return (
              <div
                key={nome}
                className="relative rounded-xl text-white p-4 shadow-md overflow-hidden h-[150px] flex flex-col justify-between"
                style={{
                  backgroundImage: `url(https://blogperiferico.blob.core.windows.net/zonas/zona_${nome.toLowerCase()}.png)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              >
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl" />
                <div className="relative z-10 text-xs">
                  <p>Precipitação: {clima?.rain?.["1h"] || "10"}%</p>
                  <p>Umidade: {clima?.main?.humidity || "--"}%</p>
                  <p>Vento: {clima?.wind?.speed || "--"} Km/H</p>
                </div>
                <div className="relative z-10 flex justify-between items-end">
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
      <h2 className="text-2xl font-semibold mb-6">Seleção de notícias</h2>
      <div className="space-y-6">
        {noticias.map((n) => (
          <div
            key={n.id}
            className="flex flex-col sm:flex-row gap-4 border-b pb-4"
          >
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
              <div className="text-xs text-gray-500 mt-2 flex justify-between items-center">
                <span>{n.regiao}</span>
                <span>
                  Por: {n.autor} | {n.data} às {n.hora}
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
