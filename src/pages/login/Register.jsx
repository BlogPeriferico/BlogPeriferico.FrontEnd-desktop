// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Periferia from "/src/assets/images/BackGroundImg.png";

export default function Register() {
  const navigate = useNavigate();
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const entrarComoVisitante = () => {
    navigate("/quebrada-informa");
  };

  return (
    <div className="relative min-h-screen w-full font-poppins">
      {/* Imagem de fundo */}
      <img
        src={Periferia}
        alt="fundo"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay escuro leve */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Painel principal */}
      <div className="relative z-10 flex flex-col md:flex-row h-full">
        {/* Esquerda - Formulário */}
        <div className="w-full md:w-[45%] bg-[#fff] bg-opacity-70 p-8 md:p-12 shadow-lg flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl text-center font-bold mb-6 text-black">
            Registre-se
          </h2>
          <p className="text-center text-[#5D5D5D] mb-8 md:mb-12 text-base md:text-lg">
            Crie seu perfil
          </p>

          <input
            type="text"
            placeholder="Nome"
            className="w-full mb-5 px-5 py-3 rounded-md text-black placeholder-gray-400 focus:outline-none"
          />
          <input
            type="email"
            placeholder="Email"
            className="w-full mb-5 px-5 py-3 rounded-md text-black placeholder-gray-400 focus:outline-none"
          />

          {/* Campo senha com olho */}
          <div className="relative mb-6">
            <input
              type={mostrarSenha ? "text" : "password"}
              placeholder="Senha"
              className="w-full px-5 py-3 rounded-md text-black placeholder-gray-400 focus:outline-none"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
              onClick={() => setMostrarSenha(!mostrarSenha)}
            >
              {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
            </button>
          </div>

          <button className="w-full bg-[#828282] text-white py-3 text-lg rounded-md mb-6 transition-all duration-300 hover:scale-105 cursor-pointer">
            Registrar
          </button>

          {/* Separador */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-400"></div>
            <span className="px-3 text-gray-500 text-sm">ou</span>
            <div className="flex-grow border-t border-gray-400"></div>
          </div>

          {/* Botão visitante */}
          <button
            className="w-full bg-[#fff] bg-opacity-40 py-3 rounded-md mb-6 transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={entrarComoVisitante}
          >
            Entrar como visitante
          </button>

          <p className="text-center text-sm mt-6 text-black">
            Já tem uma conta?{" "}
            <button
              onClick={() => navigate("/")}
              className="text-blue-500 font-semibold hover:underline"
            >
              Faça login
            </button>
          </p>
        </div>

        {/* Direita - Texto (esconde em mobile) */}
        <div className="hidden md:flex w-full md:w-[55%] flex-col justify-center items-center text-white px-8 md:px-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            BlogPeriferico
          </h2>
          <h3 className="text-lg md:text-xl lg:text-2xl font-medium text-gray-200 text-center">
            Bem-vindo ao blog periférico!
          </h3>
        </div>
      </div>
    </div>
  );
}
