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

  // memo pra não recriar a lista de zonas a cada render
  const zonasEntries = useMemo(
    () => Object.entries(zonasClima),
    []
  );

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
      className="px-4 py-10 bg-white"
      aria-labelledby="titulo-area-clima"
    >
      <h2
        id="titulo-area-clima"
        className="text-2xl font-bold mb-8 text-center"
      >
        Área de Climatização
      </h2>

      {erro && (
        <p className="text-center text-sm text-red-600 mb-4">
          {erro}
        </p>
      )}

      {isLoading ? (
        <div className="max-w-6xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6">
          {zonasEntries.map(([nome]) => (
            <div
              key={nome}
              className="rounded-xl bg-gray-100 animate-pulse h-48"
              aria-hidden="true"
            />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {zonasEntries.map(([nome, zona]) => {
            const clima = dados[nome];
            const precipitacao =
              clima?.rain?.["1h"] ??
              clima?.rain?.["3h"] ??
              0;

            const descricaoClima =
              clima?.weather?.[0]?.description ||
              `Condição do tempo em ${zona.bairro}`;

            return (
              <article
                key={nome}
                className="relative rounded-xl text-white p-4 shadow-md overflow-hidden"
                style={{
                  backgroundImage: `url(https://blogperiferico.blob.core.windows.net/zonas/zona_${nome.toLowerCase()}.png)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
                aria-label={`Clima na região ${nome}, bairro ${zona.bairro}`}
              >
                <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl" />
                <div className="relative z-10 flex flex-col h-full justify-between">
                  {/* Info clima */}
                  <div className="text-sm space-y-1">
                    <p>
                      Precipitação:{" "}
                      {precipitacao !== null &&
                      precipitacao !== undefined
                        ? `${precipitacao} mm`
                        : "--"}
                    </p>
                    <p>
                      Umidade:{" "}
                      {clima?.main?.humidity ?? "--"}%
                    </p>
                    <p>
                      Vento:{" "}
                      {clima?.wind?.speed != null
                        ? `${clima.wind.speed} km/h`
                        : "--"}
                    </p>
                  </div>

                  <div className="flex justify-between items-center mt-4">
                    <div className="flex items-center">
                      {clima && clima.weather?.[0]?.icon && (
                        <img
                          src={`https://openweathermap.org/img/wn/${clima.weather[0].icon}@2x.png`}
                          alt={descricaoClima}
                          className="w-12 h-12"
                          loading="lazy"
                        />
                      )}
                      <span className="text-2xl ml-2 font-semibold">
                        {clima?.main?.temp != null
                          ? `${Math.round(
                              clima.main.temp
                            )}°C`
                          : "--°C"}
                      </span>
                    </div>
                    <div className="text-right text-xs sm:text-sm">
                      <p className="font-bold">
                        {nome} — {zona.bairro}
                      </p>
                      <p className="opacity-90">
                        {horaAtual}
                      </p>
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
