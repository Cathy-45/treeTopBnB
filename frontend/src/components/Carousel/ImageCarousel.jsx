import { useState } from 'react';
import { FaChevronLeft, FaChevronRight } from 'react-icons/fa';
import './ImageCarousel.css';

// Generic image carousel. `images` is an array of URLs; `fallback` is used
// per-slide if a given URL 404s, so one dead seed-data link doesn't break
// the whole gallery. Renders every image in a flex track and slides via
// CSS transform, so switching slides is an actual animated slide rather
// than a hard src swap (which flashed the frame's background while the
// next image loaded).
const ImageCarousel = ({ images, alt, fallback }) => {
    const [index, setIndex] = useState(0);

    if (!images || images.length === 0) return null;

    const goPrev = () => setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
    const goNext = () => setIndex((i) => (i === images.length - 1 ? 0 : i + 1));

    return (
        <div className="image-carousel">
            <div className="image-carousel-frame">
                <div
                    className="image-carousel-track"
                    style={{ transform: `translateX(-${index * 100}%)` }}
                >
                    {images.map((src, i) => (
                        <div className="image-carousel-slide" key={i}>
                            <img
                                src={src}
                                alt={`${alt} ${i + 1} of ${images.length}`}
                                onError={(e) => { if (fallback) { e.target.onerror = null; e.target.src = fallback; } }}
                            />
                        </div>
                    ))}
                </div>

                {images.length > 1 && (
                    <>
                        <button
                            type="button"
                            className="carousel-arrow carousel-arrow-left"
                            onClick={goPrev}
                            aria-label="Previous photo"
                        >
                            <FaChevronLeft />
                        </button>
                        <button
                            type="button"
                            className="carousel-arrow carousel-arrow-right"
                            onClick={goNext}
                            aria-label="Next photo"
                        >
                            <FaChevronRight />
                        </button>

                        <span className="carousel-counter">{index + 1} / {images.length}</span>
                    </>
                )}
            </div>

            {images.length > 1 && (
                <div className="carousel-dots">
                    {images.map((_, i) => (
                        <button
                            key={i}
                            type="button"
                            className={`carousel-dot ${i === index ? 'active' : ''}`}
                            onClick={() => setIndex(i)}
                            aria-label={`Go to photo ${i + 1}`}
                        />
                    ))}
                </div>
            )}
        </div>
    );
};

export default ImageCarousel;
