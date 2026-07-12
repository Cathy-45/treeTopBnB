import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import outdoorImage from '../../images/outdoors.jpg';
import Spots from '../Spots';
import SpotCarousel from '../Carousel/SpotCarousel';
import { getAllSpotsThunk } from '../../store/spots';
import './LandingPage.css';

const LandingPage = () => {
    const dispatch = useDispatch();
    const allSpots = useSelector((state) => state.spots.allSpots);

    useEffect(() => {
        dispatch(getAllSpotsThunk());
    }, [dispatch]);

    const featured = [...(allSpots || [])]
        .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
        .slice(0, 8);

    return (
        <div className="landing-page">
            <div className="hero" style={{ backgroundImage: `url(${outdoorImage})` }}>
                <div className="hero-overlay">
                    <h1>Find your stay in Zambia</h1>
                    <p>Real places, listed directly by the people who own them.</p>
                </div>
            </div>

            <div className="landing-listings">
                {featured.length > 0 && (
                    <SpotCarousel spots={featured} title="Featured stays" />
                )}

                <h2 className="section-heading">Explore stays</h2>
                <Spots />
            </div>
        </div>
    );
};

export default LandingPage;