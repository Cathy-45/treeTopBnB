
import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useParams } from 'react-router-dom';
import { getSpotdetailsThunk } from '../../store/spots';
import './GetSpotDetails.css';
import ReviewFormModal from '../ReviewFormModal';
import largeImage from '../../images/outdoorsImage.png';
import smallImage1 from '../../images/cliffhouse.png';
import smallImage2 from '../../images/treetop.png';
import smallImage3 from '../../images/grapevine.png';
import smallImage4 from '../../images/wisteria.png';

const GetSpotDetails = () => {
    const { id } = useParams();
    const dispatch = useDispatch();
    
    const currentSpot = useSelector((state) => state.spots.currentSpot);
    const loading = useSelector((state) => state.spots.loading);
    const error = useSelector((state) => state.spots.error);
    const isLoggedIn = useSelector((state) => state.user?.isLoggedIn);
    const currentUserId = useSelector((state) => state.user?.id);
    
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [reviews, setReviews] = useState(currentSpot?.reviews || []);

    useEffect(() => {
        dispatch(getSpotdetailsThunk(id));
    }, [dispatch, id]);

    if (loading) return <div>Loading...</div>;
    if (error) return <div>Error fetching spot: {error}</div>;
    if (!currentSpot) return <div>No spot found.</div>;

    const { 
        name, 
        city, 
        state, 
        country, 
        host = { firstName: 'Unknown', lastName: 'Host' }, 
        description, 
        price 
    } = currentSpot;

    const averageRating = 4.5;
    const reviewCount = reviews.length;

    const isOwner = host.id === currentUserId;
    const canPostReview = isLoggedIn && !isOwner;

    const handleReviewSubmit = async (reviewData) => {
        setReviews([...reviews, { ...reviewData, 
            userId: 
            currentUserId, firstName: "Your Name", createdAt: new Date() }]);
    };

    return (
        <div className="spot-details">
            <h2>{name}</h2>
            <p>Location: {city}, {state}, {country}</p>
            
            <div className="container">
                <h2 className="title"></h2>
                <div className="photo-gallery">
                    <div className="column">
                        <div className="photo">
                            <img src={largeImage} alt="Blissful outdoors" className="large-image" />
                        </div>
                    </div>
                    <div className="column">
                        <div className="photo">
                            <img src={smallImage1} alt="Cliff house" />
                        </div>
                        <div className="photo">
                            <img src={smallImage2} alt="Tree top" />
                        </div>
                        <div className="photo">
                            <img src={smallImage3} alt="Grapevine" />
                        </div>
                        <div className="photo">
                            <img src={smallImage4} alt="Wisteria" />
                        </div>
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
                    <button onClick={() => alert("Feature coming soon")}>Reserve</button>
                </div>
            </div>
    
            <div className="review-summary">
                <h3>Reviews</h3>
                
                <div className="star-rating">
                    {Array.from({ length: Math.floor(averageRating) }, (_, index) => (
                        <span key={index} className="star-icon filled">★</span>
                    ))}
                    {averageRating % 1 !== 0 && <span className="star-icon">☆</span>} 
                    <span>({reviews.length})</span>
                </div>
            </div>
    
            {reviewCount === 0 ? (
                <p>Be the first to post a review!</p>
            ) : (
                <div className="reviews-list">
                    
                    {reviews.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).map((review, index) => (
                        <div key={index} className="review">
                            <p>{review.firstName} - {new Date(review.createdAt).toLocaleString("default", { month: "long", year: "numeric" })}</p>
                            <p>{review.comment}</p>
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
        </div>
    );
}
export default GetSpotDetails;
