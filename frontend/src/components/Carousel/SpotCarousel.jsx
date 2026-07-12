import { useRef, useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import outdoorImage from '../../images/outdoors.jpg';
import './SpotCarousel.css';

// Horizontally-scrolling row of spot cards, used for a "Featured" strip on
// the homepage. Reuses the same card visuals as the main grid (Spots.jsx)
// but in a fixed-width, scroll-snapped row with arrow-button navigation.
const SpotCarousel = ({ spots, title }) => {
    const trackRef = useRef(null);
    const [canScrollLeft, setCanScrollLeft] = useState(false);
    const [canScrollRight, setCanScrollRight] = useState(false);

    const updateScrollState = useCallback(() => {
        const el = trackRef.current;
        if (!el) return;
        setCanScrollLeft(el.scrollLeft > 4);
        setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
    }, []);

    useEffect(() => {
        updateScrollState();
        const el = trackRef.current;
        if (!el) return;
        el.addEventListener('scroll', updateScrollState);
        window.addEventListener('resize', updateScrollState);
        return () => {
            el.removeEventListener('scroll', updateScrollState);
            window.removeEventListener('resize', updateScrollState);
        };
    }, [spots, updateScrollState]);

    if (!spots || spots.length === 0) return null;

    const scrollByAmount = (direction) => {
        if (!trackRef.current) return;
        const amount = trackRef.current.clientWidth * 0.8 * direction;
        trackRef.current.scrollBy({ left: amount, behavior: 'smooth' });
    };

    const showControls = canScrollLeft || canScrollRight;

    return (
        <div className="spot-carousel">
            <div className="spot-carousel-header">
                <h2 className="section-heading">{title}</h2>
                {showControls && (
                    <div className="spot-carousel-controls">
                        <button
                            type="button"
                            className="carousel-arrow-flat"
                            onClick={() => scrollByAmount(-1)}
                            disabled={!canScrollLeft}
                            aria-label="Scroll left"
                        >
                            <FaChevronLeft />
                        </button>
                        <button
                            type="button"
                            className="carousel-arrow-flat"
                            onClick={() => scrollByAmount(1)}
                            disabled={!canScrollRight}
                            aria-label="Scroll right"
                        >
                            <FaChevronRight />
                        </button>
                    </div>
                )}
            </div>

            <div className="spot-carousel-track" ref={trackRef}>
                {spots.map((spot) => (
                    <Link to={`/spots/${spot.id}`} key={spot.id} className="spot-carousel-card">
                        <img
                            src={spot.previewImage || outdoorImage}
                            alt={spot.name}
                            onError={(e) => { e.target.onerror = null; e.target.src = outdoorImage; }}
                        />
                        <div className="spot-carousel-card-info">
                            <div className="spot_location">{spot.city}, {spot.state}</div>
                            <div className="rating">
                                <span className="star-icon">⭐</span>
                                {spot.avgRating ? Number(spot.avgRating).toFixed(1) : 'New'}
                            </div>
                            <div className="spot_price">${spot.price} night</div>
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default SpotCarousel;
