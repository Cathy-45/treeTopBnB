import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useSearchParams } from 'react-router-dom';
import { getAllExperiencesThunk } from '../../store/experiences';
import { EXPERIENCE_CATEGORIES, getCategoryMeta } from '../../constants/experienceCategories';
import './Experiences.css';

const Experiences = () => {
    const dispatch = useDispatch();
    const allExperiences = useSelector((state) => state.experiences.allExperiences);
    const [isLoaded, setIsLoaded] = useState(false);
    const [searchParams, setSearchParams] = useSearchParams();
    const query = (searchParams.get('q') || '').trim().toLowerCase();
    const activeCategory = searchParams.get('category') || '';

    useEffect(() => {
        const load = async () => {
            await dispatch(getAllExperiencesThunk());
            setIsLoaded(true);
        };
        load();
    }, [dispatch]);

    const toggleCategory = (key) => {
        const next = new URLSearchParams(searchParams);
        if (activeCategory === key) {
            next.delete('category');
        } else {
            next.set('category', key);
        }
        setSearchParams(next);
    };

    if (!isLoaded) return <div>Loading...</div>;

    let visibleExperiences = query
        ? (allExperiences || []).filter((experience) =>
            experience.city?.toLowerCase().includes(query) ||
            experience.title?.toLowerCase().includes(query)
        )
        : (allExperiences || []);

    if (activeCategory) {
        visibleExperiences = visibleExperiences.filter((experience) => experience.category === activeCategory);
    }

    const filterBar = (
        <div className="category-filter-bar">
            {EXPERIENCE_CATEGORIES.map(({ key, label, icon }) => (
                <button
                    key={key}
                    type="button"
                    className={`category-filter-chip${activeCategory === key ? ' active' : ''}`}
                    onClick={() => toggleCategory(key)}
                >
                    {icon} {label}
                </button>
            ))}
        </div>
    );

    return (
        <div className="experiences-page">
            <div className="experiences-header">
                <h1>Experiences</h1>
                <p>Safaris, river trips, cultural tours, transport and private chefs — booked directly on ZedBnB, hosted by local providers.</p>
            </div>
            {filterBar}
            {(!visibleExperiences || visibleExperiences.length === 0) ? (
                <div className="experiences_empty">
                    {query || activeCategory ? 'No experiences match your search/filters.' : 'No experiences available yet.'}
                </div>
            ) : (
                <div className="experiences_container">
                    {visibleExperiences.map((experience) => {
                        const meta = getCategoryMeta(experience.category);
                        return (
                            <Link key={experience.id} to={`/experiences/${experience.id}`} className="experience_tile">
                                <div className="experience_image_wrap">
                                    <img
                                        src={experience.previewImage || 'https://picsum.photos/seed/zedbnbexperience/800/600'}
                                        alt={experience.title}
                                        className="experience_image"
                                    />
                                    <span className="experience_category_badge">{meta.icon} {meta.label}</span>
                                </div>
                                <div className="experience_details">
                                    <div className="experience_title">{experience.title}</div>
                                    <div className="experience_location">{experience.city}</div>
                                    <div className="experience_price">
                                        ${experience.pricePerPerson} / person
                                        {experience.durationHours ? ` · ${experience.durationHours}h` : ''}
                                    </div>
                                </div>
                            </Link>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default Experiences;
