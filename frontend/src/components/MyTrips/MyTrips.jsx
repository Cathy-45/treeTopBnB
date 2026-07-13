import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchCurrentUserBookingsThunk } from '../../store/bookings';
import { getCurrentUserExperienceBookingsThunk } from '../../store/experiences';
import outdoorImage from '../../images/outdoors.jpg';
import './MyTrips.css';

const EXPERIENCE_FALLBACK_IMAGE = 'https://picsum.photos/seed/zedbnbexperience/800/600';

const STATUS_LABELS = {
    paid: { label: 'Paid', className: 'status-paid' },
    awaiting_payment: { label: 'Payment processing', className: 'status-pending' },
    failed: { label: 'Payment failed', className: 'status-failed' },
    unavailable: { label: 'Pay host directly', className: 'status-muted' },
    pending: { label: 'Pending confirmation', className: 'status-muted' },
};

const formatDate = (value) => new Date(value).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
});

const normalizeStayBooking = (booking) => ({
    id: `stay-${booking.id}`,
    type: 'stay',
    typeLabel: 'Stay',
    title: booking.Spot?.name || 'Spot no longer available',
    subtitle: booking.Spot ? `${booking.Spot.city}, ${booking.Spot.state}` : '',
    image: outdoorImage,
    dateRangeLabel: `${formatDate(booking.startDate)} – ${formatDate(booking.endDate)}`,
    sortDate: new Date(booking.startDate),
    totalGuestCharge: booking.totalGuestCharge,
    paymentStatus: booking.paymentStatus,
    linkTo: booking.Spot ? `/spots/${booking.Spot.id}` : null,
});

const normalizeExperienceBooking = (booking) => ({
    id: `experience-${booking.id}`,
    type: 'experience',
    typeLabel: 'Experience',
    title: booking.Experience?.title || 'Experience no longer available',
    subtitle: booking.Experience ? `${booking.Experience.city} · ${booking.guests} guest${booking.guests > 1 ? 's' : ''}` : '',
    image: booking.Experience?.previewImage || EXPERIENCE_FALLBACK_IMAGE,
    dateRangeLabel: formatDate(booking.date),
    sortDate: new Date(booking.date),
    totalGuestCharge: booking.totalGuestCharge,
    paymentStatus: booking.paymentStatus,
    linkTo: booking.Experience ? `/experiences/${booking.Experience.id}` : null,
});

const TripCard = ({ trip }) => {
    const status = STATUS_LABELS[trip.paymentStatus] || STATUS_LABELS.pending;
    const content = (
        <>
            <div className="trip-card-image-wrap">
                <img src={trip.image} alt={trip.title} className="trip-card-image" />
                <span className="trip-card-type-badge">{trip.typeLabel}</span>
            </div>
            <div className="trip-card-details">
                <div className="trip-card-title">{trip.title}</div>
                {trip.subtitle && <div className="trip-card-subtitle">{trip.subtitle}</div>}
                <div className="trip-card-dates">{trip.dateRangeLabel}</div>
                <div className="trip-card-footer">
                    <span className={`status-pill ${status.className}`}>{status.label}</span>
                    {trip.totalGuestCharge != null && (
                        <span className="trip-card-price">${Number(trip.totalGuestCharge).toFixed(2)}</span>
                    )}
                </div>
            </div>
        </>
    );

    return trip.linkTo ? (
        <Link to={trip.linkTo} className="trip-card">{content}</Link>
    ) : (
        <div className="trip-card trip-card-disabled">{content}</div>
    );
};

const MyTrips = () => {
    const dispatch = useDispatch();
    const stayBookings = useSelector((state) => state.bookings.currentUserBookings);
    const experienceBookings = useSelector((state) => state.experiences.currentUserBookings);
    const [isLoaded, setIsLoaded] = useState(false);

    useEffect(() => {
        const loadTrips = async () => {
            await Promise.all([
                dispatch(fetchCurrentUserBookingsThunk()),
                dispatch(getCurrentUserExperienceBookingsThunk()),
            ]);
            setIsLoaded(true);
        };
        loadTrips();
    }, [dispatch]);

    if (!isLoaded) return <div className="my-trips-page"><p>Loading your trips...</p></div>;

    const allTrips = [
        ...stayBookings.map(normalizeStayBooking),
        ...experienceBookings.map(normalizeExperienceBooking),
    ];

    const today = new Date(new Date().toDateString());
    const upcoming = allTrips
        .filter((trip) => trip.sortDate >= today)
        .sort((a, b) => a.sortDate - b.sortDate);
    const past = allTrips
        .filter((trip) => trip.sortDate < today)
        .sort((a, b) => b.sortDate - a.sortDate);

    return (
        <div className="my-trips-page">
            <h1>My Trips</h1>
            {allTrips.length === 0 ? (
                <div className="my-trips-empty">
                    <p>You haven&apos;t booked anything yet.</p>
                    <div className="my-trips-empty-links">
                        <Link to="/spots" className="button">Browse stays</Link>
                        <Link to="/experiences" className="button">Browse experiences</Link>
                    </div>
                </div>
            ) : (
                <>
                    <section className="my-trips-section">
                        <h2>Upcoming</h2>
                        {upcoming.length === 0 ? (
                            <p className="my-trips-section-empty">No upcoming trips.</p>
                        ) : (
                            <div className="my-trips-grid">
                                {upcoming.map((trip) => <TripCard key={trip.id} trip={trip} />)}
                            </div>
                        )}
                    </section>
                    {past.length > 0 && (
                        <section className="my-trips-section">
                            <h2>Past</h2>
                            <div className="my-trips-grid">
                                {past.map((trip) => <TripCard key={trip.id} trip={trip} />)}
                            </div>
                        </section>
                    )}
                </>
            )}
        </div>
    );
};

export default MyTrips;
