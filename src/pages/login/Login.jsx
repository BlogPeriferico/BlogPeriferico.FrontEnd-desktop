// src/pages/Login.jsx
import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import FundoSaoPaulo from "/src/assets/images/BackGroundImg.png";
import EyeOpen from "../../assets/images/view.png";
import EyeClose from "../../assets/images/hide.png";
import AuthService from "../../services/AuthService";
import { UserContext } from "../../contexts/UserContext";

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  const { login } = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Login normal
  const handleLogin = async (e) => {
    e.preventDefault();
    if (!email || !senha) {
      setMensagem("Por favor, preencha todos os campos");
      return;
    }
    
    setIsLoading(true);
    setMensagem("");
    
    try {
      // 1. Faz o login no servidor para obter o token
      const data = await AuthService.login({ email, senha });
      
      if (!data || !data.token) {
        throw new Error("Token não recebido do servidor");
      }
      
      console.log("✅ Token recebido:", data.token);
      
      // 2. Salva o token no localStorage
      localStorage.setItem("token", data.token);
      
      // 3. Atualiza o contexto do usuário
      const userData = await login({ token: data.token });
      
      if (!userData) {
        throw new Error("Falha ao carregar os dados do usuário");
      }
      
      console.log("✅ Usuário autenticado com sucesso:", userData);
      setMensagem("Login realizado com sucesso!");
      
      // 4. Redireciona ou chama o callback de sucesso
      if (onLoginSuccess) {
        onLoginSuccess();
      } else {
        navigate("/");
      }
    } catch (err) {
      console.error(
        "Erro no login:",
        err.response ? err.response.data : err.message
      );
      setMensagem(
        "Falha no login: " + (err.response ? err.response.data : err.message)
      );
    } finally {
      setIsLoading(false);
    }
  };

  // Entrar como visitante
  const entrarComoVisitante = (e) => {
    e.preventDefault();
    // Remove qualquer token antigo
    localStorage.removeItem("token");
    localStorage.removeItem("email");
    localStorage.removeItem("role");

    // Define role visitante
    localStorage.setItem("userRole", "ROLE_VISITANTE");

    // Usa o callback de sucesso se fornecido, senão redireciona para a página inicial
    if (onLoginSuccess) {
      onLoginSuccess();
    } else {
      navigate("/");
    }
  };

  return (
    <div
      className="relative w-full h-[100dvh] font-poppins bg-center bg-cover overflow-hidden"
      style={{ backgroundImage: `url(${FundoSaoPaulo})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 h-full flex flex-col md:flex-row">
        {/* Painel do formulário */}
        <div className="flex-1 md:w-[45%] bg-white/70 p-8 md:p-12 shadow-lg flex flex-col justify-center">
          {mensagem && (
            <div className={`p-3 mb-4 rounded-md text-center ${
              mensagem.includes('sucesso') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
            }`}>
              {mensagem}
            </div>
          )}
          <div className="relative mb-6">
            <button
              onClick={() => navigate(-1)}
              className="absolute -left-2 -top-2 p-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              <FaArrowLeft className="text-xl" />
            </button>
            <h2 className="text-2xl md:text-3xl text-center font-bold mb-2 text-black">
              Login
            </h2>
            <h3 className="text-base md:text-lg text-center font-medium text-[#5D5D5D]">
              Entre com seu email e senha
            </h3>
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full mb-5 px-5 py-3 rounded-md text-black placeholder-gray-400 border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-400 outline-none transition-all duration-400 ease-in-out transform hover:scale-[1.01] focus:scale-[1.02]"
            required
            disabled={isLoading}
          />

          <div className="relative mb-6">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Senha"
              value={senha}
              onChange={(e) => setSenha(e.target.value)}
              className="w-full px-5 py-3 rounded-md text-black placeholder-gray-400 pr-10 border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-400 outline-none transition-all duration-400 ease-in-out transform hover:scale-[1.01] focus:scale-[1.02]"
              required
              minLength={6}
              disabled={isLoading}
            />
            <button
              type="button"
              className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 focus:outline-none"
              onClick={() => setShowPassword(!showPassword)}
              disabled={isLoading}
            >
              <img
                src={showPassword ? EyeOpen : EyeClose}
                alt={showPassword ? "Ocultar senha" : "Mostrar senha"}
                className="w-5 h-5"
              />
            </button>
          </div>

          <button
            type="submit"
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full text-white py-3 text-lg rounded-md mb-6 transition-all duration-300 ${isLoading ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#828282] hover:scale-105 cursor-pointer'}`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Entrando...
              </div>
            ) : 'Entrar'}
          </button>

          <p className="text-red-500 text-center mb-4">{mensagem}</p>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-400"></div>
            <span className="px-3 text-gray-500 text-sm">ou</span>
            <div className="flex-grow border-t border-gray-400"></div>
          </div>

          <button
            type="button"
            className={`w-full bg-white/40 py-3 rounded-md mb-6 transition-all duration-300 ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:scale-105 cursor-pointer'}`}
            onClick={entrarComoVisitante}
            disabled={isLoading}
          >
            {isLoading ? 'Carregando...' : 'Entrar como visitante'}
          </button>

          <div className="mt-6 text-center">
            <p className="text-sm text-black">
              Não tem uma conta?{" "}
              <button
                type="button"
                className="text-blue-500 font-semibold hover:underline focus:outline-none"
                onClick={() => navigate("/register")}
              >
                Registre-se
              </button>
            </p>
          </div>
        </div>

        {/* Painel do lado direito */}
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
