import React from "react";

export default function ModalConfirmacao({ 
  isOpen, 
  onClose, 
  onConfirm, 
  titulo = "Confirmar ação",
  mensagem = "Tem certeza que deseja continuar?",
  textoBotaoConfirmar = "Confirmar",
  textoBotaoCancelar = "Cancelar",
  corBotaoConfirmar = "#ef4444" // vermelho padrão
}) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fadeIn">
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 className="text-xl font-bold text-gray-800">{titulo}</h3>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p className="text-gray-600 text-base leading-relaxed">{mensagem}</p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end border-t border-gray-200">
          <button
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-medium text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 transform hover:scale-105"
          >
            {textoBotaoCancelar}
          </button>
          <button
            onClick={() => {
              onConfirm();
              onClose();
            }}
            style={{ backgroundColor: corBotaoConfirmar }}
            className="px-5 py-2.5 rounded-lg font-medium text-white hover:opacity-90 transition-all duration-200 transform hover:scale-105 shadow-md"
          >
            {textoBotaoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
