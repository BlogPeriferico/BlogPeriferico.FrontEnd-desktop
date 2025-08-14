import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt, FaBars } from "react-icons/fa";
import RegionSelector from "./RegionSelector";
import { useRegiao } from "../contexts/RegionContext";
import { regionColors } from "../utils/regionColors";

export default function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  const location = useLocation();

  const { regiao, setRegiao } = useRegiao();

  const navLinks = [
    { path: "/quebrada-informa", label: "Quebrada Informa" },
    { path: "/doacoes", label: "Mão Amiga" },
    { path: "/achadinhos", label: "Achadinhos" },
    { path: "/vagas", label: "Corre Certo" },
  ];

  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";

  const handleRegiaoSelecionada = (regiaoSelecionada) => {
    setRegiao(regiaoSelecionada);
    setShowRegionSelector(false);
  };

  return (
    <header
      className="w-full px-6 py-3 flex items-center justify-between shadow-md border-b-2 fixed top-0 left-0 z-50"
      style={{ borderColor: corPrincipal, backgroundColor: "#ffffff" }}
    >
      {/* Esquerda: Logo */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <Link
          to="/sobre"
          className="text-2xl font-bold"
          style={{ color: corPrincipal }}
        >
          BlogPeriferico
        </Link>
      </div>

      {/* Centro: Menu links (apenas md+) */}
      <nav className="hidden md:flex gap-6 font-medium text-sm text-black flex-grow justify-center">
        {navLinks.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`transition duration-200 hover:underline ${
              location.pathname === link.path ? "font-semibold" : ""
            }`}
            style={
              location.pathname === link.path ? { color: corPrincipal } : {}
            }
          >
            {link.label}
          </Link>
        ))}
      </nav>

      {/* Direita: Mobile (hamburguer) + perfil + região */}
      <div className="flex items-center gap-3 flex-shrink-0">
        {/* Botão hamburguer só aparece no mobile */}
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-xl md:hidden"
        >
          <FaBars />
        </button>

        {/* Avatar */}
        <img
          src="https://i.pravatar.cc/32"
          alt="Usuário"
          className="w-8 h-8 rounded-full border border-gray-300 duration-300 hover:scale-105 cursor-pointer"
        />

        {/* Seletor de Região */}
        <div className="relative flex items-center gap-2">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full border text-white duration-300 hover:scale-105"
            onClick={() => setShowRegionSelector(!showRegionSelector)}
            style={{ backgroundColor: corPrincipal, borderColor: corPrincipal }}
          >
            <FaMapMarkerAlt />
          </button>
          {regiao && (
            <span
              className="hidden sm:inline text-sm font-medium capitalize"
              style={{ color: corPrincipal }}
            >
              {regiao}
            </span>
          )}
          {showRegionSelector && (
            <RegionSelector
              onClose={() => setShowRegionSelector(false)}
              onSelect={handleRegiaoSelecionada}
            />
          )}
        </div>
      </div>

      {/* Menu Mobile (quando aberto) */}
      {menuOpen && (
<div className="absolute top-14 left-0 w-full bg-white p-4 md:hidden border-b-[2px] border-b-orange-500">


          {/* Barra de Pesquisa */}
          <div className="flex items-center bg-gray-100 rounded-full px-3 py-1 mb-4">
            <input
              type="text"
              placeholder="O que deseja encontrar?"
              className="bg-transparent outline-none text-sm px-2 flex-1"
            />
            <FaSearch className="text-gray-500" />
          </div>

          {/* Links */}
          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`py-1 transition duration-200 hover:bg-gray-200 rounded px-2 ${
                  location.pathname === link.path ? "font-semibold" : ""
                }`}
                onClick={() => setMenuOpen(false)}
                style={
                  location.pathname === link.path ? { color: corPrincipal } : {}
                }
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
