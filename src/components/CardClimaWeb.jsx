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

  useEffect(() => {
    Object.entries(zonasClima).forEach(async ([nome, zona]) => {
      try {
        const res = await axios.get(
          `https://api.openweathermap.org/data/2.5/weather?lat=${zona.lat}&lon=${zona.lon}&appid=${API_KEY}&units=metric&lang=pt_br`
        );
        setDados((prev) => ({
          ...prev,
          [nome]: res.data,
        }));
      } catch (err) {
        console.error(`Erro em ${nome}:`, err);
      }
    });
  }, []);

  return (
    <section className="px-4 py-10 bg-white">
      <h2 className="text-2xl font-bold mb-8 text-center">Área de Climatização</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-3 gap-6 max-w-6xl mx-auto">
        {Object.entries(zonasClima).map(([nome]) => {
          const clima = dados[nome];
          return (
            <div
              key={nome}
              className="relative rounded-xl text-white p-4 shadow-md overflow-hidden"
              style={{
                backgroundImage: `url(https://blogperiferico.blob.core.windows.net/zonas/zona_${nome.toLowerCase()}.png)`,
                backgroundSize: "cover",
                backgroundPosition: "center",
              }}
            >
              <div className="absolute inset-0 bg-black bg-opacity-30 rounded-xl"></div>
              <div className="relative z-10 flex flex-col h-full justify-between">
                <div className="text-sm">
                  <p>Precipitation: {clima?.rain?.["1h"] || 10}%</p>
                  <p>Humidity: {clima?.main?.humidity || "--"}%</p>
                  <p>Wind: {clima?.wind?.speed || "--"} Km/H</p>
                </div>
                <div className="flex justify-between items-center mt-4">
                  <div className="flex items-center">
                    {clima && (
                      <img
                        src={`https://openweathermap.org/img/wn/${clima.weather[0].icon}@2x.png`}
                        alt="icon"
                        className="w-12 h-12"
                      />
                    )}
                    <span className="text-2xl ml-2">{Math.round(clima?.main?.temp || 0)}°C</span>
                  </div>
                  <div className="text-right">
                    <p className="font-bold">{nome}</p>
                    <p className="text-sm">{new Date().toLocaleTimeString()}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default WeatherCards;
