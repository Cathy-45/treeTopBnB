import { useDispatch } from 'react-redux';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { createExperienceThunk } from '../../store/experiences';
import { ZAMBIA_CITIES } from '../../constants/zambiaLocations';
import { EXPERIENCE_CATEGORIES } from '../../constants/experienceCategories';
import './CreateExperience.css';

const CreateExperience = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [form, setForm] = useState({
        title: '',
        description: '',
        category: EXPERIENCE_CATEGORIES[0].key,
        city: 'Lusaka',
        pricePerPerson: '',
        durationHours: '',
        previewImage: '',
    });
    const [errors, setErrors] = useState({});

    const handleInputChange = (e, fieldName) => {
        const { value } = e.target;
        setForm((prevForm) => ({
            ...prevForm,
            [fieldName]: value,
        }));
    };

    const validateForm = () => {
        const newErrors = {};
        if (!form.title) newErrors.title = "Title is required";
        if (form.description.length < 20) newErrors.description = "Description needs 20 or more characters";
        if (!form.city) newErrors.city = "City is required";
        if (!form.pricePerPerson) newErrors.pricePerPerson = "Price per person is required";
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
            title: form.title,
            description: form.description,
            category: form.category,
            city: form.city,
            pricePerPerson: parseFloat(form.pricePerPerson),
            durationHours: form.durationHours ? parseFloat(form.durationHours) : null,
            previewImage: form.previewImage || null,
        };

        try {
            const created = await dispatch(createExperienceThunk(payload));
            if (created) {
                navigate(`/experiences/${created.id}`);
            }
        } catch (error) {
            setErrors({ submit: error.message || 'Something went wrong creating your experience. Please try again.' });
        }
    };

    return (
        <div className="create-experience">
            <h1>List a New Experience</h1>
            <form onSubmit={handleSubmit}>
                <h2>What are you offering?</h2>
                <p>Safaris, river trips, cultural tours, transport, or a private chef — anything guests can book as an add-on.</p>
                <input
                    type="text"
                    placeholder="e.g. South Luangwa Walking Safari"
                    value={form.title}
                    onChange={(e) => handleInputChange(e, 'title')}
                />
                {errors.title && <p className="error">{errors.title}</p>}

                <div className="field-row">
                    <select
                        value={form.category}
                        onChange={(e) => handleInputChange(e, 'category')}
                    >
                        {EXPERIENCE_CATEGORIES.map(({ key, label, icon }) => (
                            <option key={key} value={key}>{icon} {label}</option>
                        ))}
                    </select>
                    <input
                        type="text"
                        list="zambia-cities"
                        placeholder="City or town"
                        value={form.city}
                        onChange={(e) => handleInputChange(e, 'city')}
                    />
                    <datalist id="zambia-cities">
                        {ZAMBIA_CITIES.map((city) => (
                            <option key={city} value={city} />
                        ))}
                    </datalist>
                </div>
                {errors.city && <p className="error">{errors.city}</p>}

                <h2>Describe the experience</h2>
                <p>Tell guests what to expect, what&apos;s included, and anything they should bring.</p>
                <textarea
                    placeholder="Please write at least 20 characters"
                    value={form.description}
                    onChange={(e) => handleInputChange(e, 'description')}
                />
                {errors.description && <p className="error">{errors.description}</p>}

                <h2>Pricing &amp; duration</h2>
                <div className="field-row">
                    <input
                        type="number"
                        placeholder="Price per person (USD)"
                        value={form.pricePerPerson}
                        onChange={(e) => handleInputChange(e, 'pricePerPerson')}
                    />
                    <input
                        type="number"
                        step="any"
                        placeholder="Duration (hours, optional)"
                        value={form.durationHours}
                        onChange={(e) => handleInputChange(e, 'durationHours')}
                    />
                </div>
                {errors.pricePerPerson && <p className="error">{errors.pricePerPerson}</p>}
                <p className="field-hint">ZedBnB takes a provider-side commission on experience bookings — guests pay close to sticker price.</p>

                <h2>Add a photo</h2>
                <input
                    type="text"
                    placeholder="Preview Image URL (optional)"
                    value={form.previewImage}
                    onChange={(e) => handleInputChange(e, 'previewImage')}
                />

                {errors.submit && <p className="error">{errors.submit}</p>}
                <button type="submit">List Experience</button>
            </form>
        </div>
    );
};

export default CreateExperience;
