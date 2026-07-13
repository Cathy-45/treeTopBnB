

import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllSpotsThunk } from '../../store/spots';
import { SPOT_AMENITIES } from '../../constants/amenities';
import outdoorImage from '../../images/outdoors.jpg';
import './Spots.css';

const FALLBACK_IMAGE = outdoorImage;

const Spots = () => {
    const dispatch = useDispatch();
    const allSpots = useSelector(state => state.spots.allSpots);
    const [isLoaded, setIsLoaded] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const activeAmenityFilters = SPOT_AMENITIES.filter(({ key }) => searchParams.get(key) === '1');

    useEffect(() => {
        const getSpots = async () => {
            await dispatch(getAllSpotsThunk());
            setIsLoaded(true);
        };
        getSpots();
    }, [dispatch]);

    const toggleAmenityFilter = (key) => {
        const next = new URLSearchParams(searchParams);
        if (next.get(key) === '1') {
            next.delete(key);
        } else {
            next.set(key, '1');
        }
        setSearchParams(next);
    };

    if (!isLoaded) return <div>Loading...</div>;

    let visibleSpots = query
        ? (allSpots || []).filter((spot) =>
            spot.city?.toLowerCase().includes(query) ||
            spot.state?.toLowerCase().includes(query) ||
            spot.country?.toLowerCase().includes(query) ||
            spot.name?.toLowerCase().includes(query)
        )
        : (allSpots || []);

    if (activeAmenityFilters.length > 0) {
        visibleSpots = visibleSpots.filter((spot) =>
            activeAmenityFilters.every(({ key }) => !!spot[key])
        );
    }

    const filterBar = (
        <div className="amenity-filter-bar">
            {SPOT_AMENITIES.map(({ key, label, icon }) => {
                const active = searchParams.get(key) === '1';
                return (
                    <button
                        key={key}
                        type="button"
                        className={`amenity-filter-chip${active ? ' active' : ''}`}
                        onClick={() => toggleAmenityFilter(key)}
                    >
                        {icon} {label}
                    </button>
                );
            })}
        </div>
    );

    if (!visibleSpots || visibleSpots.length === 0) {
        return (
            <div>
                {filterBar}
                <div className="spots_empty">
                    {query || activeAmenityFilters.length > 0
                        ? 'No spots match your search/filters.'
                        : 'No spots available yet.'}
                </div>
            </div>
        );
    }

    return (
        <div>
            {filterBar}
            <div className='spots_container'>
                {visibleSpots.map((spot) => {
                    const badges = SPOT_AMENITIES.filter(({ key }) => !!spot[key]);
                    return (
                        <div key={spot.id} className='spot_tile'>
                            <Link to={`/spots/${spot.id}`} className='spot_link'>
                                <img
                                    src={spot.previewImage || FALLBACK_IMAGE}
                                    alt={spot.name}
                                    className='spot_image'
                                    onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                                />
                                {badges.length > 0 && (
                                    <div className="spot_badges">
                                        {badges.map(({ key, icon, label }) => (
                                            <span key={key} className="spot_badge" title={label}>{icon}</span>
                                        ))}
                                    </div>
                                )}
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
                    );
                })}
            </div>
        </div>
    );
};

export default Spots;