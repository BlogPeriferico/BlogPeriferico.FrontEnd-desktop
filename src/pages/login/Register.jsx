// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash, FaChevronDown } from "react-icons/fa";
import Periferia from "/src/assets/images/BackGroundImg.png";
import AuthService from "../../services/AuthService";

export default function Register() {
  const navigate = useNavigate();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [showScrollButton, setShowScrollButton] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await AuthService.register(form);
      alert("Usuário registrado com sucesso!");
      navigate("/");
    } catch (err) {
      console.error(
        "Erro ao registrar:",
        err.response ? err.response.data : err
      );
      alert("Erro ao registrar usuário. Verifique os dados.");
    }
  };

  const styles = `
    @keyframes bounce {
      0%, 100% {
        transform: translateY(0) translateX(-50%);
      }
      50% {
        transform: translateY(-10px) translateX(-50%);
      }
    }
    .animate-bounce-slow {
      animation: bounce 2s infinite;
    }
  `;

  useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);

    const checkScroll = () => {
      const hasScrollableContent =
        document.body.scrollHeight > window.innerHeight;
      const isAtBottom =
        window.innerHeight + window.scrollY >=
        document.body.scrollHeight - 20;

      setShowScrollButton(hasScrollableContent && !isAtBottom);
    };

    const checkScrollWithDelay = () => {
      setTimeout(checkScroll, 100);
    };

    checkScrollWithDelay();

    window.addEventListener("load", checkScrollWithDelay);
    window.addEventListener("resize", checkScrollWithDelay);
    window.addEventListener("scroll", checkScroll);

    const scrollCheckInterval = setInterval(checkScroll, 1000);

    return () => {
      document.head.removeChild(styleElement);
      window.removeEventListener("load", checkScrollWithDelay);
      window.removeEventListener("resize", checkScrollWithDelay);
      window.removeEventListener("scroll", checkScroll);
      clearInterval(scrollCheckInterval);
    };
  }, []);

  const scrollDown = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: "smooth",
    });
  };

  const entrarComoVisitante = () => {
    navigate("/quebrada-informa");
  };

  return (
    <div className="relative w-full min-h-screen font-poppins overflow-x-hidden">
      {/* Imagem de fundo */}
      <img
        src={Periferia}
        alt="fundo"
        className="absolute inset-0 w-full h-full object-cover"
      />

      {/* Overlay escuro leve */}
      <div className="absolute inset-0 bg-black/40"></div>

      {/* Painel principal */}
      <div className="relative z-10 flex flex-col md:flex-row min-h-screen">
        {/* Esquerda - Formulário */}
        <div className="w-full md:w-[45%] bg-white/70 p-6 md:p-8 lg:p-12 shadow-lg flex flex-col justify-center min-h-screen md:min-h-0">
          <h2 className="text-2xl md:text-3xl text-center font-bold mb-6 text-black">
            Registre-se
          </h2>
          <p className="text-center text-[#5D5D5D] mb-8 md:mb-12 text-base md:text-lg">
            Crie seu perfil
          </p>

          <form onSubmit={handleSubmit}>
            <input
              type="text"
              name="nome"
              placeholder="Nome"
              value={form.nome}
              onChange={handleChange}
              required
              className="w-full mb-5 px-5 py-3 rounded-md text-black placeholder-gray-400 
                        border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-400 
                        outline-none transition-all duration-400 ease-in-out transform 
                        hover:scale-[1.01] focus:scale-[1.02]"
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              className="w-full mb-5 px-5 py-3 rounded-md text-black placeholder-gray-400 
                        border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-400 
                        outline-none transition-all duration-400 ease-in-out transform 
                        hover:scale-[1.01] focus:scale-[1.02]"
            />

            <div className="relative mb-6">
              <input
                type={mostrarSenha ? "text" : "password"}
                name="senha"
                placeholder="Senha"
                value={form.senha}
                onChange={handleChange}
                required
                className="w-full px-5 py-3 rounded-md text-black placeholder-gray-400 pr-10
                          border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-400 
                          outline-none transition-all duration-400 ease-in-out transform 
                          hover:scale-[1.01] focus:scale-[1.02]"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
                onClick={() => setMostrarSenha(!mostrarSenha)}
              >
                {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              type="submit"
              className="w-full bg-[#828282] text-white py-3 text-lg rounded-md mb-6 transition-all duration-300 hover:scale-105 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={Object.values(form).some((value) => !value.trim())}
            >
              Registrar
            </button>
          </form>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-400"></div>
            <span className="px-3 text-gray-500 text-sm">ou</span>
            <div className="flex-grow border-t border-gray-400"></div>
          </div>

          <button
            className="w-full bg-white/40 py-3 rounded-md mb-6 transition-all duration-300 hover:scale-105 cursor-pointer"
            onClick={entrarComoVisitante}
          >
            Entrar como visitante
          </button>

          <p className="text-center text-sm mt-6 text-black">
            Já tem uma conta?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-500 font-semibold hover:underline"
            >
              Faça login
            </button>
          </p>
        </div>

        {/* Direita - Texto */}
        <div className="hidden md:flex w-full md:w-[55%] flex-col justify-center items-center p-4 lg:p-8 text-white">
          <h2 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 text-center px-4">
            BlogPeriférico
          </h2>
          <h3 className="text-lg md:text-xl lg:text-2xl font-medium text-gray-200 text-center px-4">
            Bem-vindo ao blog periférico!
          </h3>
        </div>
      </div>

      {/* Botão de rolagem para baixo */}
      {showScrollButton && (
        <div className="fixed bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <button
            onClick={scrollDown}
            className="bg-white/80 hover:bg-white text-gray-800 rounded-full p-3 shadow-lg transition-all duration-300 hover:scale-110 flex items-center justify-center animate-bounce-slow"
            aria-label="Rolar para baixo"
          >
            <FaChevronDown className="text-xl" />
          </button>
        </div>
      )}
    </div>
  );
}
