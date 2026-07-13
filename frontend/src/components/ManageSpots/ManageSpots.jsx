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
    const sessionUser = useSelector(state => state.session.user);
    const [isLoaded, setIsLoaded] = useState(false);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [spotToDelete, setSpotToDelete] = useState();

    // fetchSpotsThunk hits the public, unfiltered /api/spots list — there's
    // no "current user's spots" endpoint wired up on the frontend yet, so
    // this filters client-side to just the spots this host actually owns
    // (otherwise "Manage Spots" was showing every host's listings, with
    // Update/Delete buttons that would 403 on anything you didn't own).
    const mySpots = allSpots.filter((spot) => spot.ownerId === sessionUser?.id);

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
            {mySpots.length === 0 ? (
                <div className="manage-spots-empty">
                    <p>You have not posted any spots yet.</p>
                    <Link to="/createspot" className="button">Create a New Spot</Link>
                </div>
            ) : (
                <div className="manage-spots-grid">
                    {mySpots.map((spot) => (
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