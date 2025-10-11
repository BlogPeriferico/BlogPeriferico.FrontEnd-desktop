import { createContext, useContext, useState, useEffect } from 'react';

export const UserContext = createContext();

export function UserProvider({ children }) {
  // Recuperar dados do usuário do localStorage ou usar valores padrão
  const savedUser = localStorage.getItem('user');
  const [user, setUser] = useState(savedUser ? JSON.parse(savedUser) : {
    id: null,
    nome: 'Usuário',
    email: '',
    fotoPerfil: 'https://i.pravatar.cc/150',
    role: 'visitante'
  });

  // Salvar no localStorage sempre que o usuário for alterado
  useEffect(() => {
    if (user.id) {
      localStorage.setItem('user', JSON.stringify(user));
    }
  }, [user]);

  const login = (userData) => {
    const userWithDefaults = {
      id: userData.id,
      nome: userData.nome || 'Usuário',
      email: userData.email || '',
      fotoPerfil: userData.fotoPerfil || 'https://i.pravatar.cc/150',
      role: userData.role || 'visitante'
    };
    setUser(userWithDefaults);
  };

  const logout = () => {
    setUser({
      id: null,
      nome: 'Usuário',
      email: '',
      fotoPerfil: 'https://i.pravatar.cc/150',
      role: 'visitante'
    });
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  const updateProfile = (updates) => {
    setUser(prev => ({ ...prev, ...updates }));
  };

  return (
    <UserContext.Provider value={{
      user,
      login,
      logout,
      updateProfile,
      isLoggedIn: !!user.id
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
