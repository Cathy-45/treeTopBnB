import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getSpotDetailsThunk } from '../../store/spots'; 
import './SpotDetails.css'; 

import cozyBed from '../../images/cozybed.jpg';



const SpotDetails = () => {
    const { id } = useParams(); 
    const dispatch = useDispatch();
    const spot = useSelector(state => state.spots.byId[id]); 
    
    const [isLoaded, setIsLoaded] = useState(false);
    
    
    useEffect(() => {
        const getSpotDetails = async () => {
                    await dispatch(getSpotDetailsThunk());
                    setIsLoaded(true);
                };
        // step 2: fetch data the from the backend server on component mount
        if (!spot) {
            dispatch(getSpotDetailsThunk(id)); 
        }
        getSpotDetails();
    }, [dispatch, id, spot]);

    const handleReserve = () => {
        alert("Feature coming soon");
    };

    // Optional 
    if (!isLoaded) {
        return <div>Loading...</div>;
    }

    return (
        <div className="spot-details-container">
            <h1>{spot.name}</h1>
            <p>Location: {spot.city}, {spot.state}, {spot.country}</p>
            <img src={spot.previewImage} alt={spot.name} className="spot-preview-image" />
            <div className="spot-images">
                {spot.images.map((image, idx) => (
                    <img key={idx} src={cozyBed} alt={`Spot image ${idx + 1}`} className="spot-image" />
                ))}
            </div>
            <p>Hosted by {spot.host.firstName} {spot.host.lastName}</p>
            <p>{spot.description}</p>
            <div className="callout">
                <p>${spot.price} night</p>
                <button onClick={handleReserve}>Reserve</button>
            </div>
        </div>
    );
};

export default SpotDetails;