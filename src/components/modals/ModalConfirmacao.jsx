import React, { useEffect, useRef } from "react";

export default function ModalConfirmacao({
  isOpen,
  onClose,
  onConfirm,
  titulo = "Confirmar ação",
  mensagem = "Tem certeza que deseja continuar?",
  textoBotaoConfirmar = "Confirmar",
  textoBotaoCancelar = "Cancelar",
  corBotaoConfirmar = "#ef4444", // vermelho padrão
}) {
  const dialogRef = useRef(null);

  // Foco inicial dentro do modal
  useEffect(() => {
    if (isOpen && dialogRef.current) {
      const focusable = dialogRef.current.querySelectorAll(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
      );
      if (focusable.length) {
        focusable[0].focus();
      }
    }
  }, [isOpen]);

  // ESC para fechar + trap de foco
  const handleKeyDown = (e) => {
    if (e.key === "Escape") {
      e.stopPropagation();
      onClose?.();
      return;
    }

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
    onClose?.();
  };

  const handleDialogClick = (e) => {
    e.stopPropagation();
  };

  if (!isOpen) return null;

  const titleId = "modal-confirmacao-titulo";
  const descId = "modal-confirmacao-descricao";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleOverlayClick}
    >
      <div
        ref={dialogRef}
        className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 overflow-hidden animate-fadeIn"
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        onClick={handleDialogClick}
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
          <h3 id={titleId} className="text-xl font-bold text-gray-800">
            {titulo}
          </h3>
        </div>

        {/* Body */}
        <div className="px-6 py-6">
          <p id={descId} className="text-gray-600 text-base leading-relaxed">
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
            onClick={() => {
              onConfirm?.();
              onClose?.();
            }}
            style={{ backgroundColor: corBotaoConfirmar }}
            className="px-5 py-2.5 rounded-lg font-medium text-white hover:opacity-90 transition-all duration-200 transform hover:scale-105 shadow-md focus:outline-none focus:ring-2 focus:ring-offset-2"
          >
            {textoBotaoConfirmar}
          </button>
        </div>
      </div>
    </div>
  );
}
