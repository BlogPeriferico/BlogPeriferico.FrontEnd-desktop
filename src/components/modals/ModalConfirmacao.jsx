import React, { useCallback } from "react";

function ModalConfirmacaoBase({
  isOpen,
  onClose,
  onConfirm,
  titulo = "Confirmar ação",
  mensagem = "Tem certeza que deseja continuar?",
  textoBotaoConfirmar = "Confirmar",
  textoBotaoCancelar = "Cancelar",
  corBotaoConfirmar = "#ef4444", // vermelho padrão
}) {
  if (!isOpen) return null;

  const handleKeyDown = useCallback(
    (event) => {
      if (event.key === "Escape") {
        onClose();
      }
    },
    [onClose]
  );

  const handleOverlayClick = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleConfirmClick = useCallback(() => {
    onConfirm();
    onClose();
  }, [onConfirm, onClose]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
      onKeyDown={handleKeyDown}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-confirm-title"
        aria-describedby="modal-confirm-message"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3
            id="modal-confirm-title"
            className="text-xl font-bold text-gray-800"
          >
            {titulo}
          </h3>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p
            id="modal-confirm-message"
            className="text-gray-600 text-base leading-relaxed"
          >
            {mensagem}
          </p>
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 flex gap-3 justify-end border-t border-gray-200">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-lg font-medium text-gray-700 bg-white border-2 border-gray-300 hover:bg-gray-100 hover:border-gray-400 transition-all duration-200 transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            {textoBotaoCancelar}
          </button>
          <button
            type="button"
            onClick={handleConfirmClick}
            style={{ backgroundColor: corBotaoConfirmar }}
            className="px-5 py-2.5 rounded-lg font-medium text-white hover:opacity-90 transition-all duration-200 transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
          >
            {textoBotaoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}

const ModalConfirmacao = React.memo(ModalConfirmacaoBase);
export default ModalConfirmacao;
