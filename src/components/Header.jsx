// src/components/Header.jsx
import React, {
  useState,
  useEffect,
  useRef,
  Suspense,
} from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  FaSearch,
  FaMapMarkerAlt,
  FaBars,
  FaUser,
  FaTimes,
} from "react-icons/fa";
import { useRegiao } from "../contexts/RegionContext";
import { useUser } from "../contexts/UserContext.jsx";
import { regionColors } from "../utils/regionColors";
import NoPicture from "../assets/images/NoPicture.webp";
import { buscarUsuarios } from "../services/UsuarioService";
import { buscarPosts } from "../services/PostService";
import { debounce } from "lodash";

// Lazy loading de componentes mais pesados
const RegionSelectorLazy = React.lazy(() => import("./RegionSelector"));
const SearchResultsLazy = React.lazy(() => import("./SearchResults"));
const PostSearchResultsLazy = React.lazy(() => import("./PostSearchResults"));

export default function Header() {
  const navigate = useNavigate();
  const location = useLocation();
  const { regiao, setRegiao } = useRegiao();
  const { user, isLoggedIn } = useUser();

  const [menuOpen, setMenuOpen] = useState(false);
  const [showRegionSelector, setShowRegionSelector] = useState(false);
  const [fotoAtual, setFotoAtual] = useState(NoPicture);

  const [searchTerm, setSearchTerm] = useState("");
  const [searchResults, setSearchResults] = useState({
    usuarios: [],
    posts: [],
  });
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isSearching, setIsSearching] = useState(false);
  const [activeSearchTab, setActiveSearchTab] = useState("usuarios");

  const searchInputRef = useRef(null);
  const searchContainerRef = useRef(null);

  const navLinks = [
    { path: "/quebrada-informa", label: "Quebrada Informa" },
    { path: "/doacoes", label: "Mão Amiga" },
    { path: "/achadinhos", label: "Achadinhos" },
    { path: "/vagas", label: "Corre Certo" },
  ];

  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";

  // Atualiza foto quando user mudar
  useEffect(() => {
    if (user?.fotoPerfil) {
      setFotoAtual(user.fotoPerfil);
    } else {
      setFotoAtual(NoPicture);
    }
  }, [user?.fotoPerfil]);

  const handleRegiaoSelecionada = (regiaoSelecionada) => {
    setRegiao(regiaoSelecionada);
    setShowRegionSelector(false);
  };

  const hexToRGBA = (hex, alpha = 1) => {
    const r = parseInt(hex.slice(1, 3), 16) || 0;
    const g = parseInt(hex.slice(3, 5), 16) || 0;
    const b = parseInt(hex.slice(5, 7), 16) || 0;
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  };

  // Busca com debounce
  const debouncedSearch = useRef(
    debounce(async (term, tab) => {
      if (!term.trim()) {
        setSearchResults({ usuarios: [], posts: [] });
        setIsSearching(false);
        return;
      }

      try {
        if (tab === "usuarios") {
          const usuarios = await buscarUsuarios(term);
          setSearchResults((prev) => ({ ...prev, usuarios }));
        } else {
          const posts = await buscarPosts(term);
          setSearchResults((prev) => ({ ...prev, posts }));
        }
      } catch (error) {
        console.error("Erro na busca:", error);
        setSearchResults((prev) => ({
          ...prev,
          [tab === "usuarios" ? "usuarios" : "posts"]: [],
        }));
      } finally {
        setIsSearching(false);
      }
    }, 300)
  ).current;

  // Atualiza a busca quando o termo ou aba mudam
  useEffect(() => {
    if (searchTerm.trim() === "") {
      setSearchResults({ usuarios: [], posts: [] });
      return;
    }

    setIsSearching(true);
    debouncedSearch(searchTerm, activeSearchTab);

    return () => {
      debouncedSearch.cancel();
    };
  }, [searchTerm, activeSearchTab, debouncedSearch]);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
  };

  const clearSearch = () => {
    setSearchTerm("");
    setSearchResults({ usuarios: [], posts: [] });
    if (searchInputRef.current) {
      searchInputRef.current.focus();
    }
  };

  const handleResultClick = () => {
    setSearchTerm("");
    setSearchResults({ usuarios: [], posts: [] });
    setIsSearchFocused(false);
  };

  // Fecha o dropdown de busca se clicar fora
  useEffect(() => {
    function handleClickOutside(event) {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target)
      ) {
        setIsSearchFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const renderSearchResultsContent = () => {
    if (isSearching) {
      return (
        <div className="p-4 text-center text-gray-500">Buscando...</div>
      );
    }

    if (activeSearchTab === "usuarios") {
      return searchResults.usuarios && searchResults.usuarios.length > 0 ? (
        <Suspense fallback={<div className="p-4 text-center text-gray-500">Carregando usuários...</div>}>
          <SearchResultsLazy
            results={searchResults.usuarios}
            searchTerm={searchTerm}
            onClose={handleResultClick}
            isLoading={isSearching && activeSearchTab === "usuarios"}
          />
        </Suspense>
      ) : (
        <div className="p-4 text-center text-gray-500">
          Nenhum usuário encontrado
        </div>
      );
    }

    // posts
    return searchResults.posts && searchResults.posts.length > 0 ? (
      <Suspense fallback={<div className="p-4 text-center text-gray-500">Carregando posts...</div>}>
        <PostSearchResultsLazy
          results={searchResults.posts}
          onClose={handleResultClick}
          isLoading={isSearching && activeSearchTab === "posts"}
        />
      </Suspense>
    ) : (
      <div className="p-4 text-center text-gray-500">
        Nenhum post encontrado
      </div>
    );
  };

  const renderSearchResults = () => {
    if (!isSearchFocused && !searchTerm) return null;

    return (
      <div className="absolute left-0 right-0 mt-2 bg-white rounded-lg shadow-xl z-50 overflow-hidden">
        {/* Abas */}
        <div className="flex border-b" role="tablist">
          <button
            type="button"
            onClick={() => setActiveSearchTab("usuarios")}
            className={`flex-1 py-2 font-medium text-sm ${
              activeSearchTab === "usuarios"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            role="tab"
            aria-selected={activeSearchTab === "usuarios"}
          >
            Usuários
          </button>
          <button
            type="button"
            onClick={() => setActiveSearchTab("posts")}
            className={`flex-1 py-2 font-medium text-sm ${
              activeSearchTab === "posts"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:bg-gray-50"
            }`}
            role="tab"
            aria-selected={activeSearchTab === "posts"}
          >
            Posts
          </button>
        </div>

        {/* Resultados */}
        <div className="max-h-80 overflow-y-auto">
          {renderSearchResultsContent()}
        </div>
      </div>
    );
  };

  return (
    <header
      className="w-full px-6 py-3 flex items-center justify-between shadow-md border-b-2 fixed top-0 left-0 z-50"
      style={{ borderColor: corPrincipal, backgroundColor: "#ffffff" }}
      role="banner"
    >
      {/* Logo */}
      <div className="flex items-center gap-4 flex-shrink-0">
        <Link
          to="/sobre"
          className="text-2xl font-bold"
          style={{ color: corPrincipal }}
          aria-label="Ir para página Sobre Nós"
        >
          BlogPeriferico
        </Link>
      </div>

      {/* Navegação desktop */}
      <div className="flex-1">
        <nav
          className="hidden lg:flex gap-6 font-medium text-sm text-black ml-4"
          aria-label="Navegação principal"
        >
          {navLinks.map((link) => {
            const isActive = location.pathname === link.path;
            return (
              <Link
                key={link.path}
                to={link.path}
                className={`transition duration-200 hover:underline ${
                  isActive ? "font-semibold" : ""
                }`}
                style={isActive ? { color: corPrincipal } : {}}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Barra de pesquisa desktop */}
      <div className="hidden lg:flex items-center flex-1 max-w-2xl mx-4">
        <div
          className="relative w-full max-w-2xl mx-4"
          ref={searchContainerRef}
        >
          <div
            className="flex items-center bg-white rounded-full shadow-md px-4 py-2 w-full border gap-2 transition-all duration-300"
            style={{
              borderColor: isSearchFocused ? corPrincipal : "#d1d5db",
              minWidth: "200px",
              boxShadow: isSearchFocused
                ? `0 0 0 2px ${hexToRGBA(corPrincipal, 0.2)}`
                : "none",
            }}
          >
            <FaSearch
              className="flex-shrink-0"
              style={{
                color: isSearchFocused ? corPrincipal : "#9ca3af",
              }}
              aria-hidden="true"
            />
            <input
              ref={searchInputRef}
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={
                activeSearchTab === "usuarios"
                  ? "Buscar usuários..."
                  : "Buscar posts..."
              }
              className="bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400 flex-1"
              onFocus={() => setIsSearchFocused(true)}
              aria-label="Buscar no Blog Periférico"
            />
            {searchTerm && (
              <button
                type="button"
                onClick={clearSearch}
                className="text-gray-400 hover:text-gray-600 transition-colors"
                aria-label="Limpar busca"
              >
                <FaTimes className="w-4 h-4" aria-hidden="true" />
              </button>
            )}
          </div>

          {(isSearchFocused || searchTerm) && renderSearchResults()}
        </div>
      </div>

      {/* Lado direito: menu e ações do usuário */}
      <div className="flex items-center gap-4 lg:gap-6">
        {/* Menu mobile toggle - Apenas em mobile */}
        <button
          type="button"
          onClick={() => setMenuOpen((prev) => !prev)}
          className="lg:hidden p-2 rounded-full hover:bg-gray-100 text-xl"
          aria-label={menuOpen ? "Fechar menu" : "Abrir menu de navegação"}
          aria-expanded={menuOpen}
        >
          {menuOpen ? <FaTimes aria-hidden="true" /> : <FaBars aria-hidden="true" />}
        </button>

        {/* Botão de perfil - Visível apenas quando logado */}
        {isLoggedIn && (
          <div className="relative group">
            <button
              type="button"
              onClick={() => navigate("/perfil")}
              className="focus:outline-none focus:ring-2 focus:ring-offset-2 rounded-full"
              aria-label="Ir para o seu perfil"
            >
              <img
                src={fotoAtual}
                alt={user?.nome || "Usuário"}
                className="w-9 h-9 rounded-full border-2 cursor-pointer hover:opacity-90 transition-all duration-300 hover:ring-2 hover:ring-offset-2 object-cover"
                style={{
                  borderColor: corPrincipal,
                  boxShadow: `0 0 0 2px ${hexToRGBA(corPrincipal, 0.2)}`,
                }}
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = NoPicture;
                }}
              />
            </button>
            <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
          </div>
        )}

        {/* Botões de Login/Cadastro - Apenas em desktop quando não logado */}
        {!isLoggedIn && (
          <div className="hidden lg:flex items-center gap-4">
            <button
              type="button"
              onClick={() => navigate("/login")}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white transition-all duration-300
                hover:shadow-lg hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2`}
              style={{
                background: `linear-gradient(135deg, ${corPrincipal}, ${hexToRGBA(
                  corPrincipal,
                  0.8
                )})`,
                boxShadow: `0 4px 6px -1px ${hexToRGBA(
                  corPrincipal,
                  0.2
                )}, 0 2px 4px -1px ${hexToRGBA(corPrincipal, 0.1)}`,
              }}
            >
              <FaUser className="text-sm" aria-hidden="true" />
              <span>Entrar</span>
            </button>
            <button
              type="button"
              onClick={() => navigate("/register")}
              className="text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors"
            >
              Cadastrar
            </button>
          </div>
        )}

        {/* Seletor de Região - Visível em todas as telas */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="w-8 h-8 flex items-center justify-center rounded-full border text-white duration-300 hover:scale-105 focus:outline-none focus:ring-2 focus:ring-offset-2"
            onClick={() => setShowRegionSelector((prev) => !prev)}
            style={{
              backgroundColor: corPrincipal,
              borderColor: corPrincipal,
            }}
            aria-label="Selecionar região"
          >
            <FaMapMarkerAlt aria-hidden="true" />
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
            <Suspense
              fallback={
                <div className="absolute top-10 right-0 bg-white shadow-md rounded-lg px-4 py-2 text-sm text-gray-500">
                  Carregando regiões...
                </div>
              }
            >
              <RegionSelectorLazy
                onClose={() => setShowRegionSelector(false)}
                onSelect={handleRegiaoSelecionada}
              />
            </Suspense>
          )}
        </div>
      </div>

      {/* Menu Mobile */}
      {menuOpen && (
        <div
          className="absolute top-14 left-0 w-full bg-white p-4 lg:hidden border-b-[2px] shadow-lg"
          style={{ borderColor: corPrincipal }}
        >
          {/* Botões de Login/Cadastro - Visíveis apenas em mobile */}
          {!isLoggedIn && (
            <div className="mb-4 pb-4 border-b border-gray-200">
              <div className="flex flex-col gap-3">
                <button
                  type="button"
                  onClick={() => {
                    navigate("/login");
                    setMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium rounded-lg text-white transition-all duration-300
                    hover:shadow-lg hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-offset-2`}
                  style={{
                    background: `linear-gradient(135deg, ${corPrincipal}, ${hexToRGBA(corPrincipal, 0.8)})`,
                    boxShadow: `0 4px 6px -1px ${hexToRGBA(corPrincipal, 0.2)}, 0 2px 4px -1px ${hexToRGBA(corPrincipal, 0.1)}`,
                  }}
                >
                  <FaUser className="text-sm" aria-hidden="true" />
                  <span>Entrar na Conta</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    navigate("/register");
                    setMenuOpen(false);
                  }}
                  className="w-full text-center py-2 text-sm font-medium text-gray-700 hover:text-gray-900 transition-colors border border-gray-300 rounded-lg hover:bg-gray-50"
                >
                  Criar Conta
                </button>
              </div>
            </div>
          )}
{/* Busca móvel */}
          <div className="relative w-full mb-4">
            <div className="relative" ref={searchContainerRef}>
              <div
                className="flex items-center bg-white rounded-full shadow-md px-4 py-2 w-full border gap-2 transition-all duration-300"
                style={{
                  borderColor: isSearchFocused ? corPrincipal : "#d1d5db",
                  boxShadow: isSearchFocused
                    ? `0 0 0 2px ${hexToRGBA(corPrincipal, 0.2)}`
                    : "none",
                }}
              >
                <FaSearch
                  className="flex-shrink-0"
                  style={{
                    color: isSearchFocused ? corPrincipal : "#9ca3af",
                  }}
                  aria-hidden="true"
                />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={handleSearchChange}
                  placeholder={
                    activeSearchTab === "usuarios"
                      ? "Buscar usuários..."
                      : "Buscar posts..."
                  }
                  className="w-full bg-transparent outline-none text-sm text-gray-700 placeholder-gray-400"
                  onFocus={() => setIsSearchFocused(true)}
                  aria-label="Buscar no Blog Periférico"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={clearSearch}
                    className="text-gray-400 hover:text-gray-600 transition-colors"
                    aria-label="Limpar busca"
                  >
                    <FaTimes className="w-4 h-4" aria-hidden="true" />
                  </button>
                )}
              </div>

              {(isSearchFocused || searchTerm) && (
                <div className="mt-1">
                  <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                    <div className="flex border-b" role="tablist">
                      <button
                        type="button"
                        onClick={() => setActiveSearchTab("usuarios")}
                        className={`flex-1 py-2 font-medium text-sm ${
                          activeSearchTab === "usuarios"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                        role="tab"
                        aria-selected={activeSearchTab === "usuarios"}
                      >
                        Usuários
                      </button>
                      <button
                        type="button"
                        onClick={() => setActiveSearchTab("posts")}
                        className={`flex-1 py-2 font-medium text-sm ${
                          activeSearchTab === "posts"
                            ? "text-blue-600 border-b-2 border-blue-600"
                            : "text-gray-500 hover:bg-gray-50"
                        }`}
                        role="tab"
                        aria-selected={activeSearchTab === "posts"}
                      >
                        Posts
                      </button>
                    </div>
                    <div className="max-h-80 overflow-y-auto">
                      {isSearching ? (
                        <div className="p-4 text-center text-gray-500">
                          Buscando...
                        </div>
                      ) : activeSearchTab === "usuarios" ? (
                        searchResults.usuarios &&
                        searchResults.usuarios.length > 0 ? (
                          <Suspense fallback={<div className="p-4 text-center text-gray-500">Carregando usuários...</div>}>
                            <SearchResultsLazy
                              results={searchResults.usuarios}
                              searchTerm={searchTerm}
                              onClose={() => {
                                handleResultClick();
                                setMenuOpen(false);
                              }}
                              isLoading={
                                isSearching &&
                                activeSearchTab === "usuarios"
                              }
                            />
                          </Suspense>
                        ) : (
                          <div className="p-4 text-center text-gray-500">
                            Nenhum usuário encontrado
                          </div>
                        )
                      ) : searchResults.posts &&
                        searchResults.posts.length > 0 ? (
                        <Suspense fallback={<div className="p-4 text-center text-gray-500">Carregando posts...</div>}>
                          <PostSearchResultsLazy
                            results={searchResults.posts}
                            onClose={() => {
                              handleResultClick();
                              setMenuOpen(false);
                            }}
                            isLoading={
                              isSearching && activeSearchTab === "posts"
                            }
                          />
                        </Suspense>
                      ) : (
                        <div className="p-4 text-center text-gray-500">
                          Nenhum post encontrado
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Links de navegação mobile */}
          <nav
            className="flex flex-col gap-3"
            aria-label="Navegação principal mobile"
          >
            {navLinks.map((link) => {
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`py-1 transition duration-200 hover:bg-gray-200 rounded px-2 ${
                    isActive ? "font-semibold" : ""
                  }`}
                  onClick={() => setMenuOpen(false)}
                  style={isActive ? { color: corPrincipal } : {}}
                >
                  {link.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}
    </header>
  );
}
