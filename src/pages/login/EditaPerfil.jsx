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

    if (editingField === "senha" && tempValue !== tempConfirmarSenha) {
      setErroToast("As senhas não coincidem.");
      setTimeout(() => setErroToast(""), 3000);
      return;
    }

    setLoading(true);
    setErroToast("");

    try {
      const payload = {};

      if (editingField === "nome") payload.nome = tempValue;
      if (editingField === "email") payload.email = tempValue;
      if (editingField === "biografia") payload.biografia = tempValue;

      if (["senha", "email"].includes(editingField) && tempSenhaAtual) {
        payload.senhaAtual = tempSenhaAtual;
      }

      if (editingField === "senha" && tempValue) {
        payload.novaSenha = tempValue;
      }

      const response = await AuthService.updatePerfil(
        usuarioLogado.id,
        payload
      );

      if (response.token) {
        localStorage.setItem("token", response.token);
      }

      const usuarioAtualizado = response.usuario || response;
      setUsuarioLogado((prev) => ({
        ...prev,
        ...usuarioAtualizado,
      }));

      if (updateProfile) {
        updateProfile(usuarioAtualizado);
      }

      const fieldName =
        editingField === "senha"
          ? "Senha"
          : editingField === "biografia"
          ? "Biografia"
          : editingField.charAt(0).toUpperCase() + editingField.slice(1);

      setSuccessToast(`${fieldName} atualizada com sucesso!`);
      setTimeout(() => setSuccessToast(""), 3000);

      closeEditModal();
    } catch (err) {
      console.error("Erro ao atualizar campo:", err);
      const errorMessage =
        err.response?.data?.message ||
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

      logout();

      setTimeout(() => {
        window.location.href = "/";
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

  // Loading geral enquanto não tem usuário
  if (!usuarioLogado) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-600" />
          <p className="text-gray-600 text-sm">Carregando perfil...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 pt-24 px-4 sm:px-6 md:px-8">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent mb-2">
            Editar Perfil
          </h1>
          <p className="text-gray-600 text-sm">
            Atualize suas informações e deixe seu perfil com a sua cara.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 sm:gap-6">
          {/* FOTO / LADO ESQUERDO */}
          <div className="lg:col-span-1 bg-white rounded-2xl shadow-xl p-5 sm:p-6 border border-gray-100 text-center flex flex-col">
            <div className="relative mx-auto w-28 h-28 sm:w-32 sm:h-32 md:w-40 md:h-40 mb-4">
              <img
                src={
                  previewFoto ||
                  (usuarioLogado?.fotoPerfil
                    ? `${
                        import.meta.env.VITE_API_URL || "http://localhost:8080"
                      }${usuarioLogado.fotoPerfil}`
                    : NoPicture)
                }
                alt="Foto de perfil"
                className="w-full h-full rounded-full object-cover border-4 border-white shadow-lg"
                style={{ borderColor: `${corPrincipal}20` }}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = NoPicture;
                }}
              />
              <label
                htmlFor="fotoPerfil"
                className="absolute -bottom-2 left-1/2 -translate-x-1/2 bg-white rounded-full p-2.5 shadow-lg cursor-pointer border-2 border-gray-200 hover:border-blue-400 transition-all duration-200 hover:scale-105"
                style={{ color: corPrincipal }}
                title="Alterar foto"
              >
                <FaCamera className="w-4 h-4 sm:w-5 sm:h-5" />
              </label>
              <input
                type="file"
                id="fotoPerfil"
                accept="image/*"
                onChange={handleFotoChange}
                className="hidden"
              />
            </div>

            {fotoPerfil && (
              <div className="mb-4">
                <button
                  onClick={handleSaveFoto}
                  disabled={loading}
                  className="bg-blue-500 hover:bg-blue-600 disabled:opacity-60 text-white px-4 py-2 rounded-lg shadow-md hover:shadow-lg transition-all duration-200 flex items-center justify-center gap-2 mx-auto text-sm"
                >
                  <FaCheck className="w-4 h-4" />
                  Salvar Foto
                </button>
                <p className="text-gray-500 text-xs mt-2">
                  Clique em &quot;Salvar Foto&quot; para confirmar
                </p>
              </div>
            )}

            <h3 className="text-lg sm:text-xl font-semibold text-gray-800 mt-1 break-words">
              {usuarioLogado.nome}
            </h3>

            {/* Biografia */}
            <div className="w-full bg-gray-50 rounded-lg p-4 mt-4 flex-1">
              <div className="flex items-center mb-3 relative">
                <h4 className="text-sm font-semibold text-gray-700 flex items-center">
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
                  onClick={() =>
                    openEditModal("biografia", usuarioLogado.biografia || "")
                  }
                  className="text-gray-400 hover:text-blue-600 transition-colors absolute right-0"
                  title="Editar biografia"
                >
                  <FaEdit size={14} />
                </button>
              </div>
              <div className="bg-white p-3 rounded-lg border border-gray-100 shadow-sm min-h-[80px]">
                <p className="text-gray-600 text-sm leading-relaxed break-words">
                  {usuarioLogado.biografia || (
                    <span className="text-gray-400 italic">
                      Adicione uma biografia para que as pessoas saibam mais
                      sobre você.
                    </span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* CAMPOS / LADO DIREITO */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-5 sm:p-6 md:p-8 border border-gray-100 space-y-5 sm:space-y-6">
            {erroToast && (
              <div className="p-3 sm:p-4 bg-red-50 text-red-700 rounded text-sm">
                {erroToast}
              </div>
            )}
            {successToast && (
              <div className="p-3 sm:p-4 bg-green-50 text-green-700 rounded flex items-center gap-2 text-sm">
                <FaCheck /> {successToast}
              </div>
            )}

            {/* Nome */}
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                  Nome Completo
                </label>
                <p className="text-gray-900 text-base sm:text-lg break-words">
                  {usuarioLogado.nome}
                </p>
              </div>
              <button
                onClick={() => openEditModal("nome", usuarioLogado.nome)}
                className="text-gray-400 hover:text-blue-600 flex-shrink-0"
                title="Editar nome"
              >
                <FaEdit size={16} />
              </button>
            </div>

            {/* Email */}
            <div className="flex items-center justify-between gap-3">
              <div className="min-w-0">
                <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                  Email
                </label>
                <p className="text-gray-900 text-base sm:text-lg break-all">
                  {usuarioLogado.email}
                </p>
              </div>
              <button
                onClick={() => openEditModal("email", usuarioLogado.email)}
                className="text-gray-400 hover:text-blue-600 flex-shrink-0"
                title="Editar email"
              >
                <FaEdit size={16} />
              </button>
            </div>

            {/* Senha */}
            <div className="flex items-center justify-between gap-3">
              <div>
                <label className="block text-xs sm:text-sm font-semibold text-gray-700">
                  Senha
                </label>
                <p className="text-gray-900 text-base sm:text-lg">••••••••</p>
              </div>
              <button
                onClick={() => openEditModal("senha", "")}
                className="text-gray-400 hover:text-blue-600 flex-shrink-0"
                title="Alterar senha"
              >
                <FaEdit size={16} />
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 mt-4">
              <button
                onClick={handleVoltar}
                className="w-full bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-xl hover:bg-gray-200 text-sm sm:text-base"
              >
                Voltar ao Perfil
              </button>
              <button
                onClick={openDeleteModal}
                className="flex items-center justify-center gap-2 w-full bg-red-100 text-red-600 py-2.5 sm:py-3 rounded-xl hover:bg-red-200 transition-colors border border-red-200 text-sm sm:text-base"
              >
                <FaTrash />
                Excluir Minha Conta
              </button>
            </div>
          </div>
        </div>

        {/* MODAL DE EDIÇÃO */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
            <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto relative">
              <div className="flex justify-between items-center mb-5 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Redefinir{" "}
                  {editingField?.charAt(0).toUpperCase() +
                    editingField?.slice(1)}
                </h2>
                <button
                  onClick={closeEditModal}
                  className="text-gray-600 hover:text-gray-800"
                  title="Fechar"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <form className="space-y-5 sm:space-y-6">
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
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm"
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
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm"
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
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm"
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
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm"
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
                        onChange={(e) =>
                          setTempConfirmarSenha(e.target.value)
                        }
                        className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm"
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
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm"
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
                      className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl h-32 resize-none text-sm"
                      placeholder="Conte um pouco sobre você... (máx. 250 caracteres)"
                      maxLength={250}
                    />
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {tempValue.length}/250 caracteres
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <button
                    type="button"
                    onClick={handleSaveField}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 text-white py-2.5 sm:py-3 rounded-xl text-sm sm:text-base disabled:opacity-60"
                  >
                    {loading ? "Salvando..." : "Salvar"}
                  </button>
                  <button
                    type="button"
                    onClick={closeEditModal}
                    className="flex-1 bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-xl text-sm sm:text-base"
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
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4 sm:p-6">
            <div className="bg-white rounded-2xl shadow-2xl p-5 sm:p-6 md:p-8 max-w-md w-full max-h-[90vh] overflow-y-auto">
              <div className="flex justify-between items-center mb-5 sm:mb-6">
                <h2 className="text-lg sm:text-xl font-bold text-gray-900">
                  Excluir Conta
                </h2>
                <button
                  onClick={closeDeleteModal}
                  className="text-gray-600 hover:text-gray-800"
                  title="Fechar"
                >
                  <FaTimes className="text-xl" />
                </button>
              </div>

              <p className="text-gray-700 mb-5 sm:mb-6 text-sm sm:text-base">
                Tem certeza que deseja excluir sua conta? Esta ação não pode ser
                desfeita e todos os seus dados serão permanentemente removidos.
              </p>

              <div className="mb-5 sm:mb-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Digite sua senha para confirmar:
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full px-4 py-2.5 border-2 border-gray-200 rounded-xl text-sm"
                  placeholder="Sua senha atual"
                />
                {deleteError && (
                  <p className="text-red-500 text-xs sm:text-sm mt-2">
                    {deleteError}
                  </p>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleDeleteAccount}
                  disabled={loading}
                  className="flex-1 bg-red-500 text-white py-2.5 sm:py-3 rounded-xl hover:bg-red-600 disabled:opacity-50 text-sm sm:text-base"
                >
                  {loading ? "Excluindo..." : "Sim, excluir conta"}
                </button>
                <button
                  onClick={closeDeleteModal}
                  className="flex-1 bg-gray-100 text-gray-700 py-2.5 sm:py-3 rounded-xl hover:bg-gray-200 text-sm sm:text-base"
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