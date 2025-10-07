import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/login/Login";
import Register from "./pages/login/Register";
import EditaPerfil from "./pages/login/EditaPerfil"; // ✅ rota de edição de perfil
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

export default function App() {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/" || location.pathname === "/register" || location.pathname === "/editar-perfil" ;

  return (
    <div className="flex flex-col min-h-screen">
      {!isAuthPage && <Header />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/editar-perfil" element={<EditaPerfil />} />{" "}
          <Route path="/sobre" element={<SobreNos />} />
          <Route path="/quebrada-informa" element={<QuebradaInforma />} />
          <Route path="/noticia/:id" element={<NoticiasInfo />} />
          <Route path="/achadinhos" element={<Vendas />} />
          <Route path="/produto/:id" element={<ProdutoInfo />} />
          <Route path="/doacoes" element={<Doacoes />} />
          <Route path="/doacao/:id" element={<DoacaoInfo />} />
          <Route path="/vagas" element={<CorreCerto />} />
          <Route path="/vaga/:id" element={<VagaInfo />} />
        </Routes>
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
}
