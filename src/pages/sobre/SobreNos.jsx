// src/pages/sobre/SobreNos.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import { FaChevronDown } from "react-icons/fa";

// Importação dos SVGs personalizados
import jornalIcon from "../../assets/svgs/jornal.svg";
import megafoneIcon from "../../assets/svgs/megafone.svg";
import lojaIcon from "../../assets/svgs/loja.svg";
import housesIcon from "../../assets/svgs/houses.svg";
import maoIcon from "../../assets/svgs/mao.svg";

// URLs do Blob para vídeo e imagem
const VIDEO_PAULISTA_URL =
  "https://blogperic0.blob.core.windows.net/zonas/paulista.mp4";

const FOTO_SAO_PAULO_URL =
  "https://blogperic0.blob.core.windows.net/zonas/fotoSaoPaulo.png";

export default function SobreNos() {
  const { regiao } = useRegiao();
  const navigate = useNavigate();

  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";
  const corSecundaria = regionColors[regiao]?.[1] || "#3B82F6";

  const scrollToSection = () => {
    const section = document.getElementById("qual-a-finalidade");
    section?.scrollIntoView({ behavior: "smooth" });
  };

  const funcionalidades = [
    {
      icon: jornalIcon,
      title: "Quebrada Informa",
      desc: "Espaço de jornalismo comunitário: aqui publicamos fatos e histórias locais, greves, locais com trânsito e reportagens que impactam diretamente a vida da nossa comunidade.",
      link: "/quebrada-informa",
    },
    {
      icon: maoIcon,
      title: "Mão Amiga",
      desc: "Área de solidariedade e doações: ache e ofereça itens em bom estado. Roupas, calçados, brinquedos e utensílios domésticos ganham destaque aqui, incentivando o desapego consciente.",
      link: "/doacoes",
    },
    {
      icon: lojaIcon,
      title: "Achadinhos",
      desc: "Loja online: onde vendedores e empreendedores periféricos expõem seus produtos a preços acessíveis. Artesanato, moda, alimentos e serviços. Tudo para fortalecer a economia da quebrada.",
      link: "/achadinhos",
    },
    {
      icon: megafoneIcon,
      title: "Corre Certo",
      desc: "Painel de oportunidades: seção dedicada a vagas de emprego, bolsas de estudo e cursos. Cada anúncio é verificado e descrito de forma direta, para que você encontre a chance certa de crescer.",
      link: "/vagas",
    },
  ];

  return (
    <div className="font-poppins">
      {/* Vídeo de fundo + título */}
      <section className="relative h-screen mb-24">
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          preload="metadata"
        >
          <source src={VIDEO_PAULISTA_URL} type="video/mp4" />
        </video>

        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-center">
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-semibold opacity-75">
            Quem somos?
          </h1>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <button onClick={scrollToSection}>
            <FaChevronDown className="text-white text-4xl animate-bounce opacity-75" />
          </button>
        </div>
      </section>

      {/* Faixa colorida + texto explicativo */}
      <div className="w-full max-w-5xl mx-auto bg-white shadow-md relative">
        <div className="flex h-4">
          <div className="w-1/6"></div>
          <div
            className="w-4/6"
            style={{ backgroundColor: corPrincipal }}
          ></div>
          <div
            className="w-2/6"
            style={{ backgroundColor: corSecundaria }}
          ></div>
        </div>

        <div className="p-6">
          <p className="text-gray-500 text-base">Saber mais</p>
          <h2
            id="qual-a-finalidade"
            className="text-2xl font-semibold mt-2"
          >
            Qual a finalidade do nosso site?
          </h2>
          <p className="text-gray-600 mt-2">
            O Blog Periférico nasceu da vontade de trazer visibilidade às
            questões sociais e culturais das periferias. Nosso objetivo é
            conectar pessoas e informações sobre as comunidades e suas histórias,
            além de proporcionar um espaço para reflexão e divulgação de
            iniciativas locais.
          </p>
          <a
            href="#funcionalidades"
            className="font-semibold underline mt-4 inline-block"
            style={{ color: corPrincipal }}
          >
            Funcionalidades &gt;
          </a>
        </div>
      </div>

      {/* Seção com imagem e texto */}
      <section className="relative w-full h-auto mb-16 mt-12">
        <div className="flex flex-col md:flex-row items-center max-w-[1200px] mx-auto relative px-4">
          <div
            className="w-full md:w-[60%] h-[300px] md:h-[400px] bg-cover bg-center shadow-lg"
            style={{
              backgroundImage: `url(${FOTO_SAO_PAULO_URL})`,
            }}
          ></div>

          <div className="bg-white shadow-lg p-6 md:p-10 md:absolute md:top-[65%] md:left-[55%] transform md:-translate-y-1/2 mt-6 md:mt-0 w-full md:w-[45%] max-w-[560px]">
            <h3 className="font-semibold text-2xl md:text-3xl mb-4">
              São Paulo, estado do movimento constante
            </h3>
            <p className="text-gray-700 text-base md:text-lg leading-relaxed">
              São Paulo é uma cidade que não para. Carrega nas ruas a correria
              diária, mas também a força de milhões de pessoas que constroem sua
              história todos os dias. O Blog Periférico nasce nesse cenário: um
              espaço para que a quebrada seja protagonista, ocupando o lugar que
              merece nas narrativas sobre a cidade.
            </p>
          </div>
        </div>
      </section>

      {/* FUNCIONALIDADES */}
      <section
        id="funcionalidades"
        className="py-20 bg-white px-4 sm:px-6 md:px-12 xl:px-28"
      >
        <h2 className="text-center text-4xl font-semibold mb-14">
          Funcionalidades
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 max-w-screen-xl mx-auto">
          {funcionalidades.map((item, i) => (
            <div
              key={i}
              onClick={() => navigate(item.link)}
              className="group border shadow-lg p-6 bg-white rounded-xl cursor-pointer transition duration-200 hover:-translate-y-2 hover:shadow-xl"
            >
              <div
                className="h-1 w-full rounded-t mb-4"
                style={{ backgroundColor: corPrincipal }}
              />

              <div className="flex items-center gap-3 mb-4">
                <div
                  className="p-3 rounded-md shadow-sm"
                  style={{ backgroundColor: corSecundaria }}
                >
                  <img
                    src={item.icon}
                    alt={item.title}
                    className="w-7 h-7 object-contain"
                  />
                </div>

                <span className="font-semibold text-base">
                  {item.title}
                </span>
              </div>

              <p className="text-gray-600 text-sm leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
        
        {/* Faixa de download do app */}
        <div className="w-full max-w-5xl mx-auto mt-20 mb-10 relative">
          {/* Gradiente ornamental atrás */}
          <div
            className="absolute inset-0 blur-2xl opacity-30"
            style={{
              background: `linear-gradient(90deg, ${corPrincipal}, ${corSecundaria})`,
            }}
          ></div>

          <div className="relative bg-white shadow-xl rounded-xl overflow-hidden border border-gray-100">
            {/* Faixa estilizada no topo */}
            <div className="flex h-3">
              <div className="w-1/6" />
              <div
                className="w-4/6"
                style={{ backgroundColor: corPrincipal }}
              />
              <div
                className="w-2/6"
                style={{ backgroundColor: corSecundaria }}
              />
            </div>

            {/* Conteúdo */}
            <div className="p-8 flex flex-col md:flex-row justify-between items-center gap-8">
              {/* Ícone + Texto */}
              <div className="flex items-start gap-4 md:max-w-lg">
                

                <div>
                  <h2 className="text-3xl font-semibold leading-tight">
                    Baixe o app do Blog Periférico
                  </h2>

                  <p className="text-gray-600 mt-3 text-sm md:text-base">
                    Tenha notícias da quebrada, vagas, doações, vendas e muito mais no
                    seu celular. Atualizações rápidas, conteúdo direto das regiões, e
                    tudo com confiança e segurança.
                  </p>
                  <br/>
                  <p className="text-gray-700 mt-2 text-sm">
                    Disponível no MediaFire para Android — e em breve no iOS!
                  </p>
                </div>
              </div>

              {/* QR + Botões */}
              <div className="flex flex-col items-center justify-center gap-3">
                {/* QR Code (opcional – remova se quiser) */}
                <div className="p-3 rounded-lg shadow-md bg-white border border-gray-200">
                  <img
                    src="https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=https://www.mediafire.com/file/2y9n0edum10q0ae/application-007c1e0e-cba5-4a50-a435-ebc465d7e25d.apk/file"
                    alt="QR Code Download"
                    className="w-32 h-32"
                  />
                </div>

                {/* Botões */}
                <div className="flex flex-col sm:flex-row gap-3 mt-2">
                  {/* Android */}
                  <a
                    href="https://www.mediafire.com/file/2y9n0edum10q0ae/application-007c1e0e-cba5-4a50-a435-ebc465d7e25d.apk/file"
                    target="_blank"
                    rel="noreferrer"
                    className="px-5 py-3 rounded-lg text-sm font-semibold shadow-md text-white text-center transition hover:scale-105"
                    style={{ backgroundColor: corPrincipal }}
                  >
                    Baixar para Android
                  </a>

                  {/* iOS */}
                  <a
                    href="#"
                    className="px-5 py-3 rounded-lg text-sm font-semibold border text-center transition hover:scale-105"
                    style={{
                      borderColor: corSecundaria,
                      color: corSecundaria,
                    }}
                  >
                    Em breve no iOS
                  </a>
                </div>
              </div>
            </div>

            {/* Onda decorativa inferior */}
            <svg
              className="w-full text-white"
              viewBox="0 0 1440 100"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                fill={corPrincipal}
                d="M0,64L48,58.7C96,53,192,43,288,48C384,53,480,75,576,80C672,85,768,75,864,74.7C960,75,1056,85,1152,80C1248,75,1344,53,1392,42.7L1440,32L1440,100L1392,100C1344,100,1248,100,1152,100C1056,100,960,100,864,100C768,100,672,100,576,100C480,100,384,100,288,100C192,100,96,100,48,100L0,100Z"
              ></path>
            </svg>
          </div>
        </div>

      </section>
    </div>
  );
}
