import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const [showPassword, setShowPassword] = useState(false);

  const entrarComoVisitante = () => {
    // Aqui você poderia salvar um estado global ou localStorage como "visitante"
    localStorage.setItem("userRole", "visitante");
    navigate("/quebrada-informa"); // redirecione para a home ou onde preferir
  };

  return (
    <div className="bg-white rounded-xl p-8 shadow-lg w-full max-w-md">
      <h2 className="text-3xl font-bold text-center mb-2">Login</h2>
      <p className="text-center text-gray-500 mb-6">Entre com seu email e sua senha</p>
      
      <input type="email" placeholder="Email" className="w-full mb-4 px-4 py-2 border rounded-md" />
      
      <div className="relative mb-4">
        <input
          type={showPassword ? "text" : "password"}
          placeholder="Senha"
          className="w-full px-4 py-2 border rounded-md pr-10"
        />
        <button
          type="button"
          className="absolute right-2 top-2 text-gray-500"
          onClick={() => setShowPassword(!showPassword)}
        >
          {showPassword ? "🙈" : "👁️"}
        </button>
      </div>

      <div className="flex items-center justify-between mb-4 text-sm">
        <label className="flex items-center gap-2">
          <input type="checkbox" /> Lembre me
        </label>
        <a href="#" className="text-blue-500 hover:underline">Esqueci minha senha</a>
      </div>

      <button className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 mb-4">
        Login
      </button>

      {/* NOVO - Entrar como visitante */}
      <button
        className="w-full bg-gray-100 border border-gray-300 text-gray-700 py-2 rounded-md hover:bg-gray-200 mb-4"
        onClick={entrarComoVisitante}
      >
        Entrar como visitante
      </button>

      <div className="text-center text-gray-400 mb-2">Ou login com</div>

      <button className="w-full bg-white border py-2 rounded-md mb-4 flex items-center justify-center">
        <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-5 h-5 mr-2" />
        Google
      </button>

      <p className="text-center text-sm">
        Não tem uma conta ainda?{" "}
        <button onClick={() => navigate('/register')} className="text-blue-600 hover:underline">
          Registre-se
        </button>
      </p>
    </div>
  );
}
