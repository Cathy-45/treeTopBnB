
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getSpotdetailsThunk, loadReviewsThunk, postReviewThunk } from '../../store/spots';
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

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [isBookingOpen, setIsBookingOpen] = useState(false);

    useEffect(() => {
        dispatch(getSpotdetailsThunk(id));
        dispatch(loadReviewsThunk(id));
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
                </div>

                <aside className="booking-card">
                    <p className="booking-price">${price} <span>/ night</span></p>
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
            />
        </div>
    );
}
export default GetSpotDetails;
