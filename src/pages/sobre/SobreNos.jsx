// src/pages/SobreNos.jsx
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

// Imagem da seção "São Paulo..."
import FotoSaoPaulo from "../../assets/images/fotoSaoPauloSobreNos.png";

// lista fora do componente (performance, não recria a cada render)
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

export default function SobreNos() {
  const { regiao } = useRegiao();
  const navigate = useNavigate();

  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";
  const corSecundaria = regionColors[regiao]?.[1] || "#3B82F6";

  const scrollToSection = () => {
    const section = document.getElementById("qual-a-finalidade");
    section?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const handleCardKeyDown = (event, link) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      navigate(link);
    }
  };

  return (
    <main
      className="font-poppins"
      aria-label="Página Sobre nós do Blog Periférico"
    >
      {/* Vídeo de fundo + título */}
      <section
        className="relative h-screen mb-24"
        aria-labelledby="titulo-quem-somos"
      >
        <video
          className="absolute top-0 left-0 w-full h-full object-cover"
          autoPlay
          loop
          muted
          playsInline
          aria-hidden="true"
        >
          <source
            src="https://blogperiferico.blob.core.windows.net/zonas/paulista.mp4"
            type="video/mp4"
          />
        </video>

        <div className="absolute top-0 left-0 w-full h-full bg-black/30 flex items-center justify-center px-4 text-center">
          <h1
            id="titulo-quem-somos"
            className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-fraunces font-semibold opacity-90 drop-shadow-lg"
          >
            Quem somos?
          </h1>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <button
            type="button"
            onClick={scrollToSection}
            className="focus:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-black rounded-full p-2"
            aria-label="Ir para a seção Qual a finalidade do nosso site"
          >
            <FaChevronDown className="text-white text-4xl animate-bounce opacity-80" />
          </button>
        </div>
      </section>

      {/* Faixa colorida + texto introdutório */}
      <section
        className="w-full max-w-5xl mx-auto bg-white shadow-md relative rounded-b-md"
        aria-labelledby="qual-a-finalidade"
      >
        <div className="flex h-4" aria-hidden="true">
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
          <p className="text-gray-500 font-fraunces text-base">Saber mais</p>
          <h2
            id="qual-a-finalidade"
            className="text-2xl font-semibold font-fraunces mt-2"
          >
            Qual a finalidade do nosso site?
          </h2>
          <p className="text-gray-600 mt-2 font-fraunces leading-relaxed">
            O Blog Periférico nasceu da vontade de trazer visibilidade às
            questões sociais e culturais das periferias. Nosso objetivo é
            conectar pessoas e informações sobre as comunidades e suas
            histórias, além de proporcionar um espaço para reflexão e divulgação
            de iniciativas locais.
          </p>
          <a
            href="#funcionalidades"
            className="font-semibold underline mt-4 inline-block focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
            style={{ color: corSecundaria }}
          >
            Funcionalidades &gt;
          </a>
        </div>
      </section>

      {/* Seção com imagem e texto */}
      <section
        className="relative w-full h-auto mb-16 mt-12 px-4"
        aria-labelledby="titulo-sao-paulo-movimento"
      >
        <div className="flex flex-col md:flex-row items-center max-w-[1200px] mx-auto gap-8 md:gap-10">
          {/* Imagem com figure/figcaption pra acessibilidade */}
          <figure className="w-full md:w-[55%] h-[280px] sm:h-[320px] md:h-[380px] lg:h-[420px] overflow-hidden rounded-lg shadow-lg bg-gray-200">
            <img
              src={FotoSaoPaulo}
              alt="Vista da cidade de São Paulo, representando o movimento constante da metrópole"
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </figure>

          {/* Card de texto sobreposto no desktop */}
          <div className="w-full md:w-[45%] max-w-[560px]">
            <div className="bg-white shadow-lg p-6 md:p-8 rounded-lg">
              <h3
                id="titulo-sao-paulo-movimento"
                className="font-fraunces font-semibold text-2xl md:text-3xl mb-4"
              >
                São Paulo, estado do movimento constante
              </h3>
              <p className="text-gray-700 text-base md:text-lg leading-relaxed">
                São Paulo é um estado em constante transformação, marcado pelo
                corre diário, pela diversidade cultural e pela força das
                periferias. O Blog Periférico nasce desse cenário dinâmico,
                buscando organizar, amplificar e valorizar as vozes das
                quebradas que movem a cidade todos os dias.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Funcionalidades */}
      <section
        id="funcionalidades"
        className="bg-white py-16 px-4 sm:px-6 md:px-12 xl:px-28"
        aria-labelledby="titulo-funcionalidades"
      >
        <h2
          id="titulo-funcionalidades"
          className="text-center text-3xl font-fraunces font-semibold mb-12"
        >
          Funcionalidades
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-screen-xl mx-auto">
          {funcionalidades.map((item, i) => (
            <article
              key={item.title}
              tabIndex={0}
              onClick={() => navigate(item.link)}
              onKeyDown={(e) => handleCardKeyDown(e, item.link)}
              className="border shadow-md p-6 bg-white relative rounded-lg transition-transform duration-200 hover:scale-105 cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-gray-500"
              aria-label={`Ir para a funcionalidade ${item.title}`}
            >
              <div
                className="h-1 w-full absolute top-0 left-0 rounded-t"
                style={{ backgroundColor: corPrincipal }}
                aria-hidden="true"
              ></div>

              <div className="flex items-center gap-2 mb-4">
                <div
                  className="p-2 rounded-md flex items-center justify-center"
                  style={{ backgroundColor: corSecundaria }}
                >
                  <img
                    src={item.icon}
                    alt=""
                    className="w-7 h-7 sm:w-8 sm:h-8 object-contain"
                    loading="lazy"
                    aria-hidden="true"
                  />
                </div>
                <span className="font-semibold text-sm px-2 py-1 bg-white rounded">
                  {item.title}
                </span>
              </div>

              <p className="text-sm text-gray-600 font-poppins leading-relaxed">
                {item.desc}
              </p>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
