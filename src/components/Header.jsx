import React, { useState, useEffect } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { FaSearch, FaMapMarkerAlt, FaBars, FaUser } from "react-icons/fa";
import RegionSelector from "./RegionSelector";
import { useRegiao } from "../contexts/RegionContext";
import { useUser } from "../contexts/UserContext.jsx";
import { regionColors } from "../utils/regionColors";
import NoPicture from "../assets/images/NoPicture.webp";
import ModalAuth from "./modals/ModalAuth";

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { regiao, setRegiao } = useRegiao();
  const { user, isLoggedIn } = useUser(); // usuário atualizado do contexto
  const [menuOpen, setMenuOpen] = useState(false);
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  const [fotoAtual, setFotoAtual] = useState(NoPicture);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

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
        <Link
          to="/sobre"
          className="text-2xl font-bold"
          style={{ color: corPrincipal }}
        >
          BlogPeriferico
        </Link>
      </div>

      {/* Links de navegação */}
      <div className="flex-1">
        <nav className="hidden lg:flex gap-6 font-medium text-sm text-black ml-4">
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
      </div>

      {/* Barra de pesquisa */}
      <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-4">
        <div
          className="flex items-center bg-white rounded-full shadow-md px-4 py-2 w-full border gap-2 transition-all duration-300"
          style={{ 
            borderColor: "#d1d5db",
            minWidth: '200px',
            maxWidth: '500px'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.borderColor = corPrincipal;
            e.currentTarget.style.boxShadow = `0 0 10px ${hexToRGBA(
              corPrincipal,
              0.3
            )}`;
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
            onMouseEnter={(e) =>
              (e.currentTarget.style.color = hexToRGBA(corPrincipal, 0.6))
            }
            onMouseLeave={(e) => (e.currentTarget.style.color = "#9ca3af")}
          />
        </div>
      </div>

      {/* Direita: avatar + região */}
      <div className="flex items-center gap-4 lg:gap-6 flex-shrink-0 ml-2 lg:ml-4">
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="text-xl lg:hidden"
        >
          <FaBars />
        </button>

        {/* Botão de Login/Perfil */}
        {isLoggedIn ? (
          <div className="relative group">
            <img
              src={fotoAtual}
              alt={user?.nome || "Usuário"}
              className="w-9 h-9 rounded-full border-2 cursor-pointer hover:opacity-90 transition-all duration-300 hover:ring-2 hover:ring-offset-2"
              style={{ 
                borderColor: corPrincipal,
                boxShadow: `0 0 0 2px ${hexToRGBA(corPrincipal, 0.2)}`
              }}
              onClick={() => navigate("/perfil")}
            />
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        ) : (
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate("/login")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white transition-all duration-300
                hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2`}
              style={{
                background: `linear-gradient(135deg, ${corPrincipal}, ${hexToRGBA(corPrincipal, 0.8)})`,
                boxShadow: `0 4px 6px -1px ${hexToRGBA(corPrincipal, 0.2)}, 0 2px 4px -1px ${hexToRGBA(corPrincipal, 0.1)}`
              }}
            >
              <FaUser className="text-sm" />
              <span>Entrar</span>
            </button>
            <button
              onClick={() => navigate("/register")}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cadastrar
            </button>
          </div>
        )}

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

      {/* Menu Mobile */}
      {menuOpen && (
        <div
          className="absolute top-14 left-0 w-full bg-white p-4 lg:hidden border-b-[2px]"
          style={{ borderColor: corPrincipal }}
        >
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
              onMouseEnter={(e) =>
                (e.currentTarget.style.color = hexToRGBA(corPrincipal, 0.6))
              }
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
