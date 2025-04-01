import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSpotThunk } from '../../store/spots';
import './CreateSpot.css';

const CreateSpot = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        country: '',
        streetAddress: '',
        city: '',
        state: '',
        description: '',
        spotTitle: '',
        price: '',
        imageUrls: ['', ''], 
        lat: '',
        lng: '',
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e, fieldName) => {
        const { value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [fieldName]: value,
        }));
    };

    const handleImageUrlChange = (index, value) => {
        const newImageUrls = [...form.imageUrls];
        newImageUrls[index] = value;
        setForm((prevForm) => ({
            ...prevForm,
            imageUrls: newImageUrls,
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.country) newErrors.country = "Country is required";
        if (!form.streetAddress) newErrors.streetAddress = "Street Address is required";
        if (!form.city) newErrors.city = "City is required";
        if (!form.state) newErrors.state = "State is required";
        if (form.description.length < 30) newErrors.description = "Description needs 30 or more characters";
        if (!form.spotTitle) newErrors.spotTitle = "Name of your spot is required";
        if (!form.price) newErrors.price = "Price per night is required";
        if (!form.imageUrls[0]) newErrors.previewImage = "Preview Image URL is required";
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        const payload = {
            address: form.streetAddress,
            city: form.city,
            state: form.state,
            country: form.country,
            lat: parseFloat(form.lat),
            lng: parseFloat(form.lng),
            name: form.spotTitle,
            description: form.description,
            price: parseFloat(form.price),
            imageUrls: form.imageUrls,
        };

        try {
            const createdSpot = await dispatch(createSpotThunk(payload));
            if (createdSpot) {
                navigate(`/spots/${createdSpot.id}`); 
            }
        } catch (error) {
            console.error('Error creating spot:', error);
            
        }
    };

    return (
        <div className="create-spot">
            <h1>Create a New Spot</h1>
            <form onSubmit={handleSubmit}>
                <h2>Wheres your place located?</h2>
                <p>Guests will only get your exact address once they book a reservation.</p>
                <input
                    type="text"
                    placeholder="Country"
                    value={form.country}
                    onChange={(e) => handleInputChange(e, 'country')}
                />
                {errors.country && <p className="error">{errors.country}</p>}
                <input
                    type="text"
                    placeholder="Street Address"
                    value={form.streetAddress}
                    onChange={(e) => handleInputChange(e, 'streetAddress')}
                />
                {errors.streetAddress && <p className="error">{errors.streetAddress}</p>}
                <input
                    type="text"
                    placeholder="City"
                    value={form.city}
                    onChange={(e) => handleInputChange(e, 'city')}
                />
                {errors.city && <p className="error">{errors.city}</p>}
                <input
                    type="text"
                    placeholder="State"
                    value={form.state}
                    onChange={(e) => handleInputChange(e, 'state')}
                />
                {errors.state && <p className="error">{errors.state}</p>}
                <input
                    type="number"
                    placeholder="Latitude"
                    value={form.lat}
                    onChange={(e) => handleInputChange(e, 'lat')}
                />
                <input
                    type="number"
                    placeholder="Longitude"
                    value={form.lng}
                    onChange={(e) => handleInputChange(e, 'lng')}
                />

                <h2>Describe your place to guests</h2>
                <p>Mention the best features of your space, any special amenities like fast wifi or parking, and what you love about the neighborhood.</p>
                <textarea
                    placeholder="Please write at least 30 characters"
                    value={form.description}
                    onChange={(e) => handleInputChange(e, 'description')}
                />
                {errors.description && <p className="error">{errors.description}</p>}
                <h2>Create a title for your spot</h2>
                <p>Catch guests attention with a spot title that highlights what makes your place special.</p>
                <input
                    type="text"
                    placeholder="Name of your spot"
                    value={form.spotTitle}
                    onChange={(e) => handleInputChange(e, 'spotTitle')}
                />
                {errors.spotTitle && <p className="error">{errors.spotTitle}</p>}
                <h2>Set a base price for your spot</h2>
                <p>Competitive pricing can help your listing stand out and rank higher in search results.</p>
                <input
                    type="number"
                    placeholder="Price per night (USD)"
                    value={form.price}
                    onChange={(e) => handleInputChange(e, 'price')}
                />
                {errors.price && <p className="error">{errors.price}</p>}
                <h2>Liven up your spot with photos</h2>
                <p>Submit a link to at least one photo to publish your spot.</p>
                <input
                    type="text"
                    placeholder="Preview Image URL"
                    value={form.imageUrls[0]}
                    onChange={(e) => handleImageUrlChange(0, e.target.value)}
                />
                {errors.previewImage && <p className="error">{errors.previewImage}</p>}
                {form.imageUrls.slice(1).map((url, idx) => (
                    <input
                        key={idx + 1}
                        type="text"
                        placeholder="Image URL"
                        value={url}
                        onChange={(e) => handleImageUrlChange(idx + 1, e.target.value)}
                    />
                ))}
                <button type="submit">Create Spot</button>
            </form>
        </div>
    );
};

export default CreateSpot;