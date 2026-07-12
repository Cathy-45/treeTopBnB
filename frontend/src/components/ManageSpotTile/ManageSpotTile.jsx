import { useNavigate } from 'react-router-dom';
import outdoorImage from '../../images/outdoors.jpg';
import './ManageSpotTile.css';

const ManageSpotTile = ({ spot, onDeleteClick }) => {
    const navigate = useNavigate();

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
            <img
                src={spot.previewImage || outdoorImage}
                alt={spot.name}
                className='spot_image'
                onError={(e) => { e.target.onerror = null; e.target.src = outdoorImage; }}
            />
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