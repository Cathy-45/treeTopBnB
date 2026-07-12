
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getSpotdetailsThunk, loadReviewsThunk, postReviewThunk } from '../../store/spots';
import './GetSpotDetails.css';
import ReviewFormModal from '../ReviewFormModal';
import BookSpot from '../BookSpot';
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
        ? [spotImages[0]?.url, ...spotImages.slice(1, 5).map((img) => img.url)]
        : [largeImage, smallImage1, smallImage2, smallImage3, smallImage4];

    return (
        <div className="spot-details">
            <h2>{name}</h2>
            <p>Location: {city}, {state}, {country}</p>

            <div className="container">
                <h2 className="title"></h2>
                <div className="photo-gallery">
                    <div className="column">
                        <div className="photo">
                            <img src={gallery[0]} alt={name} className="large-image" />
                        </div>
                    </div>
                    <div className="column">
                        {gallery.slice(1).map((src, i) => (
                            <div className="photo" key={i}>
                                <img src={src} alt={`${name} view ${i + 2}`} />
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="callout-info">
                <div className="host-info">
                    <p>Hosted by: {host.firstName} {host.lastName}</p>
                    <p>Description: {description}</p>
                </div>
                <div className="reserve-info">
                    <p>Price: ${price} per night</p>
                    {canBook && (
                        <button onClick={() => setIsBookingOpen(true)}>Reserve</button>
                    )}
                    {isOwner && (
                        <p className="owner-note">This is your listing.</p>
                    )}
                    {!isLoggedIn && (
                        <button onClick={() => alert('Please log in to reserve this spot.')}>Reserve</button>
                    )}
                </div>
            </div>

            <div className="review-summary">
                <h3>Reviews</h3>

                <div className="star-rating">
                    {averageRating ? (
                        <>
                            {Array.from({ length: Math.floor(averageRating) }, (_, index) => (
                                <span key={index} className="star-icon filled">★</span>
                            ))}
                            {averageRating % 1 !== 0 && <span className="star-icon">☆</span>}
                            <span> {averageRating}</span>
                        </>
                    ) : (
                        <span>New listing</span>
                    )}
                    <span> ({reviewCount})</span>
                </div>
            </div>

            {reviews.length === 0 ? (
                <p>Be the first to post a review!</p>
            ) : (
                <div className="reviews-list">
                    {[...reviews].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((review) => (
                        <div key={review.id} className="review">
                            <p>
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
     {!isLoggedIn &&(
                <button onClick={() => alert("Please log in to leave a review.")}>Post A Review</button>
            )}

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
