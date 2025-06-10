import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/login/Login';
import Register from './pages/login/Register';
import SobreNos from './pages/sobre/SobreNos';
import QuebradaInforma from './pages/noticias/QuebradaInforma';
import NoticiasInfo from './pages/noticias/NoticiasInfo'; 
import Header from './components/Header';
import Footer from './components/Footer';

export default function App() {
  const location = useLocation();

  const isAuthPage = location.pathname === '/' || location.pathname === '/register';

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
        </Routes>
      </main>

      {!isAuthPage && <Footer />}
    </div>
  );
}
