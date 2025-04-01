import { Link } from 'react-router-dom';
import outdoorImage from '../../images/outdoors.jpg';
import './LandingPage.css';

const LandingPage = () => {
    return (
        <div className="landing-page">
            <header className="header">
                <h1>Welcome to TreetopBnB</h1>
                <h2>Your Home Away From Home!</h2>
            </header>
            <div className="image-container">
                <img src={outdoorImage} alt="Blissful Outdoors" className="landing-image" />
            </div>
            <p className="description">
                Our Selene Interiors stand as an unparalleled emblem of our service to our clients. It is our belief that your time away from home is met by our excellent service!
            </p>
            <Link className="call-to-action button" to="/spots">View All Spots</Link>
        </div>
    );
};

export default LandingPage;