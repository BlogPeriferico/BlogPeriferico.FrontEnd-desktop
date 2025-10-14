import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt, FaBars } from "react-icons/fa";
import RegionSelector from "./RegionSelector";
import { useRegiao } from "../contexts/RegionContext";
import { useUser } from "../contexts/UserContext.jsx";
import { regionColors } from "../utils/regionColors";
import NoPicture from "../assets/images/NoPicture.webp";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { regiao, setRegiao } = useRegiao();
  const { user } = useUser(); // usuário atualizado do contexto
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  const [fotoAtual, setFotoAtual] = useState(NoPicture);

  // Atualiza a foto quando o user mudar
  useEffect(() => {
    if (user?.fotoPerfil) {
      setFotoAtual(user.fotoPerfil);
    } else {
      setFotoAtual(NoPicture);
    }
  }, [user?.fotoPerfil]);

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

  const hexToRGBA = (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  return (
    <header
      className="w-full px-6 py-3 flex items-center justify-between shadow-md border-b-2 fixed top-0 left-0 z-50"
      style={{ borderColor: corPrincipal, backgroundColor: "#ffffff" }}
    >
      {/* Logo */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <Link to="/sobre" className="text-2xl font-bold" style={{ color: corPrincipal }}>
          BlogPeriferico
        </Link>
      </div>

      {/* Centro: Links + pesquisa */}
      <div className="flex-1 flex items-center gap-6">
        <nav className="hidden lg:flex gap-6 font-medium text-sm text-black ml-4">
          {navLinks.map((link) => (
            <Link
              key={link.path}
              to={link.path}
              className={`transition duration-200 hover:underline ${
                location.pathname === link.path ? "font-semibold" : ""
              }`}
              style={location.pathname === link.path ? { color: corPrincipal } : {}}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div
          className="hidden lg:flex items-center bg-white rounded-full shadow-md px-4 py-2 w-72 border gap-2 transition-all duration-300 ml-auto"
          style={{ borderColor: "#d1d5db" }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = corPrincipal;
            e.currentTarget.style.boxShadow = `0 0 10px ${hexToRGBA(corPrincipal, 0.3)}`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.borderColor = "#d1d5db";
            e.currentTarget.style.boxShadow = "0 0 0 rgba(0,0,0,0)";
          }}
        >
          <input
            type="text"
            placeholder="O que deseja encontrar?"
            className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 flex-1"
          />
          <FaSearch
            className="text-gray-400 cursor-pointer transition-colors duration-200"
            onMouseEnter={(e) => (e.currentTarget.style.color = hexToRGBA(corPrincipal, 0.6))}
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
          />
        </div>
      </div>

      {/* Direita: avatar + região */}
      <div className="flex items-center gap-5 flex-shrink-0">
        <button onClick={() => setMenuOpen(!menuOpen)} className="text-xl lg:hidden">
          <FaBars />
        </button>

        {/* Avatar do usuário */}
        <img
          src={fotoAtual} // usa state local atualizado
          alt={user?.nome || "Usuário"}
          className="w-8 h-8 ml-4 rounded-full border border-gray-300 duration-300 hover:scale-105 cursor-pointer"
          onClick={() => navigate("/perfil")}
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
            <span className="hidden sm:inline text-sm font-medium capitalize" style={{ color: corPrincipal }}>
              {regiao}
            </span>
          )}
          {showRegionSelector && (
            <RegionSelector onClose={() => setShowRegionSelector(false)} onSelect={handleRegiaoSelecionada} />
          )}
        </div>
      </div>

      {/* Menu Mobile */}
      {menuOpen && (
        <div className="absolute top-14 left-0 w-full bg-white p-4 lg:hidden border-b-[2px]" style={{ borderColor: corPrincipal }}>
          <div
            className="flex items-center bg-white rounded-full shadow-md px-4 py-2 w-full border gap-2 transition-all duration-300 mb-4"
            style={{ borderColor: "#d1d5db" }}
          >
            <input
              type="text"
              placeholder="O que deseja encontrar?"
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 flex-1"
            />
            <FaSearch
              className="text-gray-400 cursor-pointer transition-colors duration-200"
              onMouseEnter={(e) => (e.currentTarget.style.color = hexToRGBA(corPrincipal, 0.6))}
              onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
            />
          </div>

          <nav className="flex flex-col gap-3">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`py-1 transition duration-200 hover:bg-gray-200 rounded px-2 ${
                  location.pathname === link.path ? "font-semibold" : ""
                }`}
                onClick={() => setMenuOpen(false)}
                style={location.pathname === link.path ? { color: corPrincipal } : {}}
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
