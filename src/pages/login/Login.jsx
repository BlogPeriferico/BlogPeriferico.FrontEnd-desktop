// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import Onda from "../../assets/images/Onda.png";
import Periferia from "../../assets/images/periferia.png";

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const entrarComoVisitante = () => {
    localStorage.setItem("userRole", "visitante");
    navigate("/quebrada-informa");
  };

  return (
    <div className="flex h-screen w-full font-poppins overflow-hidden">
      {/* Lado esquerdo: Formulário */}
      <div className="relative w-1/2 bg-white z-10 flex flex-col justify-center px-16">
        <h2 className="text-3xl text-center font-bold mb-6">Fazer Login</h2>
   
        <input
          type="email"
          placeholder="Nome de Usuário/Email"
          className="w-full mb-4 px-4 py-3 border rounded-md"
        />

        <div className="relative mb-4">
          <input
            type={showPassword ? "text" : "password"}
            placeholder="Senha"
            className="w-full px-4 py-3 border rounded-md pr-10"
          />
          <button
            type="button"
            className="absolute right-3 top-3 text-gray-500 trasition-all duration-600"
            onClick={() => setShowPassword(!showPassword)}
          >
            {showPassword ? "🙈" : "👁️"}
          </button>
        </div>

        <button className="w-full bg-[#2C2C2C] text-white py-3 rounded-md mb-4 transition-all hover: duration-300 hover:scale-105 cursor-pointer">
          Fazer Login
        </button>

        <button
          className="w-full bg-gray-100 border border-gray-300 text-gray-700 py-3 rounded-md mb-6 transition-all duration-300 hover:scale-105 hover:border-black cursor-pointer"
          onClick={entrarComoVisitante}
        >
          Entrar como visitante
        </button>

        <p className="text-sm text-center text-gray-500">
          Já tem uma conta ?{" "}
          <button
            className="text-black font-semibold"
            onClick={() => navigate("/register")}
          >
            Cadastre-se
          </button>
        </p>
      </div>

      {/* Onda */}
      <img
        src={Onda}
        alt="onda divisória"
        className="absolute inset-0 w-full h-full object-cover pointer-events-none z-0"
        style={{ zIndex: 5 }}
      />

      {/* Lado direito: Imagem e texto */}
      <div className="w-1/2 relative z-0">
        <img
          src={Periferia}
          alt="fundo"
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 flex flex-col justify-center items-center text-white text-center z-10 bg-black bg-opacity-40">
          <h1 className="text-4xl font-bold text-orange-500 mb-2">
            BlogPeriferico
          </h1>
          <p className="text-lg">Bem-vindo ao blog periférico!</p>
          <h2 className="text-3xl font-bold mt-2">Login</h2>
        </div>
      </div>
    </div>
  );
}
