import './DeleteModalContent.scss';
import ModalFooter from "../modal-footer/ModalFooter";
import { useModal } from '../../../contexts/ModalProvider';

type DeleteModalContentProps = {
  onSubmit: () => void;
  onClose?: () => void;
  submitButtonLabel: string;
  cancelButtonLabel: string;
  title: string;
  content?: string;
}

const DeleteModalContent: React.FC<DeleteModalContentProps> = ({ onSubmit, onClose, submitButtonLabel, cancelButtonLabel, title, content }) => {
  const { closeModal } = useModal();

  const submitDelete = () => {
    onSubmit()
    closeModal()
  }

  return (
    <div className="delete-modal-content">
      <h1 className='title'>{title}</h1>
      <p className='content'>{content}</p>
      <ModalFooter
        onSubmit={submitDelete}
        onClose={onClose}
        submitButtonLabel={submitButtonLabel}
        cancelButtonLabel={cancelButtonLabel}
      />
    </div>
  )
}
export default DeleteModalContent;