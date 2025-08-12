import React from "react";
import { useNavigate } from "react-router-dom";
import Periferia from "../../assets/images/periferia.png";

export default function Register() {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col lg:flex-row items-center justify-center w-full h-screen gap-x-6 overflow-hidden">
      {/* Formulário */}
      <div className="w-full lg:w-1/2 flex justify-center items-center px-4">
        <div className="bg-white rounded-2xl p-12 border border-gray-200 shadow-xl w-full max-w-2xl">
          <h2 className="text-4xl font-bold text-center mb-4">Cadastro</h2>
          <p className="text-center text-gray-500 mb-8 text-lg">
            Crie sua conta
          </p>

          <input
            type="text"
            placeholder="Nome"
            className="w-full mb-5 px-5 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-lg"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-5 px-5 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-lg"
          />
          <input
            type="password"
            placeholder="Senha"
            className="w-full mb-6 px-5 py-3 border rounded-md focus:outline-none focus:ring-2 focus:ring-gray-500 text-lg"
          />

          <button className="w-full bg-green-500 text-white py-3 text-lg rounded-md transition duration-300 hover:bg-green-600 hover:scale-105">
            Cadastrar
          </button>

          <p className="text-center text-sm mt-6">
            Já tem uma conta?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-blue-600 transition duration-300 hover:underline"
            >
              Faça login
            </button>
          </p>
        </div>
      </div>

      {/* Imagem e texto */}
      <div className="hidden lg:block w-1/2 h-screen relative">
        <img
          src={Periferia}
          alt="fundo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center bg-black bg-opacity-60">
          <h1 className="text-4xl font-bold text-orange-500 mb-2">
            BlogPeriférico
          </h1>
          <p className="text-lg">Bem-vindo ao blog periférico!</p>
        </div>
      </div>
    </div>
  );
}
