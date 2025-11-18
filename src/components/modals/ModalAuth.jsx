import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

const ModalAuth = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState("login");
  const navigate = useNavigate();
  const dialogRef = useRef(null);

  if (!isOpen) return null;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica de autenticação será implementada aqui
    if (activeTab === "login") {
      // Lógica de login
    } else {
      // Lógica de criação de conta
    }
  };

  // Foco inicial e trap básico de foco dentro do modal
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length) {
        focusable[0].focus();
      }
    }
  }, [isOpen, activeTab]);

  const handleKeyDown = (e) => {
    // ESC fecha o modal
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose();
      return;
    }

    // Tab não deixa o foco sair do modal
    if (e.key === "Tab" && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (!focusable.length) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (e.shiftKey) {
        // Shift + Tab
        if (document.activeElement === first) {
          e.preventDefault();
          last.focus();
        }
      } else {
        // Tab normal
        if (document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }
  };

  const handleOverlayClick = () => {
    onClose();
  };

  const handleDialogClick = (e) => {
    e.stopPropagation();
  };

  const isLogin = activeTab === "login";

  const loginTabId = "auth-tab-login";
  const registerTabId = "auth-tab-register";
  const panelId = "auth-tab-panel";
  const titleId = "auth-modal-title";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={panelId}
        onClick={handleDialogClick}
        onKeyDown={handleKeyDown}
      >
        {/* Header com abas */}
        <div
          className="flex border-b border-gray-200"
          role="tablist"
          aria-label="Escolha entre entrar ou cadastrar"
        >
          <button
            id={loginTabId}
            role="tab"
            aria-selected={isLogin}
            aria-controls={panelId}
            tabIndex={isLogin ? 0 : -1}
            className={`flex-1 py-4 font-medium text-sm transition-colors ${
              isLogin
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => handleTabChange("login")}
            type="button"
          >
            Entrar
          </button>
          <button
            id={registerTabId}
            role="tab"
            aria-selected={!isLogin}
            aria-controls={panelId}
            tabIndex={!isLogin ? 0 : -1}
            className={`flex-1 py-4 font-medium text-sm transition-colors ${
              !isLogin
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
            onClick={() => handleTabChange("register")}
            type="button"
          >
            Cadastrar
          </button>
        </div>

        {/* Conteúdo do formulário */}
        <div
          className="p-6"
          role="tabpanel"
          id={panelId}
          aria-labelledby={isLogin ? loginTabId : registerTabId}
        >
          <h2 id={titleId} className="text-2xl font-bold text-gray-800 mb-6">
            {isLogin ? "Acesse sua conta" : "Crie sua conta"}
          </h2>

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="mb-4">
                <label
                  htmlFor="auth-nome"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Nome completo
                </label>
                <input
                  id="auth-nome"
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Seu nome completo"
                  required
                />
              </div>
            )}

            <div className="mb-4">
              <label
                htmlFor="auth-email"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                E-mail
              </label>
              <input
                id="auth-email"
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div className="mb-6">
              <label
                htmlFor="auth-senha"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Senha
              </label>
              <input
                id="auth-senha"
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
                required
                minLength={6}
              />
              {!isLogin && (
                <p className="mt-1 text-xs text-gray-500">
                  Mínimo de 6 caracteres
                </p>
              )}
            </div>

            <div className="space-y-3">
              <button
                type="submit"
                className="w-full bg-blue-600 text-white py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
              >
                {isLogin ? "Entrar" : "Criar conta"}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full border border-gray-300 text-gray-700 py-2.5 rounded-lg font-medium hover:bg-gray-50 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
              >
                Cancelar
              </button>
            </div>
          </form>

          {isLogin && (
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                onClick={() => navigate("/recuperar-senha")}
              >
                Esqueceu sua senha?
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModalAuth;
