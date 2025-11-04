import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import EyeOpen from "../../assets/images/view.png";
import EyeClose from "../../assets/images/hide.png";
import FundoSaoPaulo from "/src/assets/images/BackGroundImg.png";
import api from "../../services/Api";

// Componente para os inputs de código
const CodeInputs = ({ code, setCode, disabled }) => {
  const inputs = useRef([]);
  
  const handleChange = (e, index) => {
    const value = e.target.value.replace(/[^0-9]/g, '');
    if (value) {
      const newCode = [...code];
      newCode[index] = value;
      setCode(newCode);
      
      // Move para o próximo input
      if (index < 5 && inputs.current[index + 1]) {
        inputs.current[index + 1].focus();
      }
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === 'Backspace') {
      const newCode = [...code];
      
      // Se o campo atual está vazio, apaga o anterior
      if (!code[index] && index > 0) {
        newCode[index - 1] = '';
        setCode(newCode);
        inputs.current[index - 1].focus();
      } 
      // Se o campo atual tem valor, limpa ele
      else if (code[index]) {
        newCode[index] = '';
        setCode(newCode);
      }
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const paste = e.clipboardData.getData('text').replace(/[^0-9]/g, '');
    if (paste.length === 6) {
      const newCode = paste.split('').slice(0, 6);
      setCode(newCode);
      // Foca no último input após o paste
      if (inputs.current[5]) {
        inputs.current[5].focus();
      }
    }
  };

  return (
    <div className="flex justify-center gap-4 mb-12 px-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="relative w-20 h-20">
          <div className={`
            absolute inset-0 bg-white/90 backdrop-blur-sm rounded-lg 
            transform transition-all duration-200 ease-out
            border-2 ${code[i] ? 'border-[#828282]' : 'border-gray-300'}
            ${!disabled && 'group-hover:border-[#828282]'}
          `}></div>
          <input
            ref={el => inputs.current[i] = el}
            type="text"
            maxLength="1"
            value={code[i] || ''}
            onChange={(e) => handleChange(e, i)}
            onKeyDown={(e) => handleKeyDown(e, i)}
            onPaste={i === 0 ? handlePaste : null}
            disabled={disabled}
            className={`
              relative w-full h-full text-5xl font-bold text-center 
              bg-transparent border-0 rounded-lg
              focus:ring-0 focus:outline-none
              transition-all duration-200
              text-gray-800 caret-transparent
              ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}
              ${code[i] ? 'text-gray-800' : 'text-gray-600'}
              leading-none
            `}
            inputMode="numeric"
            style={{
              WebkitAppearance: 'none',
              MozAppearance: 'textfield',
              textShadow: '0 1px 2px rgba(0,0,0,0.05)'
            }}
          />
        </div>
      ))}
    </div>
  );
};

export default function ForgotPassword() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState(Array(6).fill(''));
  const [novaSenha, setNovaSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [mensagem, setMensagem] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleSolicitarCodigo = async (e) => {
    e.preventDefault();
    if (!email) {
      setMensagem("Por favor, insira seu e-mail");
      return;
    }

    setIsLoading(true);
    setMensagem("");

    try {
      await api.post("/auth/esqueci-senha", { email });
      setMensagem("Código de verificação enviado para o seu e-mail");
      setStep(2);
    } catch (error) {
      console.error("Erro ao solicitar código:", error);
      setMensagem(
        error.response?.data?.message || "Erro ao enviar código de verificação"
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleRedefinirSenha = async (e) => {
    e.preventDefault();
    const codigoCompleto = code.join('');
    
    if (codigoCompleto.length !== 6) {
      setMensagem("Por favor, preencha todos os dígitos do código");
      return;
    }
    
    if (novaSenha !== confirmarSenha) {
      setMensagem("As senhas não coincidem");
      return;
    }

    if (novaSenha.length < 6) {
      setMensagem("A senha deve ter no mínimo 6 caracteres");
      return;
    }

    setIsLoading(true);
    setMensagem("");

    try {
      await api.post("/auth/redefinir-senha", {
        email,
        codigo: codigoCompleto,
        novaSenha,
      });
      
      setMensagem("Senha redefinida com sucesso! Redirecionando...");
      setTimeout(() => navigate("/login"), 2000);
    } catch (error) {
      console.error("Erro ao redefinir senha:", error);
      setMensagem(
        error.response?.data?.message || "Erro ao redefinir a senha"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div
      className="relative w-full min-h-screen font-poppins bg-cover bg-center bg-no-repeat flex items-center justify-center p-4"
      style={{ backgroundImage: `url(${FundoSaoPaulo})` }}
    >
      <div className="absolute inset-0 bg-black/40"></div>

      <div className="relative z-10 w-full" style={{ maxWidth: '600px' }}>
        {/* Painel do formulário */}
        <div className="w-full bg-white/95 backdrop-blur-sm rounded-3xl shadow-2xl p-10 border border-white/20">
          {mensagem && (
            <div
              className={`p-3 mb-4 rounded-md text-center ${
                mensagem.includes("sucesso") || step === 2
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
            <h2 className="text-4xl md:text-5xl text-center font-bold mb-4 text-gray-800">
              {step === 1 ? "Recuperar Senha" : "Nova Senha"}
            </h2>
            <div className="w-12 h-1 bg-[#828282] rounded-full mx-auto mb-4"></div>
            <h3 className="text-xl text-center text-gray-600 mb-10">
              {step === 1
                ? "Digite seu e-mail para receber o código de verificação"
                : "Digite o código e sua nova senha"}
            </h3>
          </div>

          {step === 1 ? (
            <form onSubmit={handleSolicitarCodigo}>
              <div className="mb-6">
                <input
                  type="email"
                  placeholder="Digite seu e-mail"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-6 py-5 text-xl rounded-xl bg-white/80 border border-gray-200 focus:border-[#828282] focus:ring-2 focus:ring-[#828282]/20 outline-none transition-all duration-200 placeholder-gray-400 text-gray-700 shadow-sm"
                  required
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-5 text-xl text-white font-medium rounded-xl mb-8 transition-all duration-300 transform text-lg ${
                  isLoading
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-gradient-to-r from-[#6B7280] to-[#4B5563] hover:from-[#4B5563] hover:to-[#374151] active:scale-[0.98] shadow-md hover:shadow-lg"
                }`}
              >
                {isLoading ? (
                  <div className="flex items-center justify-center">
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                    Enviando...
                  </div>
                ) : (
                  "Enviar Código"
                )}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRedefinirSenha}>
              <div className="mb-4">
                <p className="text-lg sm:text-xl text-gray-800 mb-2 text-center font-semibold">Código de verificação</p>
                <p className="text-sm sm:text-base text-gray-600 mb-8 text-center">Enviamos um código de 6 dígitos para<br/><span className="font-medium text-gray-800">{email}</span></p>
                <CodeInputs 
                  code={code} 
                  setCode={setCode} 
                  disabled={isLoading} 
                />
                
                <div className="relative mb-4">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Nova senha"
                    value={novaSenha}
                    onChange={(e) => setNovaSenha(e.target.value)}
                    className="w-full px-6 py-5 text-xl rounded-xl bg-white/80 border border-gray-200 focus:border-[#828282] focus:ring-2 focus:ring-[#828282]/20 outline-none transition-all duration-200 placeholder-gray-400 text-gray-700 shadow-sm"
                    required
                    minLength={6}
                    disabled={isLoading}
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-600 focus:outline-none p-1"
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

                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Confirmar nova senha"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full px-5 py-3 rounded-md text-black placeholder-gray-400 border border-gray-300 focus:border-gray-500 focus:ring-2 focus:ring-gray-400 outline-none transition-all duration-400 ease-in-out transform hover:scale-[1.01] focus:scale-[1.02]"
                  required
                  minLength={6}
                  disabled={isLoading}
                />
              </div>

              <button
                type="submit"
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
                    Redefinindo...
                  </div>
                ) : (
                  "Redefinir Senha"
                )}
              </button>
            </form>
          )}

          <div className="text-center">
            <p className="text-sm text-black">
              Lembrou sua senha?{" "}
              <button
                type="button"
                onClick={() => navigate("/login")}
                className="text-base text-blue-500 hover:text-blue-600 font-medium hover:underline focus:outline-none transition-colors"
                disabled={isLoading}
              >
                Fazer login
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
