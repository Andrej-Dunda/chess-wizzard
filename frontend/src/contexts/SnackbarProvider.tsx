import React, { createContext, useContext, useState, ReactNode } from 'react';
import Snackbar from '../components/snack-bar/SnackBar';

interface SnackbarContextType {
  openSnackbar: (msg: string) => void;
  closeSnackbar: () => void;
}

export const SnackbarContext = createContext<SnackbarContextType | null>(null);

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [open, setOpen] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");
  const [timer, setTimer] = useState<NodeJS.Timeout | null>(null);
  const [fade, setFade] = useState("fade-in");

  const openSnackbar = (msg: string) => {
    setMessage(msg);
    setOpen(true);
  
    // Automatically close the snackbar after 3 seconds
    if (timer) clearTimeout(timer);
    
    setTimer(setTimeout(() => {
      closeSnackbar();
    }, 3000));
  };

  const closeSnackbar = () => {
    setFade("fade-out");

    setTimeout(() => {
      setOpen(false);
      setMessage("");
      setFade("fade-in");
    }, 300);
  };

  return (
    <SnackbarContext.Provider value={{ openSnackbar, closeSnackbar }}>
      {children}
      {open && (
        <Snackbar message={message} fade={fade} closeSnackbar={closeSnackbar} />
      )} 
    </SnackbarContext.Provider>
  );
};

export const useSnackbar = () => {
  const currentContext = useContext(SnackbarContext);

  if (!currentContext) {
    throw new Error('useSnackbar must be used within SnackbarProvider');
  }

  return currentContext;
};
