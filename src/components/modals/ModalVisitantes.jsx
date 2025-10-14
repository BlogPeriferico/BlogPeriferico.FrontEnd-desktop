// src/components/modals/ModalVisitantes.jsx
import React from "react";

export function ModalVisitantes({ abrir, onClose, onLogin })  
 {
  if (!abrir) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 w-11/12 max-w-md mx-auto">
        <h2 className="text-xl font-bold mb-4 text-gray-800 dark:text-gray-100">
          Ação restrita
        </h2>
        <p className="mb-6 text-gray-700 dark:text-gray-200">
          Visitantes não podem acessar essa funcionalidade. Faça login para continuar.
        </p>
        <div className="flex justify-end gap-4">
          <button
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 text-gray-800 rounded transition"
            onClick={onClose}
          >
            Fechar
          </button>
          <button
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition"
            onClick={onLogin}
          >
            Login
          </button>
        </div>
      </div>
    </div>
  );
}
