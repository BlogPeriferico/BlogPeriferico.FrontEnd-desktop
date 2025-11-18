// src/pages/Register.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Periferia from "/src/assets/images/BackGroundImg.png";
import AuthService from "../../services/AuthService";

export default function Register() {
  const navigate = useNavigate();
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const [form, setForm] = useState({
    nome: "",
    email: "",
    senha: "",
  });

  const [mensagem, setMensagem] = useState("");
  const [tipoMensagem, setTipoMensagem] = useState(null); // "success" | "error" | null
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.nome || !form.email || !form.senha) {
      setMensagem("Preencha todos os campos.");
      setTipoMensagem("error");
      return;
    }

    if (form.senha.length < 6) {
      setMensagem("A senha deve ter no mínimo 6 caracteres.");
      setTipoMensagem("error");
      return;
    }

    setIsLoading(true);
    setMensagem("");
    setTipoMensagem(null);

    try {
      await AuthService.register(form);

      setMensagem(
        "Usuário registrado com sucesso! Redirecionando para o login..."
      );
      setTipoMensagem("success");

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (err) {
      console.error(
        "Erro ao registrar:",
        err.response ? err.response.data : err
      );
      const msg =
        err?.response?.data?.message ||
        err?.response?.data ||
        "Erro ao registrar usuário. Verifique os dados.";
      setMensagem(msg);
      setTipoMensagem("error");
    } finally {
      setIsLoading(false);
    }
  };

  const entrarComoVisitante = () => {
    navigate("/quebrada-informa");
  };

  const getMensagemClasses = () => {
    if (!tipoMensagem) return "bg-gray-100 text-gray-800";
    if (tipoMensagem === "success") return "bg-green-100 text-green-800";
    return "bg-red-100 text-red-800";
  };

  return (
    <div className="relative w-full h-screen font-poppins">
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
        <div className="w-full md:w-[45%] bg-white/70 p-8 md:p-12 shadow-lg flex flex-col justify-center h-full">
          {mensagem && (
            <div
              className={`p-3 mb-4 rounded-md text-center ${getMensagemClasses()}`}
            >
              {mensagem}
            </div>
          )}

          <h2 className="text-2xl md:text-3xl text-center font-bold mb-6 text-black">
            Registre-se
          </h2>
          <p className="text-center text-[#5D5D5D] mb-8 md:mb-12 text-base md:text-lg">
            Crie seu perfil
          </p>

          <form onSubmit={handleSubmit}>
            {/* Input Nome */}
            <input
              type="text"
              name="nome"
              placeholder="Nome"
              value={form.nome}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full mb-5 px-5 py-3 rounded-md text-black placeholder-gray-400 
                        border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-400 
                        outline-none transition-all duration-400 ease-in-out transform 
                        hover:scale-[1.01] focus:scale-[1.02]"
            />

            {/* Input Email */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              required
              disabled={isLoading}
              className="w-full mb-5 px-5 py-3 rounded-md text-black placeholder-gray-400 
                        border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-400 
                        outline-none transition-all duration-400 ease-in-out transform 
                        hover:scale-[1.01] focus:scale-[1.02]"
            />

            {/* Campo Senha com olho */}
            <div className="relative mb-6">
              <input
                type={mostrarSenha ? "text" : "password"}
                name="senha"
                placeholder="Senha"
                value={form.senha}
                onChange={handleChange}
                required
                minLength={6}
                disabled={isLoading}
                className="w-full px-5 py-3 rounded-md text-black placeholder-gray-400 pr-10
                          border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-400 
                          outline-none transition-all duration-400 ease-in-out transform 
                          hover:scale-[1.01] focus:scale-[1.02]"
              />
              <button
                type="button"
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600"
                onClick={() => setMostrarSenha(!mostrarSenha)}
                disabled={isLoading}
              >
                {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
              </button>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-[#828282] text-white py-3 text-lg rounded-md mb-6 transition-all duration-300 ${
                isLoading
                  ? "opacity-70 cursor-not-allowed"
                  : "hover:scale-105 cursor-pointer"
              }`}
            >
              {isLoading ? "Cadastrando..." : "Registrar"}
            </button>
          </form>

          {/* Separador */}
          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-400"></div>
            <span className="px-3 text-gray-500 text-sm">ou</span>
            <div className="flex-grow border-t border-gray-400"></div>
          </div>

          {/* Botão visitante */}
          <button
            className={`w-full bg-white/40 py-3 rounded-md mb-6 transition-all duration-300 ${
              isLoading
                ? "opacity-70 cursor-not-allowed"
                : "hover:scale-105 cursor-pointer"
            }`}
            onClick={entrarComoVisitante}
            disabled={isLoading}
          >
            Entrar como visitante
          </button>

          <p className="text-center text-sm mt-6 text-black">
            Já tem uma conta?{" "}
            <button
              onClick={() => navigate("/login")}
              className="text-blue-500 font-semibold hover:underline"
              disabled={isLoading}
            >
              Faça login
            </button>
          </p>
        </div>

        {/* Direita - Texto (esconde em mobile) */}
        <div className="hidden md:flex w-full md:w-[55%] flex-col justify-center items-center text-white px-8 md:px-12">
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
