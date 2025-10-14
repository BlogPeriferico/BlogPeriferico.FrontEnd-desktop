// src/components/Perfil/EditaPerfil.jsx
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { FaTimes, FaEdit, FaCamera, FaCheck } from "react-icons/fa";
import { useUser } from "../../contexts/UserContext.jsx";
import { useRegiao } from "../../contexts/RegionContext";
import { regionColors } from "../../utils/regionColors";
import AuthService from "../../services/AuthService";
import {jwtDecode} from "jwt-decode";

import NoPicture from "../../assets/images/NoPicture.webp";

export default function EditaPerfil() {
  const navigate = useNavigate();
  const { user, updateProfile } = useUser();
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

  // Carrega perfil do usuário logado
  useEffect(() => {
    if (user) {
      setUsuarioLogado(user);
      setPreviewFoto(user.fotoPerfil || NoPicture);
      return;
    }

    const carregarPerfil = async () => {
      const token = localStorage.getItem("token");
      if (!token) return navigate("/");

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
      const usuarioAtualizado = await AuthService.updateFoto(usuarioLogado.id, fotoPerfil);

      setUsuarioLogado(usuarioAtualizado);
      setPreviewFoto(usuarioAtualizado.fotoPerfil || previewFoto);
      setFotoPerfil(null);

      if (updateProfile)
        updateProfile({ ...usuarioAtualizado });

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

  // 💾 Salvar campos (nome, email, senha)
  const handleSaveField = async () => {
    if (!editingField || !usuarioLogado) return;

    if (editingField === "senha" && tempValue !== tempConfirmarSenha) {
      setErroToast("As senhas não coincidem.");
      setTimeout(() => setErroToast(""), 3000);
      return;
    }

    if ((editingField === "email" || editingField === "senha") && !tempSenhaAtual) {
      setErroToast("Informe a senha atual para continuar.");
      setTimeout(() => setErroToast(""), 3000);
      return;
    }

    setLoading(true);
    setErroToast("");

    try {
      const payload = {
        nome: editingField === "nome" ? tempValue : usuarioLogado.nome,
        email: editingField === "email" ? tempValue : usuarioLogado.email,
        senhaAtual: ["senha", "email"].includes(editingField) ? tempSenhaAtual : undefined,
        novaSenha: editingField === "senha" ? tempValue : undefined,
      };

      const atualizado = await AuthService.updatePerfil(usuarioLogado.id, payload);

      if (atualizado.token) localStorage.setItem("token", atualizado.token);

      const usuarioAtualizado = atualizado.usuario || atualizado;
      setUsuarioLogado(usuarioAtualizado);

      if (updateProfile)
        updateProfile({ ...usuarioAtualizado });

      setSuccessToast(
        `${editingField.charAt(0).toUpperCase() + editingField.slice(1)} atualizado com sucesso!`
      );
      setTimeout(() => setSuccessToast(""), 3000);
      closeEditModal();
    } catch (err) {
      console.error("Erro ao atualizar campo:", err);
      setErroToast(err.response?.data?.message || "Erro ao salvar alterações.");
      setTimeout(() => setErroToast(""), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleCancelar = () => navigate("/perfil");

  if (!usuarioLogado)
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );

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
                src={previewFoto || NoPicture}
                alt="Foto de perfil"
                className="w-40 h-40 rounded-full object-cover border-4 border-white shadow-lg"
                style={{ borderColor: `${corPrincipal}20` }}
              />
              <label
                htmlFor="fotoPerfil"
                className="absolute bottom-2 left-1/2 transform -translate-x-1/2 bg-white rounded-full p-3 shadow-lg cursor-pointer border-2 border-gray-200 hover:border-blue-400"
                style={{ color: corPrincipal }}
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
              {fotoPerfil && (
                <button
                  onClick={handleSaveFoto}
                  className="absolute bottom-2 right-2 bg-blue-500 text-white px-3 py-1 rounded-xl shadow hover:bg-blue-600 text-sm z-50"
                >
                  Salvar Foto
                </button>
              )}
            </div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">{usuarioLogado.nome}</h3>
            <p className="text-gray-500 text-sm">Clique na câmera para alterar sua foto</p>
          </div>

          {/* CAMPOS */}
          <div className="lg:col-span-2 bg-white rounded-2xl shadow-xl p-8 border border-gray-100 space-y-6">
            {erroToast && <div className="p-4 bg-red-50 text-red-700 rounded">{erroToast}</div>}
            {successToast && (
              <div className="p-4 bg-green-50 text-green-700 rounded flex items-center gap-2">
                <FaCheck /> {successToast}
              </div>
            )}

            {/* Nome */}
            <div className="flex justify-between items-center">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Nome Completo</label>
                <p className="text-gray-900 text-lg">{usuarioLogado.nome}</p>
              </div>
              <button onClick={() => openEditModal("nome", usuarioLogado.nome)} className="text-gray-400 hover:text-blue-600">
                <FaEdit size={16} />
              </button>
            </div>

            {/* Email */}
            <div className="flex justify-between items-center">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Email</label>
                <p className="text-gray-900 text-lg">{usuarioLogado.email}</p>
              </div>
              <button onClick={() => openEditModal("email", usuarioLogado.email)} className="text-gray-400 hover:text-blue-600">
                <FaEdit size={16} />
              </button>
            </div>

            {/* Senha */}
            <div className="flex justify-between items-center">
              <div>
                <label className="block text-sm font-semibold text-gray-700">Senha</label>
                <p className="text-gray-900 text-lg">••••••••</p>
              </div>
              <button onClick={() => openEditModal("senha", "")} className="text-gray-400 hover:text-blue-600">
                <FaEdit size={16} />
              </button>
            </div>

            <button onClick={handleCancelar} className="w-full mt-6 bg-gray-100 text-gray-700 py-3 rounded-xl hover:bg-gray-200">
              Voltar ao Perfil
            </button>
          </div>
        </div>

        {/* MODAL */}
        {isModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl p-8 max-w-md w-full">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">
                  Redefinir  {editingField?.charAt(0).toUpperCase() + editingField?.slice(1)}
                </h2>
                <button onClick={closeEditModal} className="text-gray-400 hover:text-gray-600">
                  <FaTimes size={24} />
                </button>
              </div>
              <form className="space-y-6">
                {editingField === "email" && (
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">Senha Atual</label>
                      <input
                        type="password"
                        value={tempSenhaAtual}
                        onChange={(e) => setTempSenhaAtual(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                        placeholder="Digite a senha atual"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">Novo Email</label>
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
                      <label className="block text-sm font-semibold text-gray-700">Senha Atual</label>
                      <input
                        type="password"
                        value={tempSenhaAtual}
                        onChange={(e) => setTempSenhaAtual(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                        placeholder="Digite a senha atual"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">Nova Senha</label>
                      <input
                        type="password"
                        value={tempValue}
                        onChange={(e) => setTempValue(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                        placeholder="Digite a nova senha"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700">Confirme a Senha</label>
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
                    <label className="block text-sm font-semibold text-gray-700">Novo Nome</label>
                    <input
                      type="text"
                      value={tempValue}
                      onChange={(e) => setTempValue(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl"
                      placeholder="Digite o novo nome"
                    />
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
      </div>
    </div>
  );
}
