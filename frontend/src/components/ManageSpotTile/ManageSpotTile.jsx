import { useNavigate } from 'react-router-dom';
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
            <img src={spot.imagesUrl} alt={spot.name} className='spot_image' />
            <div className='spot_details'>
                <div className='spot_location'>{spot.city}, {spot.state}</div>
                <div className='spot_rating'><span className='star-icon'>⭐</span>{spot.rating ? `Rating: ${spot.rating}` : '4.8'}</div>
                
                <div className='spot_price'>${spot.price} per night</div>
                
                <div className="button-container"> 
                    <button onClick={handleUpdateClick}>Update</button>
                    <button onClick={handleDeleteClick}>Delete</button>
                </div>
            </div>
        </div>
    );
};





export default ManageSpotTile;