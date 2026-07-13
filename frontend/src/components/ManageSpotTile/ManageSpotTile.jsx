import { useNavigate } from 'react-router-dom';
import outdoorImage from '../../images/outdoors.jpg';
import { SPOT_AMENITIES } from '../../constants/amenities';
import './ManageSpotTile.css';

const ManageSpotTile = ({ spot, onDeleteClick }) => {
    const navigate = useNavigate();
    const badges = SPOT_AMENITIES.filter(({ key }) => !!spot[key]);

    const handleSpotClick = () => {
        navigate(`/spots/${spot.id}`); 
    };

    const handleUpdateClick = (e) => {
        e.stopPropagation(); 
        navigate(`/updatespot/${spot.id}`); 
    };

    const handleDeleteClick = async (e) => {
        e.stopPropagation(); 
        await onDeleteClick(spot.id); 
    };

    return (
        <div className="spot-tile" onClick={handleSpotClick}>
            <div className="spot-tile-image-wrap">
                <img
                    src={spot.previewImage || outdoorImage}
                    alt={spot.name}
                    className='spot_image'
                    onError={(e) => { e.target.onerror = null; e.target.src = outdoorImage; }}
                />
                {badges.length > 0 && (
                    <div className="spot_badges">
                        {badges.map(({ key, icon, label }) => (
                            <span key={key} className="spot_badge" title={label}>{icon}</span>
                        ))}
                    </div>
                )}
            </div>
            <div className='spot_details'>
                <div className='spot_location'>{spot.city}, {spot.state}</div>
                <div className='rating'>
                    <span className='star-icon'>⭐</span>
                    {spot.avgRating ? Number(spot.avgRating).toFixed(1) : 'New'}
                </div>

                <div className='spot_price'>${spot.price} per night</div>

                <div className="button-container">
                    <button onClick={handleUpdateClick}>Update</button>
                    <button className="delete-btn" onClick={handleDeleteClick}>Delete</button>
                </div>
            </div>
        </div>
    );
};





export default ManageSpotTile;