import React from "react";
import { useNavigate } from "react-router-dom";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import { FaChevronDown } from "react-icons/fa";

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
      icon: "📋",
      title: "Quebrada Informa",
      desc: "Espaço de jornalismo comunitário: aqui publicamos fatos e histórias locais, greves, locais com trânsito e reportagens que impactam diretamente a vida da nossa comunidade.",
      link: "/quebrada-informa",
    },
    {
      icon: "🤝",
      title: "Mão Amiga",
      desc: "Área de solidariedade e doações: ache e ofereça itens em bom estado. Roupas, calçados, brinquedos e utensílios domésticos ganham destaque aqui, incentivando o desapego consciente.",
      link: "/doacoes",
    },
    {
      icon: "🛍️",
      title: "Achadinhos",
      desc: "Loja online: onde vendedores e empreendedores periféricos expõem seus produtos a preços acessíveis. Artesanato, moda, alimentos e serviços. Tudo facilitar a busca e fortalecer a economia da quebrada.",
      link: "/achadinhos",
    },
    {
      icon: "📢",
      title: "Corre Certo",
      desc: "Painel de oportunidades: seção dedicada a vagas de emprego, bolsas de estudo e cursos. Cada anúncio é verificado e descrito de forma direta, para que você encontre a chance certa de crescer sem perder tempo.",
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
        >
          <source
            src="https://blogperiferico.blob.core.windows.net/zonas/paulista.mp4"
            type="video/mp4"
          />
        </video>
        <div className="absolute top-0 left-0 w-full h-full bg-black bg-opacity-30 flex items-center justify-center">
          <h1 className="text-white text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-fraunces font-semibold opacity-75">
            Quem somos?
          </h1>
        </div>

        <div className="absolute bottom-10 left-1/2 transform -translate-x-1/2">
          <button onClick={scrollToSection}>
            <FaChevronDown className="text-white text-4xl animate-bounce opacity-75" />
          </button>
        </div>
      </section>

      {/* Faixa colorida */}
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

        {/* Texto explicativo */}
        <div className="p-6">
          <p className="text-gray-500 font-fraunces text-base">Saber mais</p>
          <h2
            id="qual-a-finalidade"
            className="text-2xl font-semibold font-fraunces mt-2"
          >
            Qual a finalidade do nosso site?
          </h2>
          <p className="text-gray-600 mt-2 font-fraunces">
            O Blog Periférico nasceu da vontade de trazer visibilidade às
            questões sociais e culturais das periferias. Nosso objetivo é
            conectar pessoas e informações sobre as comunidades e suas
            histórias, além de proporcionar um espaço para reflexão e divulgação
            de iniciativas locais.
          </p>
          <a
            href="#funcionalidades"
            className="font-semibold underline mt-4 inline-block"
            style={{ color: corSecundaria }}
          >
            Funcionalidades &gt;
          </a>
        </div>
      </div>

      {/* Funcionalidades */}
      <section
        id="funcionalidades"
        className="bg-white py-16 px-4 sm:px-6 md:px-12 xl:px-28 "
      >
        <h2 className="text-center text-3xl font-fraunces font-semibold mb-12">
          Funcionalidades
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 max-w-screen-xl mx-auto ">
          {funcionalidades.map((item, i) => (
            <div
              key={i}
              onClick={() => navigate(item.link)}
              className="border shadow-md p-6 bg-white relative rounded-lg transition duration-200 hover:scale-105 cursor-pointer"
            >
              <div
                className="h-1 w-full absolute top-0 left-0 rounded-t"
                style={{ backgroundColor: corPrincipal }}
              ></div>
              <div className="flex items-center gap-2 mb-4">
                <div
                  className="p-2 rounded-md"
                  style={{ backgroundColor: corSecundaria }}
                >
                  <span className="text-lg">{item.icon}</span>
                </div>
                <span className="font-semibold text-sm px-2 py-1 bg-white rounded">
                  {item.title}
                </span>
              </div>
              <p className="text-sm text-gray-600 font-poppins leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
