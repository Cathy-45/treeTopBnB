

import { useEffect, useState } from 'react'; 
import { useDispatch, useSelector } from 'react-redux'; 
import { Link } from 'react-router-dom'; 
import { getAllSpotsThunk } from '../../store/spots'; 
import outdoorImage from '../../images/outdoors.jpg';
import './Spots.css';

const FALLBACK_IMAGE = outdoorImage;

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
    }, [dispatch]);

    if (!isLoaded) return <div>Loading...</div>;

    if (!allSpots || allSpots.length === 0) {
        return <div className="spots_empty">No spots available yet.</div>;
    }

    return (
        <div className='spots_container'>
            {allSpots.map((spot) => (
                <div key={spot.id} className='spot_tile'>
                    <Link to={`/spots/${spot.id}`} className='spot_link'>
                        <img
                            src={spot.previewImage || FALLBACK_IMAGE}
                            alt={spot.name}
                            className='spot_image'
                        />
                        <div className='spot_details'>
                            <div className='spot_location'>{spot.city}, {spot.state}</div>
                            <div className='spot_price'>${spot.price} night</div>
                            <div className='rating'>
                                <span className='star-icon'>⭐</span>
                                {spot.avgRating ? Number(spot.avgRating).toFixed(1) : 'New'}
                            </div>
                        </div>
                    </Link>
                </div>
            ))}
        </div>
    );
};

export default Spots;