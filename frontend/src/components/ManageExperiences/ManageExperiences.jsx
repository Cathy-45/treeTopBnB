import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { getCurrentUserExperiencesThunk, deleteExperienceThunk } from '../../store/experiences';
import ManageExperienceTile from '../ManageExperienceTile/ManageExperienceTile';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';
import './ManageExperiences.css';

const ManageExperiences = () => {
    const dispatch = useDispatch();
    const myExperiences = useSelector((state) => state.experiences.myExperiences);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [experienceToDelete, setExperienceToDelete] = useState(null);

    useEffect(() => {
        const load = async () => {
            await dispatch(getCurrentUserExperiencesThunk());
            setIsLoaded(true);
        };
        load();
    }, [dispatch]);

    const handleDeleteClick = (experienceId) => {
        setExperienceToDelete(experienceId);
        setIsModalOpen(true);
    };

    const handleDeleteConfirm = async () => {
        if (experienceToDelete) {
            await dispatch(deleteExperienceThunk(experienceToDelete));
            setExperienceToDelete(null);
            setIsModalOpen(false);
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false);
        setExperienceToDelete(null);
    };

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <div className="manage-experiences-page">
            <h1>Manage Experiences</h1>
            {myExperiences.length === 0 ? (
                <div className="manage-experiences-empty">
                    <p>You have not listed any experiences yet.</p>
                    <Link to="/createexperience" className="button">Host a New Experience</Link>
                </div>
            ) : (
                <div className="manage-experiences-grid">
                    {myExperiences.map((experience) => (
                        <ManageExperienceTile
                            key={experience.id}
                            experience={experience}
                            onDeleteClick={handleDeleteClick}
                        />
                    ))}
                </div>
            )}
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={handleModalClose}
                onConfirm={handleDeleteConfirm}
            />
        </div>
    );
};

export default ManageExperiences;
