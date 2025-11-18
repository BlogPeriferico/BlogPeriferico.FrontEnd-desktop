import React from 'react';
import { Navigate } from 'react-router-dom';
import { useUser } from '../contexts/UserContext';

export default function ProtectedRoute({ children }) {
  const { user } = useUser();
  
  console.log('=== PROTECTED ROUTE ===');
  console.log('Usuário:', user);
  console.log('É admin?', user?.roles === 'ROLE_ADMINISTRADOR' || user?.admin);
  
  if (!user || user.isVisitor) {
    console.log('Usuário não autenticado, redirecionando para login');
    return <Navigate to="/login" replace />;
  }
  
  // Verifica se é admin pela role ou pela propriedade admin
  const isAdmin = user.roles === 'ROLE_ADMINISTRADOR' || user.admin === true;
  
  if (!isAdmin) {
    console.log('Usuário não é admin, redirecionando para home');
    return <Navigate to="/" replace />;
  }

  console.log('Acesso permitido ao painel de admin');
  return children;
}
