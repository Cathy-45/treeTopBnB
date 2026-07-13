import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createSpotThunk, addSpotImageThunk } from '../../store/spots';
import { ZAMBIA_PROVINCES, ZAMBIA_CITIES, CITY_SUBURBS, CITY_TO_PROVINCE } from '../../constants/zambiaLocations';
import { SPOT_AMENITIES } from '../../constants/amenities';
import './CreateSpot.css';

const CreateSpot = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        country: 'Zambia',
        streetAddress: '',
        city: 'Lusaka',
        state: 'Lusaka',
        description: '',
        spotTitle: '',
        price: '',
        imageUrls: ['', ''],
        lat: '-15.3875',
        lng: '28.3228',
        solarPower: false,
        boreholeWater: false,
        backupPower: false,
        securityVerified: false,
        weeklyDiscountPercent: '',
        monthlyDiscountPercent: '',
    });
    const [errors, setErrors] = useState({});
    const [locating, setLocating] = useState(false);

    const handleUseLocation = () => {
        if (!navigator.geolocation) {
            setErrors((prev) => ({ ...prev, location: 'Your browser does not support location detection.' }));
            return;
        }
        setLocating(true);
        setErrors((prev) => ({ ...prev, location: undefined }));
        navigator.geolocation.getCurrentPosition(
            (position) => {
                setForm((prev) => ({
                    ...prev,
                    lat: position.coords.latitude.toFixed(6),
                    lng: position.coords.longitude.toFixed(6),
                }));
                setLocating(false);
            },
            (err) => {
                setErrors((prev) => ({
                    ...prev,
                    location: err.code === err.PERMISSION_DENIED
                        ? 'Location access denied. You can still enter latitude/longitude manually.'
                        : 'Could not detect your location. You can still enter it manually.',
                }));
                setLocating(false);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    };

    const handleInputChange = (e, fieldName) => {
        const { value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [fieldName]: value,
        }));
    };

    const handleCityChange = (e) => {
        const { value } = e.target;
        setForm((prevForm) => {
            const matchedProvince = CITY_TO_PROVINCE[value];
            return {
                ...prevForm,
                city: value,
                state: matchedProvince || prevForm.state,
            };
        });
    };

    const handleAmenityToggle = (key) => {
        setForm((prevForm) => ({
            ...prevForm,
            [key]: !prevForm[key],
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
        if (!form.state) newErrors.state = "Province is required";
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
            solarPower: form.solarPower,
            boreholeWater: form.boreholeWater,
            backupPower: form.backupPower,
            securityVerified: form.securityVerified,
            weeklyDiscountPercent: form.weeklyDiscountPercent ? parseFloat(form.weeklyDiscountPercent) : 0,
            monthlyDiscountPercent: form.monthlyDiscountPercent ? parseFloat(form.monthlyDiscountPercent) : 0,
        };

        try {
            const createdSpot = await dispatch(createSpotThunk(payload));
            if (createdSpot) {
                const urls = form.imageUrls.filter((url) => url && url.trim());
                for (let i = 0; i < urls.length; i++) {
                    try {
                        await dispatch(addSpotImageThunk(createdSpot.id, urls[i], i === 0));
                    } catch (imgErr) {
                        console.error('Error attaching image to new spot:', imgErr);
                    }
                }
                navigate(`/spots/${createdSpot.id}`);
            }
        } catch (error) {
            console.error('Error creating spot:', error);
            setErrors({ submit: 'Something went wrong creating your spot. Please try again.' });
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
                    disabled
                    readOnly
                />
                <p className="field-hint">ZedBnB currently lists properties in Zambia only.</p>
                {errors.country && <p className="error">{errors.country}</p>}

                <input
                    type="text"
                    list="suburb-suggestions"
                    placeholder="e.g. Plot 24, Kabulonga Road"
                    value={form.streetAddress}
                    onChange={(e) => handleInputChange(e, 'streetAddress')}
                />
                <datalist id="suburb-suggestions">
                    {(CITY_SUBURBS[form.city] || []).map((suburb) => (
                        <option key={suburb} value={suburb} />
                    ))}
                </datalist>
                {errors.streetAddress && <p className="error">{errors.streetAddress}</p>}

                <div className="field-row">
                    <input
                        type="text"
                        list="zambia-cities"
                        placeholder="City or town"
                        value={form.city}
                        onChange={handleCityChange}
                    />
                    <datalist id="zambia-cities">
                        {ZAMBIA_CITIES.map((city) => (
                            <option key={city} value={city} />
                        ))}
                    </datalist>

                    <select
                        value={form.state}
                        onChange={(e) => handleInputChange(e, 'state')}
                    >
                        {ZAMBIA_PROVINCES.map((province) => (
                            <option key={province} value={province}>{province}</option>
                        ))}
                    </select>
                </div>
                {errors.city && <p className="error">{errors.city}</p>}
                {errors.state && <p className="error">{errors.state}</p>}

                <div className="field-row">
                    <input
                        type="number"
                        step="any"
                        placeholder="Latitude"
                        value={form.lat}
                        onChange={(e) => handleInputChange(e, 'lat')}
                    />
                    <input
                        type="number"
                        step="any"
                        placeholder="Longitude"
                        value={form.lng}
                        onChange={(e) => handleInputChange(e, 'lng')}
                    />
                </div>
                <button
                    type="button"
                    className="use-location-btn"
                    onClick={handleUseLocation}
                    disabled={locating}
                >
                    {locating ? 'Detecting location...' : 'Use my current GPS location'}
                </button>
                {errors.location && <p className="error">{errors.location}</p>}
                <p className="field-hint">Defaults to central Lusaka (-15.3875, 28.3228) — adjust to your property&apos;s real location, or use GPS above.</p>

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

                <h2>Long-stay discounts</h2>
                <p>Optional — offer a lower nightly rate for week-plus or month-plus stays. Popular with business travelers doing project work in Lusaka/Ndola.</p>
                <div className="field-row">
                    <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Weekly discount %"
                        value={form.weeklyDiscountPercent}
                        onChange={(e) => handleInputChange(e, 'weeklyDiscountPercent')}
                    />
                    <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Monthly discount %"
                        value={form.monthlyDiscountPercent}
                        onChange={(e) => handleInputChange(e, 'monthlyDiscountPercent')}
                    />
                </div>
                <p className="field-hint">Weekly applies at 7+ nights, monthly at 28+ nights. Leave at 0 to skip.</p>

                <h2>Amenities &amp; security</h2>
                <p>Zambian guests care about this — let them know what&apos;s on offer.</p>
                <div className="amenities-grid">
                    {SPOT_AMENITIES.map(({ key, label, icon, formHint }) => (
                        <label key={key} className="amenity-checkbox">
                            <input
                                type="checkbox"
                                checked={form[key]}
                                onChange={() => handleAmenityToggle(key)}
                            />
                            <span className="amenity-label">{icon} {label}</span>
                            <span className="amenity-hint">{formHint}</span>
                        </label>
                    ))}
                </div>

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
                {errors.submit && <p className="error">{errors.submit}</p>}
                <button type="submit">Create Spot</button>
            </form>
        </div>
    );
};

export default CreateSpot;