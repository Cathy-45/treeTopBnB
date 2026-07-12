import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchSpotsThunk, deleteSpotThunk } from '../../store/spots';
import ManageSpotTile from '../ManageSpotTile/ManageSpotTile';
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal'; 
import './ManageSpots.css';

const ManageSpots = () => {
    const dispatch = useDispatch();
    const allSpots = useSelector(state => state.spots.allSpots);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [spotToDelete, setSpotToDelete] = useState();

    useEffect(() => {
        const getSpots = async () => {
            await dispatch(fetchSpotsThunk());
            setIsLoaded(true);
        };
        getSpots();
    }, [dispatch]);

    const handleDeleteClick = (spotId) => {
        setSpotToDelete(spotId); 
        setIsModalOpen(true); 
    };

    const handleDeleteConfirm = async () => {
        if (spotToDelete) {
            await dispatch(deleteSpotThunk(spotToDelete)); 
            setSpotToDelete(null); 
            setIsModalOpen(false); 
        
        }
    };

    const handleModalClose = () => {
        setIsModalOpen(false); 
        setSpotToDelete(null); 
    };

    if (!isLoaded) return <div>Loading...</div>;

    return (
        <div className='manage-spots-page'>
            <h1>Manage Spots</h1>
            {allSpots.length === 0 ? (
                <div className="manage-spots-empty">
                    <p>You have not posted any spots yet.</p>
                    <Link to="/createspot" className="button">Create a New Spot</Link>
                </div>
            ) : (
                <div className="manage-spots-grid">
                    {allSpots.map((spot) => (
                        <ManageSpotTile
                            key={spot.id}
                            spot={spot}
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

export default ManageSpots;