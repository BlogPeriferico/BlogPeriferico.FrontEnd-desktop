// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import FundoSaoPaulo from "/src/assets/images/BackGroundImg.png";
import EyeOpen from "../../assets/images/view.png";
import EyeClose from "../../assets/images/hide.png";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const entrarComoVisitante = () => {
    localStorage.setItem("userRole", "visitante");
    navigate("/quebrada-informa");
  };

  return (
    <div className="relative min-h-screen w-full font-poppins">
      {/* Imagem de fundo */}
      <img
        src={FundoSaoPaulo}
        alt="fundo"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay escuro leve */}
      <div className="absolute inset-0 bg-black bg-opacity-40"></div>

      {/* Painel principal dividido em 2 colunas */}
      <div className="relative z-10 flex min-h-screen">
        {/* Esquerda - Formulário */}
        <div className="w-[45%] bg-[#fff] bg-opacity-70 p-8 shadow-lg flex flex-col justify-center">
          <h2 className="text-3xl text-center font-bold mb-2 text-black">
            Login
          </h2>
          <h3 className="text-lg text-center font-medium mb-8 text-[#5D5D5D]">
            Entre com seu email e sua senha
          </h3>

          <input
            type="email"
            placeholder="Nome de Usuário/Email"
            className="w-full mb-4 px-4 py-3 rounded-md text-black placeholder-gray-400 focus:outline-none"
          />

          <div className="relative mb-4">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              className="w-full px-4 py-3 rounded-md text-black placeholder-gray-400 pr-10 focus:outline-none"
            />
            <button
              type="button"
              className="absolute right-3 top-3 text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              <img
                src={showPassword ? EyeOpen : EyeClose}
                alt="toggle senha"
                className="w-5 h-5"
              />
            </button>
          </div>

          <button className="w-full bg-[#828282] text-white py-3 rounded-md mb-4 transition-all duration-300 hover:scale-105 cursor-pointer">
            Login
          </button>

          {/* Separador */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-white-400"></div>
            <span className="px-3 text-gray-500 text-sm">ou</span>
            <div className="flex-grow border-t border-white-400"></div>
          </div>

          {/* Botão visitante */}
          <button
            className="w-full bg-[#fff] bg-opacity-50 py-3 rounded-md mb-6 transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={entrarComoVisitante}
          >
            Entrar como visitante
          </button>

          <p className="text-sm text-center text-black mt-6">
            Não tem uma conta?{" "}
            <button
              className="text-blue-400 font-semibold hover:underline"
              onClick={() => navigate("/register")}
            >
              Registre-se
            </button>
          </p>
        </div>

        {/* Direita - Texto de boas-vindas */}
        <div className="w-[55%] flex flex-col justify-center items-center text-white px-12">
          <h2 className="text-6xl font-bold mb-4">BlogPeriférico</h2>
          <h3 className="text-2xl font-medium text-gray-200 text-center">
            Bem-vindo ao blog periférico!
          </h3>
        </div>
      </div>
    </div>
  );
}
