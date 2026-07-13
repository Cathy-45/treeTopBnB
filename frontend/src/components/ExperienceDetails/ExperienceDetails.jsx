import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getExperienceDetailsThunk } from '../../store/experiences';
import { getCategoryMeta } from '../../constants/experienceCategories';
import BookExperience from '../BookExperience/BookExperience';
import './ExperienceDetails.css';

const ExperienceDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const currentExperience = useSelector((state) => state.experiences.currentExperience);
    const sessionUser = useSelector((state) => state.session.user);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    useEffect(() => {
        setIsLoaded(false);
        const load = async () => {
            await dispatch(getExperienceDetailsThunk(id));
            setIsLoaded(true);
        };
        load();
    }, [dispatch, id]);

    if (!isLoaded) return <div>Loading...</div>;
    if (!currentExperience) return <div>No experience found.</div>;

    const {
        title,
        description,
        city,
        category,
        pricePerPerson,
        durationHours,
        previewImage,
        Provider: provider = { firstName: 'Unknown', lastName: 'Provider' },
    } = currentExperience;

    const meta = getCategoryMeta(category);
    const isLoggedIn = !!sessionUser;
    const isProvider = isLoggedIn && provider.id === sessionUser.id;
    const canBook = isLoggedIn && !isProvider;

    return (
        <div className="experience-details">
            <div className="experience-details-header">
                <h1>{title}</h1>
                <div className="experience-details-subheader">
                    <span className="category-badge-inline">{meta.icon} {meta.label}</span>
                    <span className="dot">·</span>
                    <span>{city}</span>
                    {durationHours ? (
                        <>
                            <span className="dot">·</span>
                            <span>{durationHours}h</span>
                        </>
                    ) : null}
                </div>
            </div>

            <img
                src={previewImage || 'https://picsum.photos/seed/zedbnbexperience/1000/500'}
                alt={title}
                className="experience-details-image"
            />

            <div className="experience-details-body">
                <div className="experience-details-main">
                    <div className="provider-info">
                        <h3>Hosted by {provider.firstName} {provider.lastName}</h3>
                        <p>{description}</p>
                    </div>
                </div>

                <aside className="booking-card">
                    <p className="booking-price">${pricePerPerson} <span>/ person</span></p>
                    {canBook && (
                        <button className="booking-card-btn" onClick={() => setIsBookingOpen(true)}>Book Experience</button>
                    )}
                    {isProvider && (
                        <p className="owner-note">This is your experience listing.</p>
                    )}
                    {!isLoggedIn && (
                        <button className="booking-card-btn" onClick={() => alert('Please log in to book this experience.')}>Book Experience</button>
                    )}
                </aside>
            </div>

            <BookExperience
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                experienceId={id}
                pricePerPerson={pricePerPerson}
            />
        </div>
    );
};

export default ExperienceDetails;
