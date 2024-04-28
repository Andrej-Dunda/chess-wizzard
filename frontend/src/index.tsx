import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import { ModalProvider } from './contexts/ModalProvider';
import { NavigationProvider } from './contexts/NavigationProvider';
import { SnackbarProvider } from './contexts/SnackbarProvider';
import { TournamentsProvider } from './contexts/TournamentsProvider';
import { BrowserRouter as Router } from 'react-router-dom'

const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);
root.render(
  <React.StrictMode>
    <Router>
      <SnackbarProvider>
        <NavigationProvider>
          <TournamentsProvider>
            <ModalProvider>
              <App />
            </ModalProvider>
          </TournamentsProvider>
        </NavigationProvider>
      </SnackbarProvider>
    </Router>
  </React.StrictMode>
);
