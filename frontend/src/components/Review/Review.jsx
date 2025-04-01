import { useState } from 'react';
import ReviewConfirmModal from '../ReviewConfirmModal'; 

const Review = ({ review, onDelete }) => {
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const handleDeleteClick = () => {
        setShowConfirmModal(true);
    };

    const handleDeleteConfirm = () => {
        onDelete(review.id); 
        setShowConfirmModal(false);
    };

    const handleDeleteCancel = () => {
        setShowConfirmModal(false);
    };
    const formattedDate = new Date(review.createdAt).toLocaleDateString();
    const userName = review.user && review.user.firstName ? review.user.firstName : 'Confirmed Guest';
    return (
        <div className="review">
            <h3>
                {userName} <span>({formattedDate})</span>
            </h3>
            <p>{review.review}</p> 
            <div className="star-rating">
                {Array.from({ length: review.stars }, (_, index) => (
                    <span key={index} className="star-icon filled">★</span> 
                ))}
                {Array.from({ length: 5 - review.stars }, (_, index) => (
                    <span key={index + review.stars} className="star-icon empty">☆</span> 
                ))}
            <button onClick={handleDeleteClick}>Delete</button>

            {showConfirmModal && (
                <ReviewConfirmModal 
                    title="Confirm Delete" 
                    message="Are you sure you want to delete this review?"
                    onConfirm={handleDeleteConfirm} 
                    onCancel={handleDeleteCancel} 
                />
            )}
        </div>
        </div>
    );
};

export default Review;