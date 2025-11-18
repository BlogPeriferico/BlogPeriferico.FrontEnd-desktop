import React, { useEffect, useState } from "react";
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

const WeatherCards = () => {
  const [dados, setDados] = useState({});
  const [erro, setErro] = useState("");

  useEffect(() => {
    let cancelado = false;

    async function carregarClima() {
      try {
        const entradas = await Promise.all(
          Object.entries(zonasClima).map(async ([nome, zona]) => {
            const res = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${zona.lat}&lon=${zona.lon}&appid=${API_KEY}&units=metric&lang=pt_br`
            );
            return [nome, res.data];
          })
        );

        if (!cancelado) {
          setDados(Object.fromEntries(entradas));
        }
      } catch (err) {
        console.error("Erro ao carregar clima:", err);
        if (!cancelado) {
          setErro("Não foi possível carregar os dados de clima agora.");
        }
      }
    }

    carregarClima();

    return () => {
      cancelado = true;
    };
  }, []);

  const agora = new Date();
  const horaFormatada = agora.toLocaleTimeString("pt-BR", {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <section
      className="px-4 py-10 bg-white"
      role="region"
      aria-labelledby="weather-heading"
    >
      <h2 id="weather-heading" className="text-2xl font-bold mb-4 text-center">
        Área de Climatização
      </h2>

      {erro && (
        <p
          className="text-center text-sm text-red-600 mb-4"
          role="alert"
          aria-live="assertive"
        >
          {erro}
        </p>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {Object.entries(zonasClima).map(([nome, zona]) => {
          const clima = dados[nome];
          const descricao = clima?.weather?.[0]?.description;

          return (
            <article
              key={nome}
              className="relative rounded-xl text-white p-4 shadow-md overflow-hidden"
              style={{
                backgroundImage: `url(https://blogperiferico.blob.core.windows.net/zonas/zona_${nome.toLowerCase()}.png)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
              aria-label={`Condições climáticas em ${zona.bairro}, zona ${nome} de São Paulo`}
            >
              <div
                className="absolute inset-0 bg-black bg-opacity-30 rounded-xl"
                aria-hidden="true"
              ></div>

              <div
                className="relative z-10 flex flex-col h-full justify-between"
                aria-busy={!clima}
              >
                <div className="text-sm space-y-1">
                  <p>
                    Precipitação:{" "}
                    <span>
                      {clima?.rain?.["1h"] != null
                        ? `${clima.rain["1h"]} mm`
                        : "—"}
                    </span>
                  </p>
                  <p>
                    Umidade: <span>{clima?.main?.humidity ?? "—"}%</span>
                  </p>
                  <p>
                    Vento:{" "}
                    <span>
                      {clima?.wind?.speed != null
                        ? `${clima.wind.speed} km/h`
                        : "—"}
                    </span>
                  </p>
                </div>

                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center">
                    {clima && (
                      <img
                        src={`https://openweathermap.org/img/wn/${clima.weather[0].icon}@2x.png`}
                        alt={
                          descricao ||
                          "Ícone representando a condição climática atual"
                        }
                        className="w-12 h-12"
                        loading="lazy"
                        decoding="async"
                      />
                    )}
                    <span className="text-2xl ml-2">
                      {clima ? `${Math.round(clima.main.temp)}°C` : "—"}
                    </span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{nome}</p>
                    <p className="text-sm">{zona.bairro}</p>
                    <time className="text-xs" dateTime={agora.toISOString()}>
                      {horaFormatada}
                    </time>
                  </div>
                </div>
              </div>
            </article>
          );
        })}
      </div>
    </section>
  );
};

export default WeatherCards;
