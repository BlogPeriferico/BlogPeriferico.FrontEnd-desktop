import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ModalAuth = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('login');
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleTabChange = (tab) => {
    setActiveTab(tab);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    // Lógica de autenticação será implementada aqui
    if (activeTab === 'login') {
      console.log('Fazendo login...');
    } else {
      console.log('Criando conta...');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden animate-fadeIn">
        {/* Header com abas */}
        <div className="flex border-b border-gray-200">
          <button
            className={`flex-1 py-4 font-medium text-sm transition-colors ${
              activeTab === 'login'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('login')}
          >
            Entrar
          </button>
          <button
            className={`flex-1 py-4 font-medium text-sm transition-colors ${
              activeTab === 'register'
                ? 'text-blue-600 border-b-2 border-blue-600'
                : 'text-gray-500 hover:text-gray-700'
            }`}
            onClick={() => handleTabChange('register')}
          >
            Cadastrar
          </button>
        </div>

        {/* Conteúdo do formulário */}
        <div className="p-6">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">
            {activeTab === 'login' ? 'Acesse sua conta' : 'Crie sua conta'}
          </h2>
          
          <form onSubmit={handleSubmit}>
            {activeTab === 'register' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nome completo
                </label>
                <input
                  type="text"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                  placeholder="Seu nome completo"
                  required
                />
              </div>
            )}
            
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                E-mail
              </label>
              <input
                type="email"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="seu@email.com"
                required
              />
            </div>
            
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Senha
              </label>
              <input
                type="password"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition"
                placeholder="••••••••"
                required
                minLength={6}
              />
              {activeTab === 'register' && (
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
                {activeTab === 'login' ? 'Entrar' : 'Criar conta'}
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
          
          {activeTab === 'login' && (
            <div className="mt-4 text-center">
              <button
                type="button"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline focus:outline-none"
                onClick={() => navigate('/recuperar-senha')}
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
