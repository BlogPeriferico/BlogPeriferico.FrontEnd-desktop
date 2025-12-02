// src/components/modals/ModalVisitantes.jsx
import React, { useEffect, useCallback } from "react";
import { FiAlertCircle, FiLogIn, FiX, FiLock, FiUserPlus } from "react-icons/fi";

function ModalVisitantesBase({ abrir, onClose, onLogin }) {
  useEffect(() => {
    if (abrir) {
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
      return () => {
        document.body.style.overflow = originalOverflow || "auto";
      };
    }
  }, [abrir]);

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") onClose();
    },
    [onClose]
  );

  const handleOverlayClick = useCallback(() => {
    onClose();
  }, [onClose]);

  if (!abrir) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className="relative w-full max-w-[95vw] sm:max-w-md md:max-w-lg lg:max-w-xl xl:max-w-2xl bg-white rounded-xl shadow-2xl overflow-hidden border border-blue-100"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-visitantes-titulo"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Cabeçalho */}
        <div className="relative p-6 pb-4">
          <button
            onClick={onClose}
            className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors"
            aria-label="Fechar"
          >
            <FiX size={24} />
          </button>
          
          <div className="text-center">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-blue-50 to-blue-100 mb-4">
              <FiLock className="h-8 w-8 text-blue-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800">Acesso Restrito</h2>
            <p className="mt-2 text-gray-500">Faça login para continuar</p>
          </div>
        </div>

        {/* Corpo */}
        <div className="px-6 pb-6">
          <div className="space-y-5">
            <div className="rounded-xl bg-blue-50 p-4 md:p-5 border border-blue-100">
              <p className="text-center text-blue-700 font-medium text-base sm:text-lg">
                Você precisa estar logado para acessar este conteúdo
              </p>
            </div>

            <div className="space-y-3 sm:flex sm:space-y-0 sm:space-x-3">
              <button
                onClick={onLogin}
                className="w-full flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-medium py-3 px-4 rounded-lg shadow-md hover:shadow-lg transform hover:-translate-y-0.5 transition-all duration-200 text-sm sm:text-base"
              >
                <FiLogIn className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Fazer Login</span>
              </button>

              <button
                onClick={onLogin}
                className="w-full flex items-center justify-center gap-2 bg-white text-blue-600 font-medium py-3 px-4 rounded-lg border-2 border-blue-100 hover:border-blue-200 hover:bg-blue-50 transition-all duration-200 text-sm sm:text-base"
              >
                <FiUserPlus className="h-4 w-4 sm:h-5 sm:w-5" />
                <span>Criar Conta</span>
              </button>
            </div>
          </div>
        </div>

        {/* Rodapé */}
        <div className="bg-gray-50 px-6 py-4 border-t border-gray-100">
          <p className="text-center text-xs text-gray-500">
            Ao continuar, você concorda com nossos{' '}
            <a href="/termos" className="text-blue-600 hover:underline font-medium">
              Termos
            </a>{' '}
            e{' '}
            <a href="/privacidade" className="text-blue-600 hover:underline font-medium">
              Política de Privacidade
            </a>
          </p>
        </div>
      </div>
    </div>
  );
}

export const ModalVisitantes = React.memo(ModalVisitantesBase);
