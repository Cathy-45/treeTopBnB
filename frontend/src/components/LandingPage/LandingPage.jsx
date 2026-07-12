import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import outdoorImage from '../../images/outdoors.jpg';
import Spots from '../Spots';
import SpotCarousel from '../Carousel/SpotCarousel';
import { getAllSpotsThunk } from '../../store/spots';
import { FEATURED_DESTINATIONS } from '../../constants/zambiaLocations';
import './LandingPage.css';

const LandingPage = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const allSpots = useSelector((state) => state.spots.allSpots);

    useEffect(() => {
        dispatch(getAllSpotsThunk());
    }, [dispatch]);

    const featured = [...(allSpots || [])]
        .sort((a, b) => (b.avgRating || 0) - (a.avgRating || 0))
        .slice(0, 8);

    const cityCounts = (allSpots || []).reduce((counts, spot) => {
        const city = spot.city;
        if (city) counts[city] = (counts[city] || 0) + 1;
        return counts;
    }, {});

    const goToCity = (city) => {
        navigate(`/search?q=${encodeURIComponent(city)}`);
    };

    return (
        <div className="landing-page">
            <div className="hero" style={{ backgroundImage: `url(${outdoorImage})` }}>
                <div className="hero-overlay">
                    <h1>Find your stay in Zambia</h1>
                    <p>Real places, listed directly by the people who own them.</p>
                </div>
            </div>

            <div className="landing-listings">
                <h2 className="section-heading">Browse by destination</h2>
                <div className="destination-row">
                    {FEATURED_DESTINATIONS.map(({ city, tagline }) => (
                        <button
                            key={city}
                            type="button"
                            className="destination-pill"
                            onClick={() => goToCity(city)}
                        >
                            <span className="destination-city">{city}</span>
                            <span className="destination-tagline">{tagline}</span>
                            {cityCounts[city] > 0 && (
                                <span className="destination-count">{cityCounts[city]} stay{cityCounts[city] === 1 ? '' : 's'}</span>
                            )}
                        </button>
                    ))}
                </div>

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