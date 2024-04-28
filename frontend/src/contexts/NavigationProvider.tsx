import { createContext, useContext, ReactNode, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

interface iNavigationContext {
  toHome: () => void;
  toTournament: () => void;
  activeLink: string;
  setActiveLink: React.Dispatch<React.SetStateAction<string>>;
  toPreviousPage: () => void;
}

export const NavigationContext = createContext<iNavigationContext | null>(null)

export const NavigationProvider = ({ children }: { children: ReactNode }) => {
  const navigate = useNavigate();
  const [activeLink, setActiveLink] = useState<string>(localStorage.getItem('activeLink') || '/');

  useEffect(() => {
    localStorage.setItem('activeLink', activeLink);
  }, [activeLink]);

  const toHome = () => {
    navigate('/');
    setActiveLink('/')
  }

  const toTournament = () => {
    navigate('/tournament');
    setActiveLink('/tournament')
  }

  const toPreviousPage = () => {
    navigate(activeLink);
  }

  return (
    <NavigationContext.Provider value={{
      toHome,
      toTournament,
      activeLink,
      setActiveLink,
      toPreviousPage
    }}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNav = () => {
  const currentContext = useContext(NavigationContext);

  if (!currentContext) {
    throw new Error('useNav must be used within NavigationProvider!');
  }

  return currentContext;
};
