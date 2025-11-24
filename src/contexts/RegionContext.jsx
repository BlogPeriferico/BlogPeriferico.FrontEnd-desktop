// src/contexts/RegionContext.jsx
import { createContext, useContext, useState, useEffect } from "react";

export const RegionContext = createContext();

function getInitialRegion() {
  // SSR-safe + try/catch pra não quebrar em modo privado
  if (typeof window === "undefined") return "centro";
  try {
    const saved = localStorage.getItem("regiao");
    return saved || "centro";
  } catch {
    return "centro";
  }
}

export function RegionProvider({ children }) {
  // lazy init -> só lê localStorage uma vez, na montagem
  const [regiao, setRegiao] = useState(getInitialRegion);

  useEffect(() => {
    if (!regiao) return;
    try {
      localStorage.setItem("regiao", regiao);
    } catch {
      // se der erro no localStorage, só ignora
    }
  }, [regiao]);

  return (
    <RegionContext.Provider value={{ regiao, setRegiao }}>
      {children}
    </RegionContext.Provider>
  );
}

export function useRegiao() {
  return useContext(RegionContext);
}
