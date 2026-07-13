import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
    getSpotdetailsThunk,
    updateSpotThunk,
    addSpotImageThunk,
    deleteSpotImageThunk,
} from '../../store/spots';
import {
    ZAMBIA_PROVINCES,
    ZAMBIA_CITIES,
    CITY_SUBURBS,
    CITY_TO_PROVINCE,
} from '../../constants/zambiaLocations';
import { SPOT_AMENITIES } from '../../constants/amenities';
import './UpdateSpot.css';

const UpdateSpot = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const { id } = useParams();
    const spotId = Number(id);

    const currentSpot = useSelector((state) => state.spots.currentSpot);
    const sessionUser = useSelector((state) => state.session.user);

    const [isLoaded, setIsLoaded] = useState(false);
    const [form, setForm] = useState(null);
    const [errors, setErrors] = useState({});
    const [isSaving, setIsSaving] = useState(false);
    const [newImageUrl, setNewImageUrl] = useState('');
    const [isAddingImage, setIsAddingImage] = useState(false);
    const [locating, setLocating] = useState(false);

    useEffect(() => {
        setIsLoaded(false);
        setForm(null);
        setErrors({});
        const load = async () => {
            await dispatch(getSpotdetailsThunk(id));
            setIsLoaded(true);
        };
        load();
    }, [dispatch, id]);

    const spotReady = isLoaded && currentSpot && currentSpot.id === spotId;

    useEffect(() => {
        if (spotReady && !form) {
            // Older/seed spots may carry non-Zambian data (e.g. state: "CA") left over from
            // before this platform was localized. The province <select> only has Zambia's 10
            // provinces as options, so an unrecognized value would silently render as whichever
            // option happens to be first while the underlying form state stays stale/wrong.
            // Fall back to a real province so what's displayed always matches what's stored.
            const storedState = currentSpot.state;
            const validState = ZAMBIA_PROVINCES.includes(storedState)
                ? storedState
                : (CITY_TO_PROVINCE[currentSpot.city] || 'Lusaka');

            setForm({
                name: currentSpot.name || '',
                streetAddress: currentSpot.address || '',
                city: currentSpot.city || '',
                state: validState,
                country: 'Zambia',
                lat: currentSpot.lat != null ? String(currentSpot.lat) : '',
                lng: currentSpot.lng != null ? String(currentSpot.lng) : '',
                price: currentSpot.price != null ? String(currentSpot.price) : '',
                description: currentSpot.description || '',
                solarPower: !!currentSpot.solarPower,
                boreholeWater: !!currentSpot.boreholeWater,
                backupPower: !!currentSpot.backupPower,
                securityVerified: !!currentSpot.securityVerified,
                weeklyDiscountPercent: currentSpot.weeklyDiscountPercent ? String(currentSpot.weeklyDiscountPercent) : '',
                monthlyDiscountPercent: currentSpot.monthlyDiscountPercent ? String(currentSpot.monthlyDiscountPercent) : '',
            });
        }
    }, [spotReady, currentSpot, form]);

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

    if (!isLoaded) return <div className="update-spot-status">Loading...</div>;
    if (!currentSpot || currentSpot.id !== spotId) {
        return <div className="update-spot-status">No spot found.</div>;
    }

    const owner = currentSpot.Owner;
    const isOwner = sessionUser && owner && owner.id === sessionUser.id;
    if (!isOwner) {
        return (
            <div className="update-spot-status">
                You don&apos;t have permission to edit this spot.
                <Link to={`/spots/${id}`}> Back to listing</Link>
            </div>
        );
    }

    if (!form) return <div className="update-spot-status">Loading...</div>;

    const handleChange = (e, fieldName) => {
        const { value } = e.target;
        setForm((prev) => ({ ...prev, [fieldName]: value }));
    };

    const handleCityChange = (e) => {
        const { value } = e.target;
        setForm((prev) => ({
            ...prev,
            city: value,
            state: CITY_TO_PROVINCE[value] || prev.state,
        }));
    };

    const handleAmenityToggle = (key) => {
        setForm((prev) => ({ ...prev, [key]: !prev[key] }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.name) newErrors.name = 'Name of your spot is required';
        if (!form.streetAddress) newErrors.streetAddress = 'Street Address is required';
        if (!form.city) newErrors.city = 'City is required';
        if (!form.state) newErrors.state = 'Province is required';
        if (form.description.length < 30) newErrors.description = 'Description needs 30 or more characters';
        if (!form.price) newErrors.price = 'Price per night is required';
        return newErrors;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const validationErrors = validateForm();
        if (Object.keys(validationErrors).length > 0) {
            setErrors(validationErrors);
            return;
        }

        setIsSaving(true);
        setErrors({});
        try {
            await dispatch(updateSpotThunk(id, {
                name: form.name,
                address: form.streetAddress,
                city: form.city,
                state: form.state,
                country: form.country,
                lat: parseFloat(form.lat),
                lng: parseFloat(form.lng),
                price: parseFloat(form.price),
                description: form.description,
                solarPower: form.solarPower,
                boreholeWater: form.boreholeWater,
                backupPower: form.backupPower,
                securityVerified: form.securityVerified,
                weeklyDiscountPercent: form.weeklyDiscountPercent ? parseFloat(form.weeklyDiscountPercent) : 0,
                monthlyDiscountPercent: form.monthlyDiscountPercent ? parseFloat(form.monthlyDiscountPercent) : 0,
            }));
            navigate(`/spots/${id}`);
        } catch (err) {
            setErrors({ submit: err.message || 'Something went wrong saving your changes. Please try again.' });
        } finally {
            setIsSaving(false);
        }
    };

    const handleAddImage = async (e) => {
        e.preventDefault();
        const url = newImageUrl.trim();
        if (!url) return;
        setIsAddingImage(true);
        setErrors((prev) => ({ ...prev, image: undefined }));
        try {
            const hasNoImages = !(currentSpot.SpotImages && currentSpot.SpotImages.length > 0);
            await dispatch(addSpotImageThunk(spotId, url, hasNoImages));
            setNewImageUrl('');
        } catch (err) {
            setErrors((prev) => ({ ...prev, image: err.message || 'Could not add that photo.' }));
        } finally {
            setIsAddingImage(false);
        }
    };

    const handleRemoveImage = async (imageId) => {
        try {
            await dispatch(deleteSpotImageThunk(imageId, spotId));
        } catch (err) {
            setErrors((prev) => ({ ...prev, image: err.message || 'Could not remove that photo.' }));
        }
    };

    const images = currentSpot.SpotImages || [];

    return (
        <div className="update-spot">
            <div className="update-spot-topbar">
                <Link to={`/spots/${id}`} className="update-spot-back">&larr; Back to listing</Link>
            </div>
            <h1>Update Your Spot</h1>

            <form onSubmit={handleSubmit}>
                <h2>Create a title for your spot</h2>
                <input
                    type="text"
                    placeholder="Name of your spot"
                    value={form.name}
                    onChange={(e) => handleChange(e, 'name')}
                />
                {errors.name && <p className="error">{errors.name}</p>}

                <h2>Wheres your place located?</h2>
                <p>Guests will only get your exact address once they book a reservation.</p>
                <input type="text" value={form.country} disabled readOnly />
                <p className="field-hint">ZedBnB currently lists properties in Zambia only.</p>

                <input
                    type="text"
                    list="update-suburb-suggestions"
                    placeholder="e.g. Plot 24, Kabulonga Road"
                    value={form.streetAddress}
                    onChange={(e) => handleChange(e, 'streetAddress')}
                />
                <datalist id="update-suburb-suggestions">
                    {(CITY_SUBURBS[form.city] || []).map((suburb) => (
                        <option key={suburb} value={suburb} />
                    ))}
                </datalist>
                {errors.streetAddress && <p className="error">{errors.streetAddress}</p>}

                <div className="field-row">
                    <input
                        type="text"
                        list="update-zambia-cities"
                        placeholder="City or town"
                        value={form.city}
                        onChange={handleCityChange}
                    />
                    <datalist id="update-zambia-cities">
                        {ZAMBIA_CITIES.map((city) => (
                            <option key={city} value={city} />
                        ))}
                    </datalist>

                    <select value={form.state} onChange={(e) => handleChange(e, 'state')}>
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
                        onChange={(e) => handleChange(e, 'lat')}
                    />
                    <input
                        type="number"
                        step="any"
                        placeholder="Longitude"
                        value={form.lng}
                        onChange={(e) => handleChange(e, 'lng')}
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

                <h2>Describe your place to guests</h2>
                <textarea
                    placeholder="Please write at least 30 characters"
                    value={form.description}
                    onChange={(e) => handleChange(e, 'description')}
                />
                {errors.description && <p className="error">{errors.description}</p>}

                <h2>Set a base price for your spot</h2>
                <input
                    type="number"
                    placeholder="Price per night (USD)"
                    value={form.price}
                    onChange={(e) => handleChange(e, 'price')}
                />
                {errors.price && <p className="error">{errors.price}</p>}

                <h2>Long-stay discounts</h2>
                <p>Optional — offer a lower nightly rate for week-plus or month-plus stays.</p>
                <div className="field-row">
                    <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Weekly discount %"
                        value={form.weeklyDiscountPercent}
                        onChange={(e) => handleChange(e, 'weeklyDiscountPercent')}
                    />
                    <input
                        type="number"
                        min="0"
                        max="100"
                        placeholder="Monthly discount %"
                        value={form.monthlyDiscountPercent}
                        onChange={(e) => handleChange(e, 'monthlyDiscountPercent')}
                    />
                </div>
                <p className="field-hint">Weekly applies at 7+ nights, monthly at 28+ nights. Leave at 0 to skip.</p>

                <h2>Amenities &amp; security</h2>
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

                {errors.submit && <p className="error">{errors.submit}</p>}

                <div className="update-spot-actions">
                    <button type="submit" disabled={isSaving}>
                        {isSaving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <Link to={`/spots/${id}`} className="cancel-link">Cancel</Link>
                </div>
            </form>

            <div className="update-spot-photos">
                <h2>Photos</h2>
                {errors.image && <p className="error">{errors.image}</p>}

                {images.length > 0 ? (
                    <div className="photo-grid">
                        {images.map((img) => (
                            <div key={img.id} className="photo-thumb">
                                <img src={img.url} alt="" onError={(e) => { e.target.style.opacity = 0.3; }} />
                                {img.preview && <span className="photo-preview-badge">Preview</span>}
                                <button
                                    type="button"
                                    className="photo-remove-btn"
                                    onClick={() => handleRemoveImage(img.id)}
                                    aria-label="Remove photo"
                                >
                                    &times;
                                </button>
                            </div>
                        ))}
                    </div>
                ) : (
                    <p className="field-hint">No photos yet. Add at least one so guests can see your place.</p>
                )}

                <form className="add-photo-row" onSubmit={handleAddImage}>
                    <input
                        type="text"
                        placeholder="Paste an image URL"
                        value={newImageUrl}
                        onChange={(e) => setNewImageUrl(e.target.value)}
                    />
                    <button type="submit" disabled={isAddingImage || !newImageUrl.trim()}>
                        {isAddingImage ? 'Adding...' : 'Add Photo'}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default UpdateSpot;
