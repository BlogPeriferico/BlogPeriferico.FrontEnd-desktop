// src/components/modals/ModalVisitantes.jsx
import React from "react";
import { FiAlertCircle, FiLogIn, FiX } from "react-icons/fi";

export function ModalVisitantes({ abrir, onClose, onLogin }) {
  if (!abrir) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-2xl w-full max-w-md overflow-hidden transform transition-all duration-300 scale-95 hover:scale-100">
        {/* Cabeçalho */}
        <div className="relative p-6 pb-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="p-2 rounded-full bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400">
                <FiAlertCircle size={24} />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
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
        <div className="p-6 pt-4">
          <p className="text-gray-600 dark:text-gray-300 mb-6 text-lg leading-relaxed">
            Você precisa estar logado para criar uma publicação. Faça login para compartilhar suas notícias com a comunidade!
          </p>
          
          <div className="mt-8 flex flex-col sm:flex-row justify-end gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 rounded-lg font-medium text-gray-700 dark:text-gray-300 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 transition-colors duration-200 flex-1 sm:flex-none"
            >
              Continuar como visitante
            </button>
            <button
              onClick={onLogin}
              className="px-6 py-3 rounded-lg font-medium text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 transition-all duration-200 shadow-md hover:shadow-lg transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 flex-1 sm:flex-none"
            >
              <FiLogIn size={18} />
              <span>Fazer Login</span>
            </button>
          </div>
        </div>
        
        {/* Rodapé */}
        <div className="bg-gray-50 dark:bg-gray-700/30 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
          <p className="text-xs text-center text-gray-500 dark:text-gray-400">
            Ao fazer login, você concorda com nossos{' '}
            <a href="/termos" className="text-blue-500 hover:underline">Termos de Uso</a> e{' '}
            <a href="/privacidade" className="text-blue-500 hover:underline">Política de Privacidade</a>.
          </p>
        </div>
      </div>
    </div>
  );
}
