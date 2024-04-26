import { useModal } from '../../contexts/ModalProvider';
import './Modal.scss';
import { ReactNode, useEffect, useRef } from 'react';

interface iModal {
  children: ReactNode;
}

const Modal: React.FC<iModal> = ({ children }) => {
  const modalRef = useRef<HTMLDivElement>(null); // Refer to the modal content
  const { closeModal } = useModal();
  let clickStartedInside = false; // Track where the click started

  useEffect(() => {
    const preventScroll = (e: WheelEvent) => {
      if (!document.querySelector('.modal')?.contains(e.target as Node)) {
        e.preventDefault();
      }
    };

    document.body.addEventListener('wheel', preventScroll, { passive: false });
    document.body.style.overflowY = 'hidden'

    return () => {
      document.body.removeEventListener('wheel', preventScroll);
      document.body.style.overflowY = 'initial'
    };
  }, []);

  const handleOverlayClick = (event: any) => {
    // Close only if clicked directly on overlay and the click didn't start inside the modal
    if (event.target.id === "overlay" && !clickStartedInside) {
      closeModal()
    }
    clickStartedInside = false; // Reset the flag
  };

  const handleModalMouseDown = () => {
    // Indicate the click started inside the modal
    clickStartedInside = true;
  };

  return (
    <div
      className='modal modal-overlay'
      id='overlay'
      onClick={handleOverlayClick}
    >
      <div
        className="modal-content"
        ref={modalRef}
        onMouseDown={handleModalMouseDown}
      >
        {children}
      </div>
    </div>
  )
}
export default Modal;