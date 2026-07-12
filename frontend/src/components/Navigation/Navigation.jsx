import { NavLink } from 'react-router-dom';
import { useSelector } from 'react-redux';
import ProfileButton from './ProfileButton';
import './Navigation.css';
import logo from '../../images/logo.png';
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
                    <img src={logo} alt="ZedBnB logo" className="logo" />
                    <span className="site_name">ZedBnB</span>
                </NavLink>

                <form className="navbar_search" onSubmit={handleSearchSubmit}>
                    <FaSearch className="search_icon" onClick={handleSearchSubmit} />
                    <input
                        type="text"
                        placeholder="Search by city..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="search_input"
                    />
                </form>

                <div className="navbar_right">
                    {isLoaded && sessionUser && (
                        <NavLink to="/createspot" className="create-spot-link">
                            List your property
                        </NavLink>
                    )}
                    {isLoaded && (<ProfileButton user={sessionUser} />)}
                </div>
            </div>
        </nav>
    );
}

export default Navigation;