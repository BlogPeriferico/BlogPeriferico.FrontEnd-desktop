// src/components/Footer.jsx
import React from "react";
import { Link } from "react-router-dom";
import { useRegiao } from "../contexts/RegionContext";
import { regionColors } from "../utils/regionColors";
import { FaInstagram } from "react-icons/fa";
import Houses from "../assets/svgs/houses.svg";
import IconGmail from "../assets/images/gmail.png";

export default function Footer() {
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#015E98"; // cor azul padrão

  const linksPaginas = [
    { path: "/quebrada-informa", label: "Quebrada informa" },
    { path: "/doacoes", label: "Mão amiga" },
    { path: "/achadinhos", label: "Achadinhos" },
    { path: "/vagas", label: "Corre certo" },
    { path: "/sobre", label: "Sobre nós" },
  ];

  const handleHover =
    (colorOn, colorOff = "#6b7280") =>
    (e) => {
      e.currentTarget.style.color = e.type === "mouseenter" || e.type === "focus"
        ? colorOn
        : colorOff;
    };

  return (
    <footer
      className="w-full bg-[#f8f8f8] px-6 py-10 flex flex-col md:flex-row justify-between items-start md:items-center border-t mt-auto"
      aria-label="Rodapé do site"
    >
      <div className="flex flex-col md:flex-row gap-12 w-full md:w-auto">
        {/* Páginas */}
        <nav aria-label="Navegação do rodapé">
          <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
            <span
              className="w-2 h-4 rounded-md"
              style={{ backgroundColor: corPrincipal }}
            ></span>
            Páginas
          </h3>
          <ul className="text-sm text-gray-500 space-y-1">
            {linksPaginas.map((link) => (
              <li
                key={link.path}
                className="transition duration-200 cursor-pointer outline-none"
                onMouseEnter={handleHover(corPrincipal)}
                onMouseLeave={handleHover(corPrincipal)}
                onFocus={handleHover(corPrincipal)}
                onBlur={handleHover(corPrincipal)}
                style={{ color: "#6b7280" }}
              >
                <Link to={link.path}>{link.label}</Link>
              </li>
            ))}
          </ul>
        </nav>

        {/* Redes Sociais */}
        <div>
          <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
            <span
              className="w-2 h-4 rounded-md"
              style={{ backgroundColor: corPrincipal }}
            ></span>
            Redes Sociais
          </h3>
          <a
            href="https://www.instagram.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center w-10 h-10 text-white rounded-full hover:scale-105 cursor-pointer focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#d6249f]"
            aria-label="Acessar o Instagram do Blog Periférico"
            style={{
              background:
                "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
            }}
          >
            <FaInstagram size={20} aria-hidden="true" />
          </a>
        </div>

        {/* E-mail com ícone do Gmail */}
        <div>
          <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
            <span
              className="w-2 h-4 rounded-md"
              style={{ backgroundColor: corPrincipal }}
            ></span>
            Reporte algum erro neste e-mail:
          </h3>
          <a
            href="mailto:blog.periferico@gmail.com"
            className="inline-block"
            aria-label="Enviar e-mail para blog.periferico@gmail.com"
          >
            <img
              src={IconGmail}
              alt="Ícone do Gmail"
              className="w-8 h-8 object-contain hover:scale-105 transition-transform"
              loading="lazy"
            />
          </a>
        </div>
      </div>

      {/* Imagem ilustrativa */}
      <img
        src={Houses}
        alt="Ilustração de casas da periferia"
        className="w-48 mt-10 md:mt-0 md:ml-12"
        loading="lazy"
      />
    </footer>
  );
}
