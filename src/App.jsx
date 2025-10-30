import React from "react";
import { Routes, Route, useLocation, useNavigate, Navigate } from "react-router-dom";
import { useUser } from "./contexts/UserContext";
import Login from "./pages/login/Login";
import Register from "./pages/login/Register";
import EditaPerfil from "./pages/login/EditaPerfil";
import Perfil from "./pages/perfil/Perfil";
import SobreNos from "./pages/sobre/SobreNos";
import QuebradaInforma from "./pages/noticias/QuebradaInforma";
import NoticiasInfo from "./pages/noticias/NoticiasInfo";
import Vendas from "./pages/vendas/Achadinhos";
import ProdutoInfo from "./pages/vendas/ProdutoInfo";
import Doacoes from "./pages/doacoes/MaoAmiga";
import DoacaoInfo from "./pages/doacoes/DoacaoInfo";
import CorreCerto from "./pages/vagas/CorreCerto";
import VagaInfo from "./pages/vagas/VagasInfo";
import Header from "./components/Header";
import Footer from "./components/Footer";
import { UserProvider } from "./contexts/UserContext";
import { RegionProvider } from "./contexts/RegionContext";

function AppContent() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isLoggedIn } = useUser();

  const isAuthPage =
    location.pathname === "/login" ||
    location.pathname === "/register" ||
    location.pathname === "/editar-perfil";

  return (
        <div className="flex flex-col min-h-screen">
          {!isAuthPage && <Header />}

          <main className="flex-1">
            <Routes>
              <Route path="/" element={<QuebradaInforma />} />
              <Route path="/login" element={
                <div className="min-h-screen flex items-center justify-center">
                  <Login onLoginSuccess={() => navigate('/')} />
                </div>
              } />
              <Route path="/register" element={
                <div className="min-h-screen flex items-center justify-center">
                  <Register onRegisterSuccess={() => navigate('/login')} />
                </div>
              } />
              <Route path="/editar-perfil" element={<EditaPerfil />} />
              <Route path="/perfil" element={
                isLoggedIn ? <Perfil /> : <Navigate to="/login" replace />
              } />
              <Route path="/sobre" element={<SobreNos />} />
              <Route path="/quebrada-informa" element={<QuebradaInforma />} />
              <Route path="/noticia/:id" element={<NoticiasInfo />} />
              <Route path="/achadinhos" element={<Vendas />} />
              <Route path="/produto/:id" element={<ProdutoInfo />} />
              <Route path="/doacoes" element={<Doacoes />} />
              <Route path="/doacao/:id" element={<DoacaoInfo />} />
              <Route path="/vagas" element={<CorreCerto />} />
              <Route path="/vaga/:id" element={<VagaInfo />} />
              {/* Rota de fallback para páginas não encontradas */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>

          {!isAuthPage && <Footer />}
        </div>
  );
}

export default function App() {
  return (
    <RegionProvider>
      <UserProvider>
        <AppContent />
      </UserProvider>
    </RegionProvider>
  );
}
