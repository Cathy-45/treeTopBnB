
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams, Link } from 'react-router-dom';
import { getSpotdetailsThunk, loadReviewsThunk, postReviewThunk } from '../../store/spots';
import { getAllExperiencesThunk } from '../../store/experiences';
import { SPOT_AMENITIES } from '../../constants/amenities';
import { getCategoryMeta } from '../../constants/experienceCategories';
import './GetSpotDetails.css';
import ReviewFormModal from '../ReviewFormModal';
import BookSpot from '../BookSpot';
import ImageCarousel from '../Carousel/ImageCarousel';
import largeImage from '../../images/outdoorsImage.png';
import smallImage1 from '../../images/cliffhouse.png';
import smallImage2 from '../../images/treetop.png';
import smallImage3 from '../../images/grapevine.png';
import smallImage4 from '../../images/wisteria.png';

const GetSpotDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();

    const currentSpot = useSelector((state) => state.spots.currentSpot);
    const reviews = useSelector((state) => state.spots.byId?.[id]?.reviews || []);
    const loading = useSelector((state) => state.spots.loading);
    const error = useSelector((state) => state.spots.error);
    const sessionUser = useSelector((state) => state.session.user);
    const allExperiences = useSelector((state) => state.experiences.allExperiences);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    useEffect(() => {
        dispatch(getSpotdetailsThunk(id));
        dispatch(loadReviewsThunk(id));
        dispatch(getAllExperiencesThunk());
    }, [dispatch, id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error fetching spot: {error}</div>;
    if (!currentSpot) return <div>No spot found.</div>;

    const {
        name,
        city,
        state,
        country,
        Owner: host = { firstName: 'Unknown', lastName: 'Host' },
        description,
        price,
        avgStarRating,
        numReviews,
        weeklyDiscountPercent,
        monthlyDiscountPercent,
    } = currentSpot;

    const averageRating = avgStarRating && !Number.isNaN(avgStarRating) ? Number(avgStarRating).toFixed(1) : null;
    const reviewCount = numReviews ?? reviews.length;

    const isLoggedIn = !!sessionUser;
    const isOwner = isLoggedIn && host.id === sessionUser.id;
    const canPostReview = isLoggedIn && !isOwner;
    const canBook = isLoggedIn && !isOwner;

    const handleReviewSubmit = async ({ reviewText, rating }) => {
        await dispatch(postReviewThunk(id, { review: reviewText, stars: Number(rating) }));
        dispatch(loadReviewsThunk(id));
    };

    const activeAmenities = SPOT_AMENITIES.filter(({ key }) => !!currentSpot[key]);

    const nearbyExperiences = (allExperiences || [])
        .filter((experience) => experience.city === city)
        .slice(0, 4);

    const spotImages = currentSpot.SpotImages && currentSpot.SpotImages.length > 0
        ? currentSpot.SpotImages
        : null;
    const gallery = spotImages
        ? spotImages.map((img) => img.url)
        : [largeImage, smallImage1, smallImage2, smallImage3, smallImage4];

    return (
        <div className="spot-details">
            <div className="spot-details-header">
                <h1>{name}</h1>
                <div className="spot-details-subheader">
                    <span className="star-rating-inline">
                        ⭐ {averageRating || 'New'} {reviewCount > 0 && `(${reviewCount})`}
                    </span>
                    <span className="dot">·</span>
                    <span>{city}, {state}, {country}</span>
                </div>
            </div>

            <ImageCarousel images={gallery} alt={name} fallback={largeImage} />

            <div className="spot-details-body">
                <div className="spot-details-main">
                    <div className="host-info">
                        <h3>Hosted by {host.firstName} {host.lastName}</h3>
                        <p>{description}</p>
                    </div>

                    {activeAmenities.length > 0 && (
                        <div className="amenities-summary">
                            <h3>What this place offers</h3>
                            <div className="amenities-summary-list">
                                {activeAmenities.map(({ key, icon, label }) => (
                                    <div key={key} className="amenity-summary-item">
                                        <span className="amenity-summary-icon">{icon}</span>
                                        {label}
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    <div className="review-summary">
                        <h3>
                            ⭐ {averageRating || 'New'} {reviewCount > 0 && `· ${reviewCount} review${reviewCount === 1 ? '' : 's'}`}
                        </h3>

                        {reviews.length === 0 ? (
                            <p>Be the first to post a review!</p>
                        ) : (
                            <div className="reviews-list">
                                {[...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((review) => (
                                    <div key={review.id} className="review">
                                        <p className="review-meta">
                                            {review.User?.firstName || 'Guest'}
                                            {' — '}
                                            {new Date(review.createdAt).toLocaleString('default', { month: 'long', year: 'numeric' })}
                                        </p>
                                        <p>{'★'.repeat(review.stars)} {review.review}</p>
                                    </div>
                                ))}
                            </div>
                        )}

                        {canPostReview && (
                            <button onClick={() => setIsModalOpen(true)}>Post Your Review</button>
                        )}
                        {!isLoggedIn && (
                            <button onClick={() => alert("Please log in to leave a review.")}>Post A Review</button>
                        )}
                    </div>

                    {nearbyExperiences.length > 0 && (
                        <div className="nearby-experiences">
                            <h3>Popular experiences near {city}</h3>
                            <div className="nearby-experiences-list">
                                {nearbyExperiences.map((experience) => {
                                    const meta = getCategoryMeta(experience.category);
                                    return (
                                        <Link key={experience.id} to={`/experiences/${experience.id}`} className="nearby-experience-card">
                                            <img
                                                src={experience.previewImage || 'https://picsum.photos/seed/zedbnbexperience/400/300'}
                                                alt={experience.title}
                                                className="nearby-experience-image"
                                            />
                                            <div className="nearby-experience-info">
                                                <span className="nearby-experience-category">{meta.icon} {meta.label}</span>
                                                <span className="nearby-experience-title">{experience.title}</span>
                                                <span className="nearby-experience-price">${experience.pricePerPerson} / person</span>
                                            </div>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>

                <aside className="booking-card">
                    <p className="booking-price">${price} <span>/ night</span></p>
                    {(Number(weeklyDiscountPercent) > 0 || Number(monthlyDiscountPercent) > 0) && (
                        <div className="longstay-hint">
                            {Number(weeklyDiscountPercent) > 0 && (
                                <span>{weeklyDiscountPercent}% off weekly</span>
                            )}
                            {Number(monthlyDiscountPercent) > 0 && (
                                <span>{monthlyDiscountPercent}% off monthly</span>
                            )}
                        </div>
                    )}
                    {canBook && (
                        <button className="booking-card-btn" onClick={() => setIsBookingOpen(true)}>Reserve</button>
                    )}
                    {isOwner && (
                        <p className="owner-note">This is your listing.</p>
                    )}
                    {!isLoggedIn && (
                        <button className="booking-card-btn" onClick={() => alert('Please log in to reserve this spot.')}>Reserve</button>
                    )}
                </aside>
            </div>

            {isModalOpen && (
                <ReviewFormModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSubmit={handleReviewSubmit}
                />
            )}

            <BookSpot
                isOpen={isBookingOpen}
                onClose={() => setIsBookingOpen(false)}
                spotId={id}
                pricePerNight={price}
                weeklyDiscountPercent={weeklyDiscountPercent}
                monthlyDiscountPercent={monthlyDiscountPercent}
            />
        </div>
    );
}
export default GetSpotDetails;
