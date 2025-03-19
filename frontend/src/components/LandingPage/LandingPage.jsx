import { Link } from 'react-router-dom';
import outdoorImage from '../../images/outdoors.jpg';


const LandingPage = () => {
    return (
        <div>
            <div className="navbar">
                <div className="links">
                    <Link to="/">Link1</Link>
                    <Link to="/">Link2</Link>
                    <Link to="/">Link3</Link>
                    <Link to="/">Link4</Link>
                </div>
            </div>
            <div className="header">ELEVATED STAY TREETOP CABINS</div>
            <div className="image">
                <img src={outdoorImage} alt="Blissful Outdoors" />
            </div>
            <div className="textbox">
                <p>Our Selene Interiors stand as an unparalleled emblem of our service to our clients. It is our belief that your time away from home is met by our excellent service!</p>
            </div>
            <Link className="call-to-action button" to="/spots">View All Spots</Link>
        </div>
    );
};

export default LandingPage;