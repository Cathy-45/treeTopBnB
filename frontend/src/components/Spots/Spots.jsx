
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { getAllSpotsThunk } from '../../store/spots';
import './Spots.css'; 

const Spots = () => {
    const dispatch = useDispatch();
    const allSpots = useSelector(state => state.spots.allSpots);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const getSpots = async () => {
            await dispatch(getAllSpotsThunk());
            setIsLoaded(true);
        };
        getSpots();
    }, [dispatch]); // Only run once on mount

    if (!isLoaded) {
        return <div>Loading...</div>; // Optional loading state
    }

    return (
        <div className='spots_container'>
            {allSpots.map((spot, idx) => (
                <div key={`${idx}-${spot.id}`} className='spot_tile'>
                    <Link to={`/spots/${spot.id}`} className='spot_link'>
                        <img src={spot.imagesUrl} alt={spot.name} className='spot_image' />
                        <div className='spot_details'>
                            <div className='spot_location'>
                                {spot.city}, {spot.state}
                            </div>
                            <div className='spot_rating' title={spot.name}>
                                {spot.reviews.length === 0 ? 'New' : spot.avgRating.toFixed(1)} ★
                            </div>
                            <div className='spot_price'>
                                ${spot.price} night
                            </div>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default Spots;