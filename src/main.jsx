import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";

import App from "./App";
import "./index.css";

const rootElement = document.getElementById("root");

// Guarda básica: se o elemento root não existir, avisa claro
if (!rootElement) {
  throw new Error(
    'Elemento raiz "#root" não encontrado no HTML. Verifique seu index.html.'
  );
}

const root = ReactDOM.createRoot(rootElement);

root.render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>
);
