
import{ useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteSpotThunk } from '../../store/spots'; 
import ConfirmationModal from '../ConfirmationModal/ConfirmationModal';

const DeleteSpot = ({ spotId, onDeleteSuccess }) => {
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = async () => {
        await dispatch(deleteSpotThunk(spotId));
        onDeleteSuccess(spotId); 
        setIsModalOpen(false); 
    };

    return (
        <div>
            <button onClick={() => setIsModalOpen(true)}>Delete Spot</button>
            <ConfirmationModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
};

export default DeleteSpot;