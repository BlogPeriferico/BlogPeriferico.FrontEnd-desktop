import React, { useEffect, useMemo, useState } from "react";
import axios from "axios";

const API_KEY = "ae928948ef9a78cc99fd981d3aedb19d";

const zonasClima = {
  Centro: { bairro: "Sé", lat: -23.5505, lon: -46.6333 },
  Leste: { bairro: "Tatuapé", lat: -23.5407, lon: -46.5766 },
  Nordeste: { bairro: "Penha", lat: -23.5294, lon: -46.548 },
  Noroeste: { bairro: "Brasilândia", lat: -23.4565, lon: -46.6795 },
  Norte: { bairro: "Santana", lat: -23.5018, lon: -46.6246 },
  Oeste: { bairro: "Butantã", lat: -23.5673, lon: -46.7269 },
  Sudeste: { bairro: "Mooca", lat: -23.5542, lon: -46.5926 },
  Sudoeste: { bairro: "Vila Olímpia", lat: -23.5958, lon: -46.6845 },
  Sul: { bairro: "Santo Amaro", lat: -23.6486, lon: -46.7133 },
};

function WeatherCardsBase() {
  const [dados, setDados] = useState({});
  const [erro, setErro] = useState(null);

  const zonasEntries = useMemo(() => Object.entries(zonasClima), []);

  useEffect(() => {
    let cancelado = false;

    async function buscarClimas() {
      try {
        const resultados = await Promise.all(
          zonasEntries.map(async ([nome, zona]) => {
            try {
              const res = await axios.get(
                `https://api.openweathermap.org/data/2.5/weather?lat=${zona.lat}&lon=${zona.lon}&appid=${API_KEY}&units=metric&lang=pt_br`
              );
              return [nome, res.data];
            } catch (err) {
              console.error(`Erro em ${nome}:`, err);
              return [nome, null];
            }
          })
        );

        if (cancelado) return;

        const novoMapa = {};
        resultados.forEach(([nome, data]) => {
          if (data) novoMapa[nome] = data;
        });

        setDados(novoMapa);
        setErro(null);
      } catch (err) {
        if (!cancelado) {
          console.error("Erro geral ao carregar clima:", err);
          setErro("Não foi possível carregar os dados de clima.");
        }
      }
    }

    buscarClimas();

    return () => {
      cancelado = true;
    };
  }, [zonasEntries]);

  const isLoading = useMemo(
    () => Object.keys(dados).length === 0 && !erro,
    [dados, erro]
  );

  const horaAtual = useMemo(
    () =>
      new Date().toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      }),
    []
  );

  return (
    <section
      className="w-full overflow-x-hidden px-3 sm:px-4 lg:px-8 py-8 sm:py-10 lg:py-12 bg-white"
      aria-labelledby="titulo-area-clima"
    >
      <h2
        id="titulo-area-clima"
        className="text-xl sm:text-2xl lg:text-3xl font-bold mb-6 sm:mb-8 text-center"
      >
        Área de Climatização
      </h2>

      {erro && (
        <p className="text-center text-xs sm:text-sm text-red-600 mb-4">
          {erro}
        </p>
      )}

      {isLoading ? (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {zonasEntries.map(([nome]) => (
            <div
              key={nome}
              className="rounded-xl bg-gray-100 animate-pulse h-40 sm:h-48"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 lg:gap-6">
          {zonasEntries.map(([nome, zona]) => {
            const clima = dados[nome];
            const precipitacao =
              clima?.rain?.["1h"] ?? clima?.rain?.["3h"] ?? 0;

            const descricaoClima =
              clima?.weather?.[0]?.description ||
              `Condição do tempo em ${zona.bairro}`;

            return (
              <article
                key={nome}
                className="relative rounded-xl text-white p-3 sm:p-4 shadow-md overflow-hidden min-h-[170px] sm:min-h-[190px] md:min-h-[200px]"
                style={{
                  backgroundImage: `url(https://blogperiferico.blob.core.windows.net/zonas/zona_${nome.toLowerCase()}.png)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                aria-label={`Clima na região ${nome}, bairro ${zona.bairro}`}
              >
                <div className="absolute inset-0 bg-black bg-opacity-35 rounded-xl" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  {/* Info clima */}
                  <div className="text-[11px] sm:text-xs md:text-sm space-y-1">
                    <p>
                      Precipitação:{" "}
                      {precipitacao !== null && precipitacao !== undefined
                        ? `${precipitacao} mm`
                        : "--"}
                    </p>
                    <p>Umidade: {clima?.main?.humidity ?? "--"}%</p>
                    <p>
                      Vento:{" "}
                      {clima?.wind?.speed != null
                        ? `${clima.wind.speed} km/h`
                        : "--"}
                    </p>
                  </div>

                  {/* Ícone + temp + nome zona */}
                  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 mt-4">
                    <div className="flex items-center">
                      {clima && clima.weather?.[0]?.icon && (
                        <img
                          src={`https://openweathermap.org/img/wn/${clima.weather[0].icon}@2x.png`}
                          alt={descricaoClima}
                          className="w-10 h-10 sm:w-12 sm:h-12 flex-shrink-0"
                          loading="lazy"
                        />
                      )}
                      <span className="text-xl sm:text-2xl ml-2 font-semibold">
                        {clima?.main?.temp != null
                          ? `${Math.round(clima.main.temp)}°C`
                          : "--°C"}
                      </span>
                    </div>
                    <div className="text-right text-[10px] sm:text-xs">
                      <p className="font-semibold">
                        {nome} — {zona.bairro}
                      </p>
                      <p className="opacity-90">{horaAtual}</p>
                    </div>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}

export default React.memo(WeatherCardsBase);
