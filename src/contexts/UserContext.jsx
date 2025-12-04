// src/contexts/UserContext.jsx
import { createContext, useContext, useState, useEffect } from "react";
import api from "../services/Api";
import { jwtDecode } from "jwt-decode";
import NoPicture from "../assets/images/NoPicture.webp";

export const UserContext = createContext();

// Helper seguro pra ler user salvo
function getInitialUser() {
  if (typeof window === "undefined") return { isVisitor: true };

  try {
    const saved = localStorage.getItem("user");
    if (saved) {
      const parsed = JSON.parse(saved);
      return parsed || { isVisitor: true };
    }
  } catch {
    // se der erro, mantém visitante
  }

  return { isVisitor: true };
}

function normalizeUser(raw) {
  if (!raw) return { isVisitor: true };

  const roles = raw.roles || raw.role || raw.papel || null;

  const isAdmin =
    raw.admin === true ||
    (typeof roles === "string" &&
      roles.toUpperCase().includes("ADMINISTRADOR"));

  return {
    ...raw,
    fotoPerfil: raw.fotoPerfil || NoPicture,
    admin: isAdmin,
    isVisitor: !raw.id ? true : false,
  };
}

export function UserProvider({ children }) {
  const [user, setUser] = useState(() => normalizeUser(getInitialUser()));

  // Carrega/atualiza usuário com base no token gravado
  useEffect(() => {
    const loadUser = async () => {
      try {
        const token = localStorage.getItem("token");

        if (!token) {
          setUser({ isVisitor: true });
          return;
        }

        // tenta pegar user salvo pra dar "first paint" rápido
        let savedUser = null;
        try {
          const saved = localStorage.getItem("user");
          if (saved) savedUser = JSON.parse(saved);
        } catch {
          savedUser = null;
        }

        if (savedUser) {
          setUser(normalizeUser(savedUser));
        }

        // decodificar token pra pegar email
        const decoded = jwtDecode(token);
        const email = decoded.sub;

        // busca lista de usuários (modelo atual do back)
        const response = await api.get("/usuarios/listar");
        const usuarios = Array.isArray(response.data) ? response.data : [];

        const usuarioEncontrado = usuarios.find((u) => u.email === email);

        if (usuarioEncontrado) {
          const normalized = normalizeUser(usuarioEncontrado);

          setUser(normalized);
          localStorage.setItem("user", JSON.stringify(normalized));
        } else if (!savedUser) {
          // se não achou no back nem tem salvo -> visitante
          setUser({ isVisitor: true });
        }
      } catch (error) {
        console.error("❌ Erro ao carregar usuário:", error);

        // fallback: tenta usar user salvo
        try {
          const saved = localStorage.getItem("user");
          if (saved) {
            const parsed = JSON.parse(saved);
            setUser(normalizeUser(parsed));
          } else {
            setUser({ isVisitor: true });
          }
        } catch {
          setUser({ isVisitor: true });
        }
      }
    };

    loadUser();
  }, []);

  // Mantém localStorage sempre em sync quando user mudar
  useEffect(() => {
    try {
      if (user && user.id) {
        const normalized = normalizeUser(user);
        localStorage.setItem("user", JSON.stringify(normalized));
      }
    } catch {
      // ignore erro de localStorage
    }
  }, [user]);

  // login com token
  const login = async (loginData) => {
    try {
      if (!loginData?.token) {
        console.warn("⚠️ Nenhum token recebido no login");
        return null;
      }

      const decoded = jwtDecode(loginData.token);
      const email = decoded.sub;

      const response = await api.get("/usuarios/listar");
      const usuarios = Array.isArray(response.data) ? response.data : [];
      const usuarioEncontrado = usuarios.find((u) => u.email === email);

      if (usuarioEncontrado) {
        const normalized = normalizeUser(usuarioEncontrado);

        setUser(normalized);
        localStorage.setItem("user", JSON.stringify(normalized));
        localStorage.setItem("token", loginData.token);

        return usuarioEncontrado;
      }

      console.warn("⚠️ Usuário não encontrado no backend");
      return null;
    } catch (error) {
      console.error("❌ Erro ao fazer login:", error);
      throw error;
    }
  };

  // logout total
  const logout = () => {
    setUser({ isVisitor: true });
    try {
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      localStorage.removeItem("userRole");
      localStorage.removeItem("email");
    } catch {
      // ignore
    }
  };

  // updateProfile (usado no EditaPerfil)
  const updateProfile = async (updates) => {
    if (!user || !user.id) {
      throw new Error("Usuário não está logado");
    }

    try {
      // Se for atualização de biografia, usa o endpoint específico
      if ('biografia' in updates) {
        const response = await api.patch(
          `/usuarios/${user.id}/biografia`,
          null,
          {
            params: { biografia: updates.biografia || '' },
            headers: {
              'Content-Type': 'application/json'
            }
          }
        );
        const updatedUser = normalizeUser(response.data);
        setUser(updatedUser);
        localStorage.setItem("user", JSON.stringify(updatedUser));
        return updatedUser;
      }

      // Para outras atualizações, mantém o comportamento original
      const response = await api.put(`/usuarios/${user.id}`, updates, {
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      const updatedUser = normalizeUser(response.data);
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
      return updatedUser;
    } catch (error) {
      console.error("Erro ao atualizar perfil:", error);
      throw error;
    }
  };

  const value = {
    user: user || { isVisitor: true },
    login,
    logout,
    updateProfile,
    isLoggedIn: !!user?.id && !user?.isVisitor,
    isVisitor: !user?.id || user?.isVisitor,
    setUser, // se precisar mexer direto em algum fluxo específico
  };

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

export function useUser() {
  return useContext(UserContext);
}
