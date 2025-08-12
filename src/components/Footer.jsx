import React from "react";
import { Link } from "react-router-dom";
import { useRegiao } from "../contexts/RegionContext";
import { regionColors } from "../utils/regionColors";
import { FaInstagram } from "react-icons/fa";
import Houses from "../assets/svgs/houses.svg";

export default function Footer() {
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#015E98"; // cor azul padrão

  return (
    <footer className="w-full bg-[#f8f8f8] px-6 py-10 flex flex-col md:flex-row justify-between items-start md:items-center border-t mt-auto">
      <div className="flex flex-col md:flex-row gap-12 w-full md:w-auto">
        {/* Páginas */}
        <div>
          <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
            <span
              className="w-2 h-4 rounded-md"
              style={{ backgroundColor: corPrincipal }}
            ></span>
            Páginas
          </h3>
          <ul className="text-sm text-gray-500 space-y-1 ">
            <li className="hover:text-red-500 transition duration-200">
              <Link to="/quebrada-informa">Quebrada informa</Link>
            </li>
            <li className="hover:text-red-500 transition duration-200">
              <Link to="/doacoes">Mão amiga</Link>
            </li>
            <li className="hover:text-red-500 transition duration-200">
              <Link to="/vendas">Achadinhos</Link>
            </li>
            <li className="hover:text-red-500 transition duration-200">
              <Link to="/vagas">Corre certo</Link>
            </li>
            <li className="hover:text-red-500 transition duration-200">
              <Link to="/sobre">Sobre nós</Link>
            </li>
          </ul>
        </div>

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
            rel="noreferrer"
            className="inline-flex items-center justify-center w-10 h-10 text-white rounded-full hover:scale-105 cursor-pointer"
            style={{
              background:
                "radial-gradient(circle at 30% 107%, #fdf497 0%, #fdf497 5%, #fd5949 45%, #d6249f 60%, #285AEB 90%)",
            }}
          >
            <FaInstagram size={20} />
          </a>
        </div>

        {/* E-mail com link mailto */}
        <div>
          <h3 className="text-sm font-bold mb-2 flex items-center gap-1">
            <span
              className="w-2 h-4 rounded-md"
              style={{ backgroundColor: corPrincipal }}
            ></span>
            Reposte Algum Erro Neste Email:
          </h3>
          <a
            href="mailto:blog.periferico@gmail.com"
            className="bg-gray-200 text-sm text-gray-500 rounded px-3 py-2 inline-block"
          >
            blog.periferico@gmail.com
          </a>
        </div>
      </div>

      {/* Imagem */}
      <img
        src={Houses}
        alt="Casas da periferia"
        className="w-48 mt-10 md:mt-0 md:ml-12"
      />
    </footer>
  );
}
