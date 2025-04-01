import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { loadReviewsThunk, deleteReviewThunk } from '../../store/spots'; 
import './ReviewList.css'; 
import Review from '../Review'; 
import { useParams } from 'react-router-dom';

const ReviewList = () => {
    const { spotId } = useParams();
    const dispatch = useDispatch();
    const reviewsState = useSelector(state => state.spots);
    console.log('Reviews State:', reviewsState);
    
    const reviews = reviewsState.byId?.[spotId]?.reviews || [];
    const [isLoaded, setIsLoaded] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchReviews = async () => {
            try {
                await dispatch(loadReviewsThunk(spotId));
                setIsLoaded(true);
            } catch (err) {
                setError('Failed to load reviews.');
                console.error(err);
            }
        };
        fetchReviews();
    }, [dispatch, spotId]);

    // Function to handle review deletion
    const handleDeleteReview = async (reviewId) => {
        try {
            await dispatch(deleteReviewThunk(reviewId, spotId)); // Call the delete thunk
        } catch (err) {
            console.error('Error deleting review:', err);
            // Optionally handle error state
        }
    };

    if (!isLoaded) return <div>Loading...</div>;
    if (error) return <div>{error}</div>;

    return (
        <div className="review-list">
            <h2>Reviews</h2>
            {reviews.length === 0 ? (
                <p>No reviews yet.</p>
            ) : (
                reviews.map(review => (
                    <Review 
                        key={review.id} 
                        review={review} 
                        onDelete={handleDeleteReview} // Pass delete handler to Review
                    />
                ))
            )}
        </div>
    );
};


export default ReviewList;