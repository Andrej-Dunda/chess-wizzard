import './ErrorMessage.scss'

interface iErrorMessage {
  content: string;
}

const ErrorMessage: React.FC<iErrorMessage> = ({ content }) => {
  return (
    <>
      {content && <span className={`error-message unselectable ${content ? 'active' : 'inactive'}`}>{content}</span>}
    </>
  )
}
export default ErrorMessage;