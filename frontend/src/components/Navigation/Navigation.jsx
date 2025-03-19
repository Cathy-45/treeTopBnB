// frontend/src/components/Navigation/Navigation.jsx

import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import './Navigation.css';
import logo from '../../images/logo.png';

function Navigation({ isLoaded }) {
  const sessionUser = useSelector(state => state.session.user);

  return (
<nav className="navbarContainer">

    <div className="navbar__logo">
    <img src={logo} alt="logo"/>
  </div>


    
    <ul>
      <li>
        <NavLink to="/">Home</NavLink>
        <ul className="navbar__links">
       <NavLink className='navLink' to="/" >Spots</NavLink> 
        <NavLink className='navLink' to="/booking">SpotDetails</NavLink>
        <NavLink className='navLink'to="/spotDetails">Reviews</NavLink>
        <NavLink className='navLink'to="/spotListings">SignUp</NavLink>
        <NavLink className='navLink'to="/reviews">Reviews</NavLink>
      
      </ul>

      </li>
      {isLoaded && (
        <li>
          <ProfileButton user={sessionUser} />
        </li>
      )}
    </ul>
  </nav>
  );

}

export default Navigation;
