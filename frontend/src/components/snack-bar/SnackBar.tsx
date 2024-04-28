import './SnackBar.scss';

interface SnackbarProps {
  message: string;
  fade: string;
  closeSnackbar: () => void;
}

const Snackbar: React.FC<SnackbarProps> = ({ message, fade, closeSnackbar }) => {
  return (
    <div className={`snackbar ${fade}`} onClick={closeSnackbar}>
      {message}
    </div>
  );
};

export default Snackbar;
