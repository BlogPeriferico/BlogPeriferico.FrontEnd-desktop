// src/pages/Register.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Periferia from "/src/assets/images/BackGroundImg.png";
import AuthService from "../../services/AuthService";

export default function Register() {
  const navigate = useNavigate();
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  const handleChange = (e) => {
    let value = e.target.value;
    
    // Remove espaços dos campos de email e senha
    if (e.target.name === 'email' || e.target.name === 'senha') {
      value = value.replace(/\s/g, '');
      // Atualiza o valor do input diretamente para garantir a remoção visual dos espaços
      e.target.value = value;
    }
    
    setForm({ ...form, [e.target.name]: value });
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

  // Estilos inline removidos


  const entrarComoVisitante = () => {
    navigate("/quebrada-informa");
  };

  return (
    <div className="fixed inset-0 w-full h-full overflow-hidden">
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center"
        style={{ backgroundImage: `url(${Periferia})` }}
      >
        <div className="absolute inset-0 bg-black/40"></div>
      </div>

      <div className="relative z-10 w-full h-full flex flex-col md:flex-row">
        {/* Painel do formulário */}
        <div className="w-full md:w-[45%] bg-white/70 p-6 md:p-8 lg:p-12 shadow-lg flex flex-col justify-center overflow-y-auto min-h-screen md:min-h-full">
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
              maxLength={60}
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
              onKeyDown={(e) => {
                // Impede a inserção de espaços
                if (e.key === ' ' || e.key === 'Spacebar') {
                  e.preventDefault();
                  return false;
                }
                // Limita o comprimento do texto
                if (e.target.value.length >= 60 && e.key !== 'Backspace' && e.key !== 'Delete' && !e.metaKey) {
                  e.preventDefault();
                  return false;
                }
              }}
              maxLength={60}
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
                onKeyDown={(e) => {
                  // Impede a inserção de espaços
                  if (e.key === ' ' || e.key === 'Spacebar') {
                    e.preventDefault();
                    return false;
                  }
                  // Limita o comprimento do texto
                  if (e.target.value.length >= 60 && e.key !== 'Backspace' && e.key !== 'Delete' && !e.metaKey) {
                    e.preventDefault();
                    return false;
                  }
                }}
                maxLength={60}
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

        {/* Painel da direita - Apenas em desktop */}
        <div className="hidden md:flex md:w-[55%] flex-col justify-center items-center p-4 lg:p-8 text-white bg-black/30" style={{ maxHeight: '100vh' }}>
          <div className="max-w-md mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-center px-4">
              BlogPeriférico
            </h1>
            <p className="text-xl md:text-2xl text-center text-gray-200 px-4">
              Junte-se à nossa comunidade!
            </p>
          </div>
        </div>
      </div>

    </div>
  );
}
