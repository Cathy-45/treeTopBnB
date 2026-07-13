import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import './Navigation.css';
import logo from '../../images/zedbnb_logo_final.png';
import { FaSearch } from 'react-icons/fa';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

function Navigation({ isLoaded }) {
    const sessionUser = useSelector(state => state.session.user);
    const navigate = useNavigate();

    const [searchQuery, setSearchQuery] = useState('');

    const handleSearchSubmit = (e) => {
        e.preventDefault();
        if (searchQuery.trim()) {
            navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
        }
    };

    return (
        <nav className="navbarContainer">
            <div className="navbar_inner">
                <NavLink to="/" className="navbar_logo">
                    <img src={logo} alt="ZedBnB" className="logo" />
                </NavLink>

                <form className="navbar_search" onSubmit={handleSearchSubmit}>
                    <input
                        type="text"
                        placeholder="Search by city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search_input"
                    />
                    <button type="submit" className="search_button" aria-label="Search">
                        <FaSearch className="search_icon" />
                    </button>
                </form>

                <div className="navbar_right">
                    <NavLink to="/experiences" className="experiences-link">
                        Experiences
                    </NavLink>
                    {isLoaded && sessionUser && (
                        <NavLink to="/createspot" className="create-spot-link">
                            List your property
                        </NavLink>
                    )}
                    {isLoaded && sessionUser && (
                        <NavLink to="/createexperience" className="create-experience-link">
                            Host an experience
                        </NavLink>
                    )}
                    {isLoaded && (<ProfileButton user={sessionUser} />)}
                </div>
            </div>
        </nav>
    );
}

export default Navigation;