

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllSpotsThunk } from '../../store/spots';
import outdoorImage from '../../images/outdoors.jpg';
import './Spots.css';

const FALLBACK_IMAGE = outdoorImage;

const Spots = () => {
    const dispatch = useDispatch();
    const allSpots = useSelector(state => state.spots.allSpots);
    const [isLoaded, setIsLoaded] = useState(false);
    const [searchParams] = useSearchParams();
    const query = (searchParams.get('q') || '').trim().toLowerCase();

    useEffect(() => {
        const getSpots = async () => {
            await dispatch(getAllSpotsThunk());
            setIsLoaded(true);
        };
        getSpots();
    }, [dispatch]);

    if (!isLoaded) return <div>Loading...</div>;

    const visibleSpots = query
        ? (allSpots || []).filter((spot) =>
            spot.city?.toLowerCase().includes(query) ||
            spot.state?.toLowerCase().includes(query) ||
            spot.country?.toLowerCase().includes(query) ||
            spot.name?.toLowerCase().includes(query)
        )
        : allSpots;

    if (!visibleSpots || visibleSpots.length === 0) {
        return (
            <div className="spots_empty">
                {query ? `No spots match "${searchParams.get('q')}".` : 'No spots available yet.'}
            </div>
        );
    }

    return (
        <div className='spots_container'>
            {visibleSpots.map((spot) => (
                <div key={spot.id} className='spot_tile'>
                    <Link to={`/spots/${spot.id}`} className='spot_link'>
                        <img
                            src={spot.previewImage || FALLBACK_IMAGE}
                            alt={spot.name}
                            className='spot_image'
                            onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
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