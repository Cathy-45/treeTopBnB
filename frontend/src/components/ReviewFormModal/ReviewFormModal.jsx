import { useState } from 'react';
import './ReviewFormModal.css'; 
const ReviewFormModal = ({ isOpen, onClose, onSubmit }) => {
  const [reviewText, setReviewText] = useState('');
  const [rating, setRating] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
      e.preventDefault();
      if (reviewText.length < 10 || rating === null) {
          setError('Please enter a review with at least 10 characters and select a star rating.');
          return;
      }
      setError('');

      const reviewData = { reviewText, rating };
      try {
          await onSubmit(reviewData); 
          setReviewText('');
          setRating(null);
          onClose();
      } catch (err) {
          setError('An error occurred while submitting your review. Please try again.');
      }
  };

  return (
      isOpen && (
          <div className="modal">
              <div className="modal-content">
                  <h2>How was your stay?</h2>
                  {error && <p className="error">{error}</p>}
                  <form onSubmit={handleSubmit}>
                      <textarea
                          value={reviewText}
                          onChange={(e) => setReviewText(e.target.value)}
                          placeholder="Leave your review here..."
                          required
                      />
                      <div>
                          <label>Stars:</label>
                          <select
                              value={rating || ''}
                              onChange={(e) => setRating(e.target.value)}
                          >
                              <option value="" disabled>Select a rating</option>
                              {[1, 2, 3, 4, 5].map((star) => (
                                  <option key={star} value={star}>{star}</option>
                              ))}
                          </select>
                      </div>
                      <button type="submit" disabled={reviewText.length < 10 || rating === null}>
                          Submit Your Review
                      </button>
                      <button type="button" onClick={onClose}>Close</button>
                  </form>
              </div>
          </div>
      )
  );
};



export default ReviewFormModal;