import React from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import Login from "./pages/login/Login";
import Register from "./pages/login/Register";
import SobreNos from "./pages/sobre/SobreNos";
import QuebradaInforma from "./pages/noticias/QuebradaInforma";
import NoticiasInfo from "./pages/noticias/NoticiasInfo";
import Vendas from "./pages/vendas/Achadinhos";
import Header from "./components/Header";
import Footer from "./components/Footer";
import ProdutoInfo from "./pages/vendas/ProdutoInfo";
import Doacoes from "./pages/doacoes/MaoAmiga";
import DoacaoInfo from "./pages/doacoes/DoacaoInfo";
import CorreCerto from "./pages/vagas/CorreCerto";

export default function App() {
  const location = useLocation();

  const isAuthPage =
    location.pathname === "/" || location.pathname === "/register";

  return (
    <div>
      {!isAuthPage && <Header />}

      <main className="flex-1">
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/sobre" element={<SobreNos />} />
          <Route path="/quebrada-informa" element={<QuebradaInforma />} />
          <Route path="/noticia/:id" element={<NoticiasInfo />} />
          <Route path="/achadinhos" element={<Vendas />} />
          <Route path="/produto" element={<ProdutoInfo />} />
          <Route path="/doacoes" element={<Doacoes />} />
          <Route path="/doacao" element={<DoacaoInfo />} />
          <Route path="/vagas" element={<CorreCerto />} />
        </Routes>
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
}
