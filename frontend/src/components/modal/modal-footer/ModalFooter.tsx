import { useEffect, useRef } from 'react';
import './ModalFooter.scss'
import { useModal } from '../../../contexts/ModalProvider';

interface iModalFooter {
  onSubmit: () => void;
  onClose?: () => void;
  submitButtonLabel: string;
  cancelButtonLabel: string;
}

const ModalFooter: React.FC<iModalFooter> = ({ onSubmit, onClose, submitButtonLabel, cancelButtonLabel }) => {
  const { closeModal } = useModal();
  const submitButtonRef = useRef<HTMLButtonElement>(null)
  const cancelButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        closeModal();
        cancelButtonRef.current && cancelButtonRef.current.click();
      }
      else if (event.key === 'Enter') {
        closeModal();
        submitButtonRef.current && submitButtonRef.current.click();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [closeModal, onSubmit, onClose]);
  
  const close = (e: React.MouseEvent<HTMLButtonElement>) => {
    onClose && onClose()
    closeModal()
  }

  const submit = (e: React.MouseEvent<HTMLButtonElement>) => {
    onSubmit && onSubmit()
  }

  return (
    <div className="modal-footer">
      <div>
        <button type='button' className='modal-button cancel-button' onClick={close} ref={cancelButtonRef}>{cancelButtonLabel}</button>
      </div>
      <div>
        <button type='button' className='modal-button submit-button' onClick={submit} ref={submitButtonRef}>{submitButtonLabel}</button>
      </div>
    </div>
  )
}
export default ModalFooter;