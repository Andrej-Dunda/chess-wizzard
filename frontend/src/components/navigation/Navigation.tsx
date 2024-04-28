import './Navigation.scss'
import { useNav } from '../../contexts/NavigationProvider';

const Navigation = () => {
  const { toHome } = useNav();

  return (
    <div className="navigation">
      <h2 className='navigation-heading' onClick={toHome}>Chess Wizzard</h2>
      <button className="home-button" onClick={toHome}>Domů</button>
    </div>
  )
}
export default Navigation;