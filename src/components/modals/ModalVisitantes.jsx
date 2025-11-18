// src/components/modals/ModalVisitantes.jsx
import React from "react";
import { FiAlertCircle, FiLogIn, FiX } from "react-icons/fi";

export function ModalVisitantes({ abrir, onClose, onLogin }) {
  if (!abrir) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl w-[95%] sm:w-[90%] md:w-[85%] lg:w-[80%] xl:w-[70%] 2xl:w-[60%] max-w-6xl h-auto max-h-[90vh] overflow-y-auto transform transition-all duration-300 scale-95 hover:scale-100 flex flex-col">
        {/* Cabeçalho */}
        <div className="relative p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                <FiAlertCircle size={24} />
              </div>
              <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-gray-900 dark:text-white">
                Acesso Restrito
              </h2>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400 transition-colors"
              aria-label="Fechar"
            >
              <FiX size={24} />
            </button>
          </div>
        </div>

        {/* Corpo */}
        <div className="p-8 pt-6 flex-1 flex flex-col justify-center">
          <div className="text-center mb-10">
            <p className="text-gray-600 dark:text-gray-300 text-xl sm:text-2xl lg:text-3xl leading-relaxed mb-6 sm:mb-8">
              Você precisa estar logado para criar uma publicação.
            </p>
            <p className="text-gray-600 dark:text-gray-300 text-xl sm:text-2xl lg:text-3xl leading-relaxed">
              Faça login para compartilhar seus posts com a comunidade!
            </p>
          </div>
          
          <div className="mt-12 flex flex-col sm:flex-row justify-center gap-6">
            <button
              onClick={onClose}
              className="px-8 py-4 text-lg sm:text-xl lg:text-2xl rounded-xl font-medium text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-all duration-200 flex-1 max-w-xs sm:max-w-sm md:max-w-md"
            >
              Continuar como visitante
            </button>
            <button
              onClick={onLogin}
              className="px-8 py-4 text-lg sm:text-xl lg:text-2xl rounded-xl font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-3 flex-1 max-w-xs sm:max-w-sm md:max-w-md"
            >
              <FiLogIn size={18} />
              <span>Fazer Login</span>
            </button>
          </div>
        </div>
        
        {/* Rodapé */}
        <div className="bg-gray-50 dark:bg-gray-700/30 px-8 py-5 border-t border-gray-100 dark:border-gray-700">
          <p className="text-sm sm:text-base text-center text-gray-500 dark:text-gray-400">
            Ao fazer login, você concorda com nossos{' '}
            <a href="/termos" className="text-blue-500 hover:underline">Termos de Uso</a> e{' '}
            <a href="/privacidade" className="text-blue-500 hover:underline">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
