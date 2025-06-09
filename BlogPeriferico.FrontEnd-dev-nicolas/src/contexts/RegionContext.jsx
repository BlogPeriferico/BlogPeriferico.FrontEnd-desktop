import { createContext, useContext, useState, useEffect } from 'react';

export const RegionContext = createContext();

export function RegionProvider({ children }) {
  // Recuperar a região salva do localStorage ou usar "centro" como padrão
  const savedRegion = localStorage.getItem('regiao');
  const [regiao, setRegiao] = useState(savedRegion || "centro"); // Se não tiver no localStorage, usa "centro"

  useEffect(() => {
    // Salvar a região sempre que ela for alterada
    if (regiao) {
      localStorage.setItem('regiao', regiao);
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
