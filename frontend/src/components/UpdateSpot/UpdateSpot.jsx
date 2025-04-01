import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { updateSpotThunk } from '../../store/spots'; 
import { useParams, Navigate } from 'react-router-dom';
import './UpdateSpot.css';

const UpdateSpot = () => {
    const dispatch = useDispatch();
    const { id } = useParams();
    const spotId = parseInt(id, 10);
    console.log("parsed spot        ID:", spotId)
    const currentSpot = useSelector((state) => state.spots.byId[id]);

    const [formData, setFormData] = useState({
        name: '',
        address: '',
        city: '',
        state: '',
        country: '',
        lat: '',
        lng: '',
        price: '',
        description: '',
    });

    const [isUpdated, setIsUpdated] = useState();

    useEffect(() => {
        console.log("current spot here :", currentSpot)
        if (currentSpot) {
            setFormData(currentSpot); 
        }
    }, [currentSpot]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData({ ...formData, [name]: value }); 
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        dispatch(updateSpotThunk(id, formData)); 
        setIsUpdated(true); 
    };

    if (!currentSpot) {
        return <div>No spot found.</div>; 
    }

    if (isUpdated) {
        return <Navigate to={`/spots/${id}`} />; 
    }

    return (
        <div className="container">
            <h2>Update Spot</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Name:</label>
                    <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Address:</label>
                    <input
                        type="text"
                        name="address"
                        value={formData.address}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>City:</label>
                    <input
                        type="text"
                        name="city"
                        value={formData.city}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>State:</label>
                    <input
                        type="text"
                        name="state"
                        value={formData.state}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Country:</label>
                    <input
                        type="text"
                        name="country"
                        value={formData.country}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Latitude:</label>
                    <input
                        type="number"
                        name="lat"
                        value={formData.lat}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Longitude:</label>
                    <input
                        type="number"
                        name="lng"
                        value={formData.lng}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Price:</label>
                    <input
                        type="number"
                        name="price"
                        value={formData.price}
                        onChange={handleChange}
                        required
                    />
                </div>
                <div>
                    <label>Description:</label>
                    <textarea
                        name="description"
                        value={formData.description}
                        onChange={handleChange}
                        required
                    />
                </div>
                <button type="submit">Update Spot</button>
            </form>
        </div>
    );
};

export default UpdateSpot;
