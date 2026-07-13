import { useEffect, useRef, useState } from 'react';
import { useDispatch } from 'react-redux';
import { createBookingThunk, checkBookingPaymentStatusThunk } from '../../store/bookings';
import { calculateBookingPrice } from '../../utils/pricing';
import './BookSpot.css';

const todayISO = () => new Date().toISOString().split('T')[0];

const PROVIDERS = [
    { value: 'MTN_MOMO_ZMB', label: 'MTN Mobile Money' },
    { value: 'AIRTEL_OAPI_ZMB', label: 'Airtel Money' },
    { value: 'ZAMTEL_ZMB', label: 'Zamtel Kwacha' },
];

const POLL_INTERVAL_MS = 4000;
const MAX_POLL_ATTEMPTS = 20; // ~80s of polling before giving up

const BookSpot = ({ isOpen, onClose, spotId, pricePerNight, weeklyDiscountPercent = 0, monthlyDiscountPercent = 0 }) => {
    const dispatch = useDispatch();
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    const [phoneNumber, setPhoneNumber] = useState('');
    const [provider, setProvider] = useState('MTN_MOMO_ZMB');
    const paymentMethod = 'mobile_money';
    const [error, setError] = useState('');
    const [submitting, setSubmitting] = useState(false);
    const [success, setSuccess] = useState(false);
    const [bookingResult, setBookingResult] = useState(null);
    // 'idle' | 'processing' | 'paid' | 'failed' | 'unavailable' | 'timeout'
    const [paymentPhase, setPaymentPhase] = useState('idle');
    const pollTimeoutRef = useRef(null);
    const pollAttemptsRef = useRef(0);

    useEffect(() => {
        return () => {
            if (pollTimeoutRef.current) clearTimeout(pollTimeoutRef.current);
        };
    }, []);

    const stopPolling = () => {
        if (pollTimeoutRef.current) {
            clearTimeout(pollTimeoutRef.current);
            pollTimeoutRef.current = null;
        }
    };

    const pollPaymentStatus = (bookingId) => {
        pollAttemptsRef.current += 1;
        pollTimeoutRef.current = setTimeout(async () => {
            try {
                const data = await dispatch(checkBookingPaymentStatusThunk(bookingId, 'spot'));
                if (data.paymentStatus === 'paid') {
                    setPaymentPhase('paid');
                    return;
                }
                if (data.paymentStatus === 'failed') {
                    setPaymentPhase('failed');
                    setBookingResult((prev) => ({ ...prev, paymentFailureReason: data.failureReason || prev?.paymentFailureReason }));
                    return;
                }
            } catch (_) {
                // transient network error — just retry on the next tick
            }
            if (pollAttemptsRef.current >= MAX_POLL_ATTEMPTS) {
                setPaymentPhase('timeout');
                return;
            }
            pollPaymentStatus(bookingId);
        }, POLL_INTERVAL_MS);
    };

    if (!isOpen) return null;

    const nights = startDate && endDate
        ? Math.max(0, Math.round((new Date(endDate) - new Date(startDate)) / (1000 * 60 * 60 * 24)))
        : 0;

    const pricing = nights > 0 && pricePerNight != null
        ? calculateBookingPrice(Number(pricePerNight), nights, paymentMethod, {
            weeklyDiscountPercent,
            monthlyDiscountPercent,
        })
        : null;

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
        if (!phoneNumber.trim()) {
            setError('Please enter your mobile money phone number.');
            return;
        }

        setSubmitting(true);
        try {
            const booking = await dispatch(createBookingThunk(spotId, { startDate, endDate, paymentMethod, phoneNumber, provider }));
            setBookingResult(booking);
            setSuccess(true);

            if (booking?.paymentStatus === 'awaiting_payment') {
                setPaymentPhase('processing');
                pollAttemptsRef.current = 0;
                pollPaymentStatus(booking.id);
            } else if (booking?.paymentStatus === 'paid') {
                setPaymentPhase('paid');
            } else if (booking?.paymentStatus === 'failed') {
                setPaymentPhase('failed');
            } else {
                setPaymentPhase('unavailable');
            }
        } catch (err) {
            setError(err.message || 'Could not complete the booking.');
        } finally {
            setSubmitting(false);
        }
    };

    const handleClose = () => {
        stopPolling();
        setStartDate('');
        setEndDate('');
        setPhoneNumber('');
        setError('');
        setSuccess(false);
        setBookingResult(null);
        setPaymentPhase('idle');
        onClose();
    };

    return (
        <div className="modal">
            <div className="modal-content book-spot-modal">
                {success ? (
                    <>
                        <h2>Reservation requested!</h2>
                        <p>Your dates are booked pending host confirmation.</p>
                        {paymentPhase === 'processing' && (
                            <p className="payment-processing">
                                <span className="spinner" aria-hidden="true" />
                                Check your phone — enter your Mobile Money PIN to confirm payment.
                            </p>
                        )}
                        {paymentPhase === 'paid' && (
                            <p className="payment-success-banner">Payment confirmed — you&apos;re all set.</p>
                        )}
                        {paymentPhase === 'failed' && (
                            <p className="discount-banner">
                                Payment wasn&apos;t completed{bookingResult?.paymentFailureReason?.failureMessage ? `: ${bookingResult.paymentFailureReason.failureMessage}` : '.'} Your reservation request was still recorded — the host can arrange payment with you directly.
                            </p>
                        )}
                        {paymentPhase === 'timeout' && (
                            <p className="discount-banner">Still waiting on confirmation from your mobile money provider. Check My Trips in a few minutes for the latest status.</p>
                        )}
                        {paymentPhase === 'unavailable' && (
                            <p className="discount-banner">Online payment isn&apos;t set up yet — the host will arrange payment with you directly.</p>
                        )}
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
                            <label>
                                Mobile Money provider
                                <select value={provider} onChange={(e) => setProvider(e.target.value)}>
                                    {PROVIDERS.map((p) => (
                                        <option key={p.value} value={p.value}>{p.label}</option>
                                    ))}
                                </select>
                            </label>
                            <label>
                                Phone number
                                <input
                                    type="tel"
                                    placeholder="e.g. 0977123456"
                                    value={phoneNumber}
                                    onChange={(e) => setPhoneNumber(e.target.value)}
                                    required
                                />
                            </label>
                            <p className="payment-method-note">You&apos;ll get a PIN prompt on this phone to confirm payment — card payments aren&apos;t available yet.</p>
                            {pricing && pricing.discountLabel && (
                                <p className="discount-banner">
                                    {pricing.discountLabel === 'monthly' ? 'Monthly' : 'Weekly'} rate applied — you save ${pricing.discountAmount.toFixed(2)}
                                </p>
                            )}
                            {pricing && (
                                <div className="price-breakdown">
                                    <div className="price-row">
                                        <span>{nights} night{nights > 1 ? 's' : ''} &times; ${pricePerNight}</span>
                                        <span>${pricing.stickerSubtotal.toFixed(2)}</span>
                                    </div>
                                    {pricing.discountLabel && (
                                        <div className="price-row">
                                            <span>{pricing.discountLabel === 'monthly' ? 'Monthly' : 'Weekly'} discount ({pricing.appliedDiscountPercent}%)</span>
                                            <span>-${pricing.discountAmount.toFixed(2)}</span>
                                        </div>
                                    )}
                                    <div className="price-row">
                                        <span>Service fee</span>
                                        <span>${pricing.guestServiceFee.toFixed(2)}</span>
                                    </div>
                                    <div className="price-row">
                                        <span>Local processing fee</span>
                                        <span>${pricing.processingFee.toFixed(2)}</span>
                                    </div>
                                    <div className="price-row price-total">
                                        <span>Total</span>
                                        <span>${pricing.totalGuestCharge.toFixed(2)}</span>
                                    </div>
                                </div>
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
