import Navigation from '../components/navigation/Navigation';
import './Layout.scss'
import { Outlet } from "react-router-dom";

const Layout = () => {
  return (
    <div className='layout'>
      <Navigation />
      <Outlet />
    </div>
  )
}
export default Layout;