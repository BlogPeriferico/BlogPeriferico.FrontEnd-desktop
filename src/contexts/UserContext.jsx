// src/contexts/UserContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/Api"; // sua instância Axios
import { jwtDecode } from "jwt-decode";
import NoPicture from "../assets/images/NoPicture.webp";

export const UserContext = createContext();

export function UserProvider({ children }) {
  const [user, setUser] = useState({ isVisitor: true }); // Inicia como visitante

  // Carrega usuário do token/localStorage ao iniciar
  useEffect(() => {
    const loadUser = async () => {
      try {
        console.log('=== INICIANDO CARREGAMENTO DO USUÁRIO ===');
        const token = localStorage.getItem("token");
        console.log('Token encontrado:', !!token);
        
        if (!token) {
          console.log('Nenhum token encontrado, definindo como visitante');
          setUser({ isVisitor: true });
          return;
        }

        // Verifica se já temos os dados do usuário no localStorage
        const savedUser = localStorage.getItem("user");
        console.log('Usuário salvo no localStorage:', savedUser);
        
        if (savedUser) {
          const parsedUser = JSON.parse(savedUser);
          console.log('Usuário do localStorage (parseado):', parsedUser);
          console.log('Admin status no localStorage:', parsedUser.admin);
          console.log('Roles no localStorage:', parsedUser.roles);
          setUser(parsedUser);
        }

        // Busca os dados mais recentes do servidor
        const decoded = jwtDecode(token);
        const email = decoded.sub;

        // Buscar usuário no backend
        const response = await api.get("/usuarios/listar");
        const usuarios = response.data;
        const usuarioEncontrado = usuarios.find((u) => u.email === email);

        if (usuarioEncontrado) {
          // Garante que o usuário tenha uma foto de perfil
          if (!usuarioEncontrado.fotoPerfil) {
            usuarioEncontrado.fotoPerfil = NoPicture;
          }
          
          const isAdmin = usuarioEncontrado.roles === 'ROLE_ADMINISTRADOR';
          const userData = {
            ...usuarioEncontrado,
            admin: isAdmin,
            isVisitor: false
          };
          
          console.log('=== DADOS DO USUÁRIO ===');
          console.log('Usuário encontrado:', usuarioEncontrado);
          console.log('Roles:', usuarioEncontrado.roles);
          console.log('É admin?', isAdmin);
          
          setUser(userData);
          localStorage.setItem("user", JSON.stringify(userData));
        } else if (savedUser) {
          // Se não encontrou no servidor mas tem no localStorage, mantém o do localStorage
          const parsedUser = JSON.parse(savedUser);
          setUser({
            ...parsedUser,
            isVisitor: false
          });
        } else {
          // Se não encontrou em lugar nenhum, mantém como visitante
          setUser({ isVisitor: true });
        }
      } catch (error) {
        console.error("❌ Erro ao carregar usuário:", error);
        // Em caso de erro, tenta carregar do localStorage
        const savedUser = localStorage.getItem("user");
        if (savedUser) {
          setUser(JSON.parse(savedUser));
        } else {
          setUser({ isVisitor: true });
        }
      }
    };

    loadUser();
  }, []);

  // Atualiza localStorage sempre que o user mudar
  useEffect(() => {
    if (user && user.id) {
      // Garante que a propriedade admin esteja sempre atualizada
      const updatedUser = {
        ...user,
        admin: user.roles === 'ROLE_ADMINISTRADOR' || user.admin === true
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));
    }
  }, [user]);

  // login
  const login = async (userData) => {
    try {
      // Se for um login com token, decodifica para obter o email
      if (userData.token) {
        const decoded = jwtDecode(userData.token);
        const email = decoded.sub;
        
        // Busca os dados completos do usuário
        const response = await api.get("/usuarios/listar");
        const usuarios = response.data;
        const usuarioEncontrado = usuarios.find((u) => u.email === email);
        
        if (usuarioEncontrado) {
          // Garante que o usuário tenha uma foto de perfil
          if (!usuarioEncontrado.fotoPerfil) {
            usuarioEncontrado.fotoPerfil = NoPicture;
          }
          
          // Verifica se é admin
          const isAdmin = usuarioEncontrado.roles === 'ROLE_ADMINISTRADOR';
          const userData = {
            ...usuarioEncontrado,
            admin: isAdmin,
            isVisitor: false
          };
          
          console.log('=== LOGIN - DADOS DO USUÁRIO ===');
          console.log('Usuário encontrado:', usuarioEncontrado);
          console.log('Roles:', usuarioEncontrado.roles);
          console.log('É admin?', isAdmin);
          
          // Atualiza o estado do usuário
          setUser(userData);
          
          // Salva no localStorage
          localStorage.setItem("user", JSON.stringify(userData));
          
          return usuarioEncontrado;
        }
      }
      
      // Se não encontrou o usuário ou não tem token, mantém como visitante
      console.warn("⚠️ Usuário não encontrado ou token inválido");
      return null;
    } catch (error) {
      console.error("❌ Erro ao fazer login:", error);
      throw error;
    }
  };

  // logout
  const logout = () => {
    setUser(null);
    // Remove todos os dados de autenticação
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    localStorage.removeItem("email");
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
        user: user || { isVisitor: true },
        login,
        logout,
        updateProfile,
        isLoggedIn: !!user?.id,
        isVisitor: !user?.id || user.isVisitor,
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
