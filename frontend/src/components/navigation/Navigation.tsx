import { useNavigate } from 'react-router-dom';
import './Navigation.scss'

const Navigation = () => {
  const navigate = useNavigate();

  return (
    <div className="navigation">
      <h1 className='navigation-heading'>Chess Wizzard</h1>
      <button className="home-button" onClick={() => navigate('/')}>Domů</button>
    </div>
  )
}
export default Navigation;