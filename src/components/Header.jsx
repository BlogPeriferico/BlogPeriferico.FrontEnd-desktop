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

  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8"; // padrão azul

  const handleRegiaoSelecionada = (regiaoSelecionada) => {
    setRegiao(regiaoSelecionada);
    setShowRegionSelector(false);
  };

  return (
    <header
      className="w-full px-6 py-3 flex items-center justify-between shadow-md border-b-2 fixed top-0 left-0 z-50"
      style={{ borderColor: corPrincipal, backgroundColor: "#ffffff" }}
    >
      {/* Logo + Navegação */}
      <div className="flex items-center gap-4">
        <Link
          to="/sobre"
          className="text-2xl font-bold"
          style={{ color: corPrincipal }}
        >
          BlogPeriferico
        </Link>

        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-xl md:hidden ml-4"
        >
          <FaBars />
        </button>

        <nav
          className={`${
            menuOpen
              ? " block absolute bg-white top-16 left-0 w-full shadow-md p-4"
              : "hidden"
          } md:flex gap-6 font-medium text-sm text-black md:static md:w-auto md:p-0`}
        >
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`block py-1 md:inline md:py-0 transition duration-200  ${
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

      {/* Busca + Avatar + Região */}
      <div className="flex items-center gap-4">
        <div className="hidden md:flex items-center bg-gray-100 rounded-full px-3 py-1">
          <input
            type="text"
            placeholder="O que deseja encontrar?"
            className="bg-transparent outline-none text-sm px-2 w-40"
          />
          <FaSearch className="text-gray-500" />
        </div>

        <img
          src="https://i.pravatar.cc/32"
          alt="Usuário"
          className="w-8 h-8 rounded-full border border-gray-300 transtion-1000 hover:scale-105 cursor-pointer"
        />

        <div className="relative flex items-center gap-2">
          <button
            className="w-8 h-8 flex items-center justify-center rounded-full border text-white"
            onClick={() => setShowRegionSelector(!showRegionSelector)}
            style={{ backgroundColor: corPrincipal, borderColor: corPrincipal }}
          >
            <FaMapMarkerAlt />
          </button>

          {regiao && (
            <span
              className="text-sm font-medium capitalize "
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
    </header>
  );
}
