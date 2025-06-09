import React from 'react';
import { useNavigate } from 'react-router-dom';

export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md">
      <h2 className="text-3xl font-bold text-center mb-2">Cadastro</h2>
      <p className="text-center text-gray-500 mb-6">Crie sua conta</p>

      <input type="text" placeholder="Nome" className="w-full mb-4 px-4 py-2 border rounded-md" />
      <input type="email" placeholder="Email" className="w-full mb-4 px-4 py-2 border rounded-md" />
      <input type="password" placeholder="Senha" className="w-full mb-4 px-4 py-2 border rounded-md" />

      <button className="w-full bg-green-600 text-white py-2 rounded-md hover:bg-green-700 mb-4">
        Cadastrar
      </button>

      <p className="text-center text-sm">
        Já tem uma conta?{" "}
        <button onClick={() => navigate('/')} className="text-blue-600 hover:underline">
          Faça login
        </button>
      </p>
    </div>
  );
}