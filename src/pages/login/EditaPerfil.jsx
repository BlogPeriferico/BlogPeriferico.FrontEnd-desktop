// src/components/Perfil/EditaPerfil.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaEdit, FaCamera, FaCheck, FaTrash } from "react-icons/fa";
import { useUser } from "../../contexts/UserContext.jsx";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import AuthService from "../../services/AuthService";
import { jwtDecode } from "jwt-decode";

import NoPicture from "../../assets/images/NoPicture.webp";

export default function EditaPerfil() {
  const navigate = useNavigate();
  const { user, updateProfile, logout } = useUser();
  const { regiao } = useRegiao();
  const corPrincipal = regionColors[regiao]?.[0] || "#1D4ED8";

  const [usuarioLogado, setUsuarioLogado] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fotoPerfil, setFotoPerfil] = useState(null);
  const [previewFoto, setPreviewFoto] = useState(null);
  const [erroToast, setErroToast] = useState("");
  const [successToast, setSuccessToast] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingField, setEditingField] = useState(null);
  const [tempValue, setTempValue] = useState("");
  const [tempSenhaAtual, setTempSenhaAtual] = useState("");
  const [tempConfirmarSenha, setTempConfirmarSenha] = useState("");
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState("");
  const [deleteError, setDeleteError] = useState("");

  // Carrega perfil do usuário logado
  useEffect(() => {
    if (user) {
      setUsuarioLogado(user);
      setPreviewFoto(user.fotoPerfil || NoPicture);
      return;
    }

    const carregarPerfil = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        navigate("/login");
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const email = decoded.sub;

        const response = await fetch(
          `${import.meta.env.VITE_API_URL || "http://localhost:8080"}/usuarios/listar`,
          { headers: { Authorization: `Bearer ${token}` } }
        );

        const usuarios = await response.json();
        const usuario = usuarios.find((u) => u.email === email);

        if (usuario) {
          setUsuarioLogado(usuario);
          setPreviewFoto(usuario.fotoPerfil || NoPicture);
        } else {
          setErroToast("Usuário não encontrado.");
          setUsuarioLogado({ nome: "", email: "" });
        }
      } catch (err) {
        console.error("Erro ao carregar perfil:", err);
        setErroToast("Erro ao carregar dados do perfil.");
      }
    };

    carregarPerfil();
  }, [user, navigate]);

  // 📸 Seleção de foto
  const handleFotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFotoPerfil(file);
      setPreviewFoto(URL.createObjectURL(file));
    }
  };

  // 💾 Salvar foto
  const handleSaveFoto = async () => {
    if (!fotoPerfil || !usuarioLogado) return;
    setLoading(true);
    setErroToast("");

    try {
      const usuarioAtualizado = await AuthService.updateFoto(
        usuarioLogado.id,
        fotoPerfil
      );

      setUsuarioLogado(usuarioAtualizado);
      setPreviewFoto(usuarioAtualizado.fotoPerfil || previewFoto);
      setFotoPerfil(null);

      if (updateProfile) updateProfile({ ...usuarioAtualizado });

      setSuccessToast("Foto atualizada com sucesso!");
      setTimeout(() => setSuccessToast(""), 3000);
    } catch (err) {
      console.error("Erro ao atualizar foto:", err);
      setErroToast(err.response?.data?.message || "Erro ao salvar foto.");
      setTimeout(() => setErroToast(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  // Modal de edição
  const openEditModal = (field, currentValue) => {
    if (!usuarioLogado) return;
    setEditingField(field);
    setTempValue(currentValue || "");
    setTempSenhaAtual("");
    setTempConfirmarSenha("");
    setIsModalOpen(true);
  };

  const closeEditModal = () => {
    setEditingField(null);
    setTempValue("");
    setTempSenhaAtual("");
    setTempConfirmarSenha("");
    setIsModalOpen(false);
  };

  // 💾 Salvar campos (nome, email, senha, biografia)
  const handleSaveField = async () => {
    if (!editingField || !usuarioLogado) return;

    // Validação de senha
    if (editingField === "senha" && tempValue !== tempConfirmarSenha) {
      setErroToast("As senhas não coincidem.");
      setTimeout(() => setErroToast(""), 3000);
      return;
    }

    setLoading(true);
    setErroToast("");

    try {
      // Cria um payload limpo apenas com os campos que estão sendo alterados
      const payload = {};

      // Adiciona apenas o campo que está sendo editado
      if (editingField === "nome") payload.nome = tempValue;
      if (editingField === "email") payload.email = tempValue;
      if (editingField === "biografia") payload.biografia = tempValue;

      // Adiciona a senha atual apenas se for necessário
      if (["senha", "email"].includes(editingField) && tempSenhaAtual) {
        payload.senhaAtual = tempSenhaAtual;
      }

      // Adiciona a nova senha apenas se estiver alterando a senha
      if (editingField === "senha" && tempValue) {
        payload.novaSenha = tempValue;
      }

      console.log('Enviando para atualização:', { userId: usuarioLogado.id, payload });

      const response = await AuthService.updatePerfil(usuarioLogado.id, payload);
      console.log('Resposta da atualização:', response);

      // Atualiza o token se um novo for retornado
      if (response.token) {
        localStorage.setItem("token", response.token);
      }

      // Atualiza o estado local com os dados retornados
      const usuarioAtualizado = response.usuario || response;
      setUsuarioLogado(prev => ({
        ...prev,
        ...usuarioAtualizado
      }));

      // Atualiza o contexto do usuário se disponível
      if (updateProfile) {
        updateProfile(usuarioAtualizado);
      }

      // Exibe mensagem de sucesso
      const fieldName = editingField === "senha" ? "Senha" : 
                       editingField === "biografia" ? "Biografia" :
                       editingField.charAt(0).toUpperCase() + editingField.slice(1);

      setSuccessToast(`${fieldName} atualizada com sucesso!`);
      setTimeout(() => setSuccessToast(""), 3000);

      // Fecha o modal de edição
      closeEditModal();

    } catch (err) {
      console.error("Erro ao atualizar campo:", err);
      const errorMessage = err.response?.data?.message || 
                          err.message || 
                          "Erro ao salvar alterações. Por favor, tente novamente.";

      setErroToast(errorMessage);
      setTimeout(() => setErroToast(""), 5000);
    } finally {
      setLoading(false);
    }
  };

  const handleVoltar = () => {
    navigate(-1);
  };

  const openDeleteModal = () => {
    setConfirmPassword("");
    setDeleteError("");
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    setIsDeleteModalOpen(false);
    setConfirmPassword("");
    setDeleteError("");
  };

  const handleDeleteAccount = async () => {
    if (!confirmPassword) {
      setDeleteError("Por favor, digite sua senha para confirmar a exclusão.");
      return;
    }

    setLoading(true);
    setDeleteError("");

    try {
      await AuthService.deleteAccount(confirmPassword);
      setSuccessToast("Sua conta foi excluída com sucesso. Redirecionando...");
      
      // Força um logout completo
      logout();
      
      // Redireciona para a página inicial após um pequeno atraso
      setTimeout(() => {
        // Força um reload completo da página para limpar todo o estado da aplicação
        window.location.href = '/';
      }, 1500);
      
    } catch (err) {
      console.error("Erro ao excluir conta:", err);
      setDeleteError(
        err.response?.data?.message || 
        err.message || 
        "Erro ao excluir conta. Verifique sua senha e tente novamente."
      );
    } finally {
      setLoading(false);
    }
  };

  // Se não houver usuário logado, mostra um loading
  if (!usuarioLogado) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pt-20 px-4 md:px-10">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Editar Perfil
          </h1>
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* FOTO */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-6 border border-gray-100 text-center">
            <div className="relative mx-auto w-40 h-40 mb-4">
              <img
                src={previewFoto || (usuarioLogado?.fotoPerfil ? `${import.meta.env.VITE_API_URL || 'http://localhost:8080'}${usuarioLogado.fotoPerfil}` : NoPicture)}
                alt="Foto de perfil"
                className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                style={{ borderColor: `${corPrincipal}20` }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = NoPicture;
                }}
              />
              <label
                htmlFor="fotoPerfil"
                className="absolute -bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-3 shadow-lg cursor-pointer border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 hover:scale-105"
                style={{ color: corPrincipal }}
                title="Alterar foto"
              >
                <FaCamera className="w-5 h-5" />
              </label>
              <input
                type="file"
                id="fotoPerfil"
                accept="image/*"
                onChange={handleFotoChange}
                className="hidden"
              />
            </div>
            
            {/* Botão de salvar foto (aparece apenas quando uma nova foto é selecionada) */}
            {fotoPerfil && (
              <div className="mb-4">
                <button
                  onClick={handleSaveFoto}
                  className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mx-auto"
                >
                  <FaCheck className="w-4 h-4" />
                  Salvar Foto
                </button>
                <p className="text-gray-500 text-xs mt-2">
                  Clique em "Salvar Foto" para confirmar
                </p>
              </div>
            )}
            
            <h3 className="text-xl font-semibold text-gray-800 mt-2">
              {usuarioLogado.nome}
            </h3>
            
            {/* Biografia */}
            <div className="w-full bg-gray-50 rounded-lg p-4 mt-4">
              <div className="flex justify-center items-center mb-3 relative">
                <h4 className="text-base font-semibold text-gray-700 flex items-center">
                  <svg 
                    className="w-4 h-4 mr-2 text-gray-500" 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path 
                      strokeLinecap="round" 
                      strokeLinejoin="round" 
                      strokeWidth={2} 
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" 
                    />
                  </svg>
                  Biografia
                </h4>
                <button
                  onClick={() => openEditModal("biografia", usuarioLogado.biografia || "")}
                  className="text-gray-400 hover:text-blue-600 transition-colors absolute right-0"
                  title="Editar biografia"
                >
                  <FaEdit size={14} />
                </button>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm">
                <p className="text-gray-600 text-sm leading-relaxed">
                  {usuarioLogado.biografia || (
                    <span className="text-gray-400 italic">
                      Adicione uma biografia para que as pessoas saibam mais sobre você.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* CAMPOS */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8 border border-gray-100 space-y-6">
            {erroToast && (
              <div className="p-4 bg-red-50 text-red-700 rounded">
                {erroToast}
              </div>
            )}
            {successToast && (
              <div className="p-4 bg-green-50 text-green-700 rounded flex items-center gap-2">
                <FaCheck /> {successToast}
              </div>
            )}

            {/* Nome */}
            <div className="flex justify-between items-center">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Nome Completo
                </label>
                <p className="text-gray-900 text-lg">{usuarioLogado.nome}</p>
              </div>
              <button
                onClick={() => openEditModal("nome", usuarioLogado.nome)}
                className="text-gray-400 hover:text-blue-600"
              >
                <FaEdit size={16} />
              </button>
            </div>

            {/* Email */}
            <div className="flex justify-between items-center">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Email
                </label>
                <p className="text-gray-900 text-lg">{usuarioLogado.email}</p>
              </div>
              <button
                onClick={() => openEditModal("email", usuarioLogado.email)}
                className="text-gray-400 hover:text-blue-600"
              >
                <FaEdit size={16} />
              </button>
            </div>

            {/* Senha */}
            <div className="flex justify-between items-center">
              <div>
                <label className="block text-sm font-semibold text-gray-700">
                  Senha
                </label>
                <p className="text-gray-900 text-lg">••••••••</p>
              </div>
              <button
                onClick={() => openEditModal("senha", "")}
                className="text-gray-400 hover:text-blue-600"
              >
                <FaEdit size={16} />
              </button>
            </div>


            <div className="flex flex-col gap-4 mt-6">
              <button
                onClick={handleVoltar}
                className="w-full bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200"
              >
                Voltar ao Perfil
              </button>
              <button
                onClick={openDeleteModal}
                className="flex items-center justify-center gap-2 w-full bg-red-100 text-red-600 py-3 rounded-xl hover:bg-red-200 transition-colors border border-red-200"
              >
                <FaTrash />
                Excluir Minha Conta
              </button>
            </div>
          </div>
        </div>

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full relative">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Redefinir{" "}
                  {editingField?.charAt(0).toUpperCase() +
                    editingField?.slice(1)}
                </h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-600 hover:text-gray-800"
                  title="Fechar"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
              <form className="space-y-6">
                {editingField === "email" && (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Senha Atual
                      </label>
                      <input
                        type="password"
                        value={tempSenhaAtual}
                        onChange={(e) => setTempSenhaAtual(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                        placeholder="Digite a senha atual"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Novo Email
                      </label>
                      <input
                        type="email"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                        placeholder="Digite o novo email"
                      />
                    </div>
                  </div>
                )}

                {editingField === "senha" && (
                  <>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Senha Atual
                      </label>
                      <input
                        type="password"
                        value={tempSenhaAtual}
                        onChange={(e) => setTempSenhaAtual(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                        placeholder="Digite a senha atual"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Nova Senha
                      </label>
                      <input
                        type="password"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                        placeholder="Digite a nova senha"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">
                        Confirme a Senha
                      </label>
                      <input
                        type="password"
                        value={tempConfirmarSenha}
                        onChange={(e) => setTempConfirmarSenha(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                        placeholder="Confirme a nova senha"
                      />
                    </div>
                  </>
                )}

                {editingField === "nome" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">
                      Novo Nome
                    </label>
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                      placeholder="Digite o novo nome"
                    />
                  </div>
                )}

                {editingField === "biografia" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sua Biografia
                    </label>
                    <textarea
                      value={tempValue}
                      onChange={(e) => {
                        if (e.target.value.length <= 250) {
                          setTempValue(e.target.value);
                        }
                      }}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl h-32 resize-none"
                      placeholder="Conte um pouco sobre você... (máx. 250 caracteres)"
                      maxLength={250}
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {tempValue.length}/250 caracteres
                    </p>
                  </div>
                )}

                <div className="flex gap-4 pt-6">
                  <button
                    type="button"
                    onClick={handleSaveField}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-3 rounded-xl"
                  >
                    {loading ? "Salvando..." : "Salvar"}
                  </button>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl"
                  >
                    Cancelar
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Modal de Confirmação de Exclusão */}
        {isDeleteModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Excluir Conta</h2>
                <button
                  onClick={closeDeleteModal}
                  className="text-gray-600 hover:text-gray-800"
                  title="Fechar"
                >
                  <FaTimes className="text-2xl" />
                </button>
              </div>
              
              <p className="text-gray-700 mb-6">
                Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita e todos os seus dados serão permanentemente removidos.
              </p>
              
              <div className="mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Digite sua senha para confirmar:
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                  placeholder="Sua senha atual"
                />
                {deleteError && (
                  <p className="text-red-500 text-sm mt-2">{deleteError}</p>
                )}
              </div>
              
              <div className="flex gap-4">
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white py-3 rounded-xl hover:bg-red-600 disabled:opacity-50"
                >
                  {loading ? "Excluindo..." : "Sim, excluir conta"}
                </button>
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200"
                >
                  Cancelar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
