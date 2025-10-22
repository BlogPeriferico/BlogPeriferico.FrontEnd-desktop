// src/contexts/UserContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/Api"; // sua instância Axios
import {jwtDecode} from "jwt-decode";
import NoPicture from "../assets/images/NoPicture.webp";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState(null); // começa null até carregar

  // Carrega usuário do token/localStorage ao iniciar
  useEffect(() => {
    const loadUser = async () => {
      // Verifica o token no localStorage
      const token = localStorage.getItem("token");
      
      if (!token) {
        console.log("🔍 Nenhum token encontrado no localStorage");
        // fallback: tenta carregar do localStorage
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          console.log("🔍 Carregando usuário do localStorage:", JSON.parse(savedUser));
          setUser(JSON.parse(savedUser));
        }
        return;
      }

      try {
        const decoded = jwtDecode(token);
        const email = decoded.sub;

        // Buscar usuário no backend
        const response = await api.get("/usuarios/listar");
        const usuarios = response.data;
        const usuarioEncontrado = usuarios.find((u) => u.email === email);

        if (usuarioEncontrado) {
          // garante campo fotoPerfil
          if (!usuarioEncontrado.fotoPerfil) usuarioEncontrado.fotoPerfil = NoPicture;
          console.log("🔄 UserContext - Inicializando usuário:", usuarioEncontrado);
          setUser(usuarioEncontrado);
          localStorage.setItem("user", JSON.stringify(usuarioEncontrado));
        } else {
          // fallback: localStorage
          const savedUser = localStorage.getItem("user");
          if (savedUser) setUser(JSON.parse(savedUser));
        }
      } catch (error) {
        console.error("Erro ao carregar usuário:", error);
        const savedUser = localStorage.getItem("user");
        if (savedUser) setUser(JSON.parse(savedUser));
      }
    };

    loadUser();
  }, []);

  // Atualiza localStorage sempre que o user mudar
  useEffect(() => {
    if (user && user.id) {
      localStorage.setItem("user", JSON.stringify(user));
    }
  }, [user]);

  // login
  const login = (userData) => {
    // Obtém o papel do usuário, verificando todos os possíveis nomes de campo
    const role = userData.role || userData.roles || userData.papel || "USUARIO";
    const roleNormalizado = String(role).toUpperCase();
    
    const userWithDefaults = {
      id: userData.id,
      nome: userData.nome || "Usuário",
      email: userData.email,
      token: userData.token,
      fotoPerfil: userData.fotoPerfil || NoPicture,
      role: roleNormalizado,          // Padroniza como 'role'
      roles: roleNormalizado,         // Mantém compatibilidade com 'roles'
      papel: roleNormalizado,         // Mantém compatibilidade com 'papel'
    };
    
    console.log(" Login realizado:", userWithDefaults);
    setUser(userWithDefaults);
    localStorage.setItem("user", JSON.stringify(userWithDefaults));
  };

  // logout
  const logout = () => {
    setUser(null);
    // Remove todos os dados de autenticação
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("email");
    console.log(' Logout concluído. Dados removidos do localStorage.');
  };

  // updateProfile (usado no EditaPerfil)
  const updateProfile = async (updates) => {
    try {
      if (!user || !user.id) {
        throw new Error("Usuário não está logado");
      }

      // envia atualização para backend
      const response = await api.put(`/usuarios/${user.id}`, updates);
      const updatedUser = response.data;

      // garante que fotoPerfil nunca fique vazio
      if (!updatedUser.fotoPerfil) updatedUser.fotoPerfil = NoPicture;

      // atualiza contexto e localStorage
      console.log("🔄 UserContext - Atualizando usuário:", updatedUser);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw error; // Re-throw para que o componente possa lidar com o erro
    }
  };

  return (
    <UserContext.Provider
      value={{
        user,
        login,
        logout,
        updateProfile,
        isLoggedIn: !!user?.id,
        setUser, // exposto para atualizações diretas (opcional)
      }}
    >
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}