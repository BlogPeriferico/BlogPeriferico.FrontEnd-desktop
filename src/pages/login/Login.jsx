// src/pages/Login.jsx
import React, { useState, useContext, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { FaArrowLeft, FaChevronDown } from "react-icons/fa";

import FundoSaoPaulo from "/src/assets/images/BackGroundImg.png";
import EyeOpen from "../../assets/images/view.png";
import EyeClose from "../../assets/images/hide.png";
import AuthService from "../../services/AuthService";
import { UserContext } from "../../contexts/UserContext";

// Estilo para a animação de pulo e esconder o ícone de olho nativo
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

  input[type="password"]::-ms-reveal,
  input[type="password"]::-ms-clear {
    display: none !important;
  }
  input[type="password"]::-webkit-contacts-auto-fill-button,
  input[type="password"]::-webkit-credentials-auto-fill-button {
    visibility: hidden;
    pointer-events: none;
    position: absolute;
    right: 0;
  }
`;

export default function Login({ onLoginSuccess }) {
  const navigate = useNavigate();
  
  // Adiciona o estilo ao documento
  React.useEffect(() => {
    const styleElement = document.createElement("style");
    styleElement.textContent = styles;
    document.head.appendChild(styleElement);
    
    return () => {
      // Limpa o estilo quando o componente for desmontado
      document.head.removeChild(styleElement);
    };
  }, []);
  const { login } = useContext(UserContext);
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [mensagem, setMensagem] = useState("");
  const [showScrollButton, setShowScrollButton] = useState(false);
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

      // Salva o token no localStorage
      localStorage.setItem("token", data.token);

      // 3. Atualiza o contexto do usuário
      const userData = await login({ token: data.token });

      if (!userData) {
        throw new Error("Falha ao carregar os dados do usuário");
      }

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

  // Efeito para verificar se há conteúdo para rolar
  useEffect(() => {
    const checkScroll = () => {
      // Verifica se há conteúdo suficiente para rolar
      const hasScrollableContent = document.body.scrollHeight > window.innerHeight;
      // Verifica se o usuário já rolou até o final
      const isAtBottom = window.innerHeight + window.scrollY >= document.body.scrollHeight - 20;
      
      // Mostra o botão apenas se houver conteúdo para rolar E o usuário não estiver no final
      setShowScrollButton(hasScrollableContent && !isAtBottom);
    };

    const checkScrollWithDelay = () => {
      // Adiciona um pequeno atraso para garantir que o DOM foi atualizado
      setTimeout(checkScroll, 100);
    };

    // Verifica na montagem do componente e após atualizações
    checkScrollWithDelay();
    
    // Adiciona listeners para verificar quando o conteúdo for carregado
    window.addEventListener('load', checkScrollWithDelay);
    window.addEventListener('resize', checkScrollWithDelay);
    window.addEventListener('scroll', checkScroll);

    // Verifica periodicamente para capturar mudanças dinâmicas no conteúdo
    const scrollCheckInterval = setInterval(checkScroll, 1000);

    return () => {
      window.removeEventListener('load', checkScrollWithDelay);
      window.removeEventListener('resize', checkScrollWithDelay);
      window.removeEventListener('scroll', checkScroll);
      clearInterval(scrollCheckInterval);
    };
  }, []);

  const scrollDown = () => {
    window.scrollTo({
      top: document.body.scrollHeight,
      behavior: 'smooth'
    });
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
      className="relative w-full h-full min-h-screen font-poppins bg-center bg-cover overflow-x-hidden"
      style={{ backgroundImage: `url(${FundoSaoPaulo})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 flex flex-col md:flex-row min-h-screen">
        {/* Painel do formulário */}
        <div className="w-full md:w-[45%] bg-white/70 p-6 md:p-8 lg:p-12 shadow-lg flex flex-col justify-center min-h-screen md:min-h-full">
          {mensagem && (
            <div
              className={`p-3 mb-4 rounded-md text-center ${
                mensagem.includes("sucesso")
                  ? "bg-green-100 text-green-800"
                  : "bg-red-100 text-red-800"
              }`}
            >
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
              style={{
                // Esconde o ícone de olho nativo do Chrome/Edge
                "::-ms-reveal": {
                  display: "none",
                },
                "::-ms-clear": {
                  display: "none",
                },
              }}
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

          <div className="text-right mb-4">
            <button
              type="button"
              onClick={() => navigate("/forgot-password")}
              className="text-sm text-blue-500 hover:underline focus:outline-none"
              disabled={isLoading}
            >
              Esqueci minha senha
            </button>
          </div>

          <button
            type="submit"
            onClick={handleLogin}
            disabled={isLoading}
            className={`w-full text-white py-3 text-lg rounded-md mb-6 transition-all duration-300 ${
              isLoading
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-[#828282] hover:scale-105 cursor-pointer"
            }`}
          >
            {isLoading ? (
              <div className="flex items-center justify-center">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                Entrando...
              </div>
            ) : (
              "Entrar"
            )}
          </button>

          <p className="text-red-500 text-center mb-4">{mensagem}</p>

          <div className="flex items-center my-4">
            <div className="flex-grow border-t border-gray-400"></div>
            <span className="px-3 text-gray-500 text-sm">ou</span>
            <div className="flex-grow border-t border-gray-400"></div>
          </div>

          <button
            type="button"
            className={`w-full bg-white/40 py-3 rounded-md mb-6 transition-all duration-300 ${
              isLoading
                ? "opacity-50 cursor-not-allowed"
                : "hover:scale-105 cursor-pointer"
            }`}
            onClick={entrarComoVisitante}
            disabled={isLoading}
          >
            {isLoading ? "Carregando..." : "Entrar como visitante"}
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

        {/* Painel da direita - Apenas em desktop */}
        <div className="hidden md:flex md:w-[55%] flex-col justify-center items-center p-4 lg:p-8 text-white bg-black/30 min-h-full">
          <div className="max-w-md mx-auto">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4 text-center px-4">
              BlogPeriférico
            </h1>
            <p className="text-xl md:text-2xl text-center text-gray-200 px-4">
              Bem-vindo de volta!
            </p>
          </div>
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
