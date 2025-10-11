import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaEdit, FaCamera, FaUser, FaEnvelope, FaLock, FaCheck } from "react-icons/fa";
import { useUser } from "../../contexts/UserContext.jsx";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import AuthService from "../../services/AuthService";
import { jwtDecode } from "jwt-decode";
import NoPicture from "../../assets/images/NoPicture.webp";

export default function EditaPerfil() {
  const navigate = useNavigate();
  const { user, updateUser } = useUser();
  const { regiao } = useRegiao();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    nome: "",
    email: "",
    senha: "",
    confirmarSenha: "",
  });
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [erroToast, setErroToast] = useState("");
  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [successToast, setSuccessToast] = useState("");

  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";
  const corSecundaria = regionColors[regiao]?.[1] || "#3B82F6";

  // Carregar dados do usuário logado
  useEffect(() => {
    const carregarPerfil = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const email = decoded.sub;

        const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8080'}/usuarios/listar`);
        const usuarios = await response.json();
        const usuarioEncontrado = usuarios.find((u) => u.email === email);

        if (usuarioEncontrado) {
          setUsuarioLogado(usuarioEncontrado);
          setFormData({
            nome: usuarioEncontrado.nome || "",
            email: usuarioEncontrado.email || "",
            senha: "",
            confirmarSenha: "",
          });
          setPreviewFoto(usuarioEncontrado.fotoPerfil || null);
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        setErroToast("Erro ao carregar dados do perfil.");
      }
    };

    carregarPerfil();
  }, [navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoPerfil(file);
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async () => {
    if (formData.senha && formData.senha !== formData.confirmarSenha) {
      setErroToast("As senhas não coincidem.");
      return;
    }

    setLoading(true);
    setErroToast("");

    try {
      const perfilData = {
        dto: {
          nome: formData.nome,
          email: formData.email,
          senha: formData.senha || undefined,
        },
        fotoPerfil: fotoPerfil,
      };

      await AuthService.updatePerfil(perfilData);

      if (updateUser) {
        updateUser({ ...usuarioLogado, ...perfilData.dto, fotoPerfil: previewFoto });
      }

      setSuccessToast("Perfil atualizado com sucesso!");
      setTimeout(() => {
        navigate("/perfil");
      }, 1500);
    } catch (err) {
      console.error("Erro ao atualizar perfil:", err);
      setErroToast("Erro ao salvar alterações. Tente novamente.");
      setTimeout(() => setErroToast(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => {
    navigate("/perfil");
  };

  if (!usuarioLogado) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pt-20 px-4 md:px-10">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Editar Perfil
          </h1>
          <p className="text-gray-600">Personalize suas informações pessoais</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Foto de Perfil */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-xl p-6 border border-gray-100">
              <div className="text-center">
                <div className="relative mb-6">
                  <div className="relative mx-auto w-40 h-40">
                    <img
                      src={previewFoto || usuarioLogado.fotoPerfil || NoPicture}
                      alt="Foto de perfil"
                      className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                      style={{ borderColor: `${corPrincipal}20` }}
                    />
                    <label
                      htmlFor="fotoPerfil"
                      className="absolute bottom-2 right-2 bg-white rounded-full p-3 shadow-lg hover:shadow-xl transition-all duration-300 cursor-pointer group border-2 border-gray-200 hover:border-blue-400"
                      style={{ color: corPrincipal }}
                    >
                      <FaCamera className="w-5 h-5 group-hover:scale-110 transition-transform" />
                    </label>
                    <input
                      type="file"
                      id="fotoPerfil"
                      accept="image/*"
                      onChange={handleFotoChange}
                      className="hidden"
                    />
                  </div>
                  <div className="absolute inset-0 rounded-full bg-gradient-to-t from-black/20 to-transparent opacity-0 hover:opacity-100 transition-opacity pointer-events-none"></div>
                </div>

                <h3 className="text-xl font-semibold text-gray-800 mb-2">
                  {usuarioLogado.nome}
                </h3>
                <p className="text-gray-500 text-sm mb-4">
                  Clique na câmera para alterar sua foto
                </p>

                <div className="flex items-center justify-center gap-2 text-sm text-gray-600 bg-gray-50 rounded-full px-4 py-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: corPrincipal }}
                  ></div>
                  {regiao || "Centro"}
                </div>
              </div>
            </div>
          </div>

          {/* Formulário */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
              {/* Toast Messages */}
              {erroToast && (
                <div className="mb-6 bg-red-50 border-l-4 border-red-400 p-4 rounded-r-lg animate-pulse">
                  <div className="flex">
                    <div className="ml-3">
                      <p className="text-sm text-red-700">{erroToast}</p>
                    </div>
                  </div>
                </div>
              )}

              {successToast && (
                <div className="mb-6 bg-green-50 border-l-4 border-green-400 p-4 rounded-r-lg animate-pulse">
                  <div className="flex">
                    <FaCheck className="w-5 h-5 text-green-400 mt-0.5" />
                    <div className="ml-3">
                      <p className="text-sm text-green-700">{successToast}</p>
                    </div>
                  </div>
                </div>
              )}

              <form className="space-y-6">
                {/* Nome */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                    <FaUser className="inline w-4 h-4 mr-2" />
                    Nome Completo
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      name="nome"
                      value={formData.nome}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                      placeholder="Digite seu nome completo"
                    />
                    <FaUser className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                {/* Email */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                    <FaEnvelope className="inline w-4 h-4 mr-2" />
                    Email
                  </label>
                  <div className="relative">
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-12 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                      placeholder="seu.email@exemplo.com"
                    />
                    <FaEnvelope className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                {/* Nova Senha */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                    <FaLock className="inline w-4 h-4 mr-2" />
                    Nova Senha
                    <span className="text-xs text-gray-500 font-normal ml-2">(opcional)</span>
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="senha"
                      value={formData.senha}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                      placeholder="Deixe em branco para manter a atual"
                    />
                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                {/* Confirmar Senha */}
                <div className="group">
                  <label className="block text-sm font-semibold text-gray-700 mb-2 group-focus-within:text-blue-600 transition-colors">
                    <FaLock className="inline w-4 h-4 mr-2" />
                    Confirmar Nova Senha
                  </label>
                  <div className="relative">
                    <input
                      type="password"
                      name="confirmarSenha"
                      value={formData.confirmarSenha}
                      onChange={handleInputChange}
                      className="w-full px-4 py-3 pl-12 pr-12 border-2 border-gray-200 rounded-xl focus:border-blue-400 focus:ring-4 focus:ring-blue-100 outline-none transition-all duration-300 bg-gray-50 focus:bg-white"
                      placeholder="Confirme a nova senha"
                    />
                    <FaLock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  </div>
                </div>

                {/* Botões */}
                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleSubmit}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-4 px-8 rounded-xl font-semibold hover:from-blue-600 hover:to-purple-700 focus:ring-4 focus:ring-blue-200 outline-none transition-all duration-300 transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none shadow-lg hover:shadow-xl"
                  >
                    {loading ? (
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                        Salvando...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <FaCheck className="w-5 h-5 mr-2" />
                        Salvar Alterações
                      </div>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={handleCancelar}
                    className="flex-1 bg-gray-100 text-gray-700 py-4 px-8 rounded-xl font-semibold hover:bg-gray-200 focus:ring-4 focus:ring-gray-200 outline-none transition-all duration-300 transform hover:scale-[1.02] shadow-md hover:shadow-lg"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
