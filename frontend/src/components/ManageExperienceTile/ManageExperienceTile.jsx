import { useNavigate } from 'react-router-dom';
import './ManageExperienceTile.css';

const FALLBACK_IMAGE = 'https://picsum.photos/seed/zedbnbexperience/800/600';

const ManageExperienceTile = ({ experience, onDeleteClick }) => {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/experiences/${experience.id}`);
    };

    const handleDeleteClick = async (e) => {
        e.stopPropagation();
        await onDeleteClick(experience.id);
    };

    return (
        <div className="experience-tile" onClick={handleClick}>
            <div className="experience-tile-image-wrap">
                <img
                    src={experience.previewImage || FALLBACK_IMAGE}
                    alt={experience.title}
                    className="experience_image"
                    onError={(e) => { e.target.onerror = null; e.target.src = FALLBACK_IMAGE; }}
                />
                <span className="experience_category_badge">{experience.category}</span>
            </div>
            <div className="experience_details">
                <div className="experience_location">{experience.city}</div>
                <div className="experience_title">{experience.title}</div>
                <div className="experience_price">${experience.pricePerPerson} per person</div>

                <div className="button-container">
                    <button className="delete-btn" onClick={handleDeleteClick}>Delete</button>
                </div>
            </div>
        </div>
    );
};

export default ManageExperienceTile;
