import { useState, createContext, useContext, ReactNode } from 'react';
import Modal from '../components/modal/Modal';

interface ModalContextType {
  showModal: (content: ReactNode) => void;
  closeModal: () => void;
  modalOpen: boolean;
}
export interface ModalProps {
  closeModal: () => void;
}

export const ModalContext = createContext<ModalContextType | null>(null);

export const ModalProvider = ({ children }: { children: ReactNode }) => {

  const [modalContent, setModalContent] = useState<ReactNode>(null);
  const [modalOpen, setModalOpen] = useState(false);

  const showModal = (content: ReactNode) => {
      setModalContent(content);
      setModalOpen(true);
  };

  const closeModal = () => {
    setModalContent(null);
    setModalOpen(false);
  };

  const contextValue: ModalContextType = {
    showModal,
    closeModal,
    modalOpen,
  };

  return (
    <ModalContext.Provider value={contextValue}>
      {children}
      {modalOpen && modalContent &&
      <Modal>
        {modalContent}
      </Modal>}
    </ModalContext.Provider>
  );
};

export const useModal = () => {
  const currentContext = useContext(ModalContext);

  if (!currentContext) {
    throw new Error('useModal must be used within ModalProvider');
  }

  return currentContext;
};
