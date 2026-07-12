import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { createBookingThunk } from '../../store/bookings';
import './BookSpot.css';

const todayISO = () => new Date().toISOString().split('T')[0];

const BookSpot = ({ isOpen, onClose, spotId, pricePerNight }) => {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const nights = startDate && endDate
        ? Math.max(0, Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))
        : 0;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!startDate || !endDate) {
            setError('Please choose both a start and end date.');
            return;
        }
        if (new Date(startDate) < new Date(todayISO())) {
            setError('Start date cannot be in the past.');
            return;
        }
        if (new Date(endDate) <= new Date(startDate)) {
            setError('End date must be after the start date.');
            return;
        }

        setSubmitting(true);
        try {
            await dispatch(createBookingThunk(spotId, { startDate, endDate }));
            setSuccess(true);
        } catch (err) {
            setError(err.message || 'Could not complete the booking.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        setStartDate('');
        setEndDate('');
        setError('');
        setSuccess(false);
        onClose();
    };

    return (
        <div className="modal">
            <div className="modal-content book-spot-modal">
                {success ? (
                    <>
                        <h2>Reservation requested!</h2>
                        <p>Your dates are booked pending host confirmation.</p>
                        <button type="button" onClick={handleClose}>Close</button>
                    </>
                ) : (
                    <>
                        <h2>Reserve your stay</h2>
                        {error && <p className="error">{error}</p>}
                        <form onSubmit={handleSubmit}>
                            <label>
                                Check-in
                                <input
                                    type="date"
                                    min={todayISO()}
                                    value={startDate}
                                    onChange={(e) => setStartDate(e.target.value)}
                                    required
                                />
                            </label>
                            <label>
                                Check-out
                                <input
                                    type="date"
                                    min={startDate || todayISO()}
                                    value={endDate}
                                    onChange={(e) => setEndDate(e.target.value)}
                                    required
                                />
                            </label>
                            {nights > 0 && pricePerNight != null && (
                                <p className="booking-total">
                                    {nights} night{nights > 1 ? 's' : ''} &times; ${pricePerNight} = ${(nights * pricePerNight).toFixed(2)}
                                </p>
                            )}
                            <button type="submit" disabled={submitting}>
                                {submitting ? 'Booking...' : 'Reserve'}
                            </button>
                            <button type="button" onClick={handleClose} disabled={submitting}>Cancel</button>
                        </form>
                    </>
                )}
            </div>
        </div>
    );
};

export default BookSpot;
