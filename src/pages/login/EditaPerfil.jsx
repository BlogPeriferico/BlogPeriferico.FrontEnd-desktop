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
    <div
      className="relative w-full h-[100dvh] font-poppins bg-center bg-cover overflow-hidden"
      style={{ backgroundImage: `url(${FundoSaoPaulo})` }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Painel principal (sempre 100dvh) */}
      <div className="relative z-10 h-full flex flex-col md:flex-row">
        {/* Esquerda - Formulário */}
        <div className="flex-1 md:w-[45%] bg-white/70 p-8 md:p-12 shadow-lg flex flex-col justify-center">
          <h2 className="text-2xl md:text-3xl text-center font-bold mb-2 text-black">
            Editar Dados
          </h2>
          <h3 className="text-base md:text-lg text-center font-medium mb-8 text-[#5D5D5D]">
            Edite sua conta
          </h3>

          {/* Input de email */}
          <input
            type="email"
            placeholder="Nome de Usuário/Email"
            className="w-full mb-5 px-5 py-3 rounded-md text-black placeholder-gray-400 
                       border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-400 
                       outline-none transition-all duration-400 ease-in-out transform 
                       hover:scale-[1.01] focus:scale-[1.02]"
          />

          {/* Input de senha */}
          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              className="w-full px-5 py-3 rounded-md text-black placeholder-gray-400 pr-10
                         border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-400 
                         outline-none transition-all duration-400 ease-in-out transform 
                         hover:scale-[1.01] focus:scale-[1.02]"
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
              onClick={() => setShowPassword(!showPassword)}
            >
              <img
                src={showPassword ? EyeOpen : EyeClose}
                alt="toggle senha"
                className="w-5 h-5"
              />
            </button>
          </div>

          <button className="w-full bg-[#828282] text-white py-3 text-lg rounded-md mb-6 transition-all duration-300 hover:scale-105 cursor-pointer">
           Salvar alterações
          </button>

          {/* Separador */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-400"></div>
            <span className="px-3 text-gray-500 text-sm">ou</span>
            <div className="flex-grow border-t border-gray-400"></div>
          </div>

          {/* Botão visitante */}
          <button
            className="w-full bg-white/40 py-3 rounded-md mb-6 transition-all duration-300 hover:scale-105 cursor-pointer"
               onClick={() => navigate("/quebrada-informa")}
          >
            Desistir
          </button>

          <p className="text-sm text-center text-black mt-6">
            Qualquer alteração será permanente!{" "}     
          </p>
        </div>

        {/* Direita - Texto (esconde em mobile) */}
        <div className="hidden md:flex flex-1 md:w-[55%] flex-col justify-center items-center text-white px-8 md:px-12">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6">
            BlogPeriférico
          </h2>
          <h3 className="text-lg md:text-xl lg:text-2xl font-medium text-gray-200 text-center">
            Bem-vindo ao blog periférico!
          </h3>
        </div>
      </div>
    </div>
  );
}
