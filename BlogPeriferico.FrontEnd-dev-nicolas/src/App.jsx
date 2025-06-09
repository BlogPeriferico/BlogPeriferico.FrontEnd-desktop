import React from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import Login from './pages/login/Login';
import Register from './pages/login/Register';
import SobreNos from './pages/sobre/SobreNos';
import QuebradaInforma from './pages/noticias/QuebradaInforma';
import Header from './components/Header';
import Footer from './components/Footer';

export default function App() {
  const location = useLocation();

  const isAuthPage = location.pathname === '/' || location.pathname === '/register';

  return (
    
        <div > {/* Tu mexeu aqui*/}

      {!isAuthPage && <Header />}

      <main className="flex-1"> {/* Expande o conteúdo */}
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/sobre" element={<SobreNos />} />
          <Route path="/quebrada-informa" element={<QuebradaInforma />} />
        </Routes>
      </main>

      {!isAuthPage && <Footer />} {/* Só aparece nas páginas pós-login */}
    </div>
  );
}
