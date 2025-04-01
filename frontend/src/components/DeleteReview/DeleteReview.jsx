import{ useState } from 'react';
import { useDispatch } from 'react-redux';
import { deleteReviewThunk } from '../../store/spots'; 
import ReviewConfirmModal from '../ReviewConfirmModal';


const DeleteReview = ({ spotId, onDeleteSuccess }) => {
    const dispatch = useDispatch();
    const [isModalOpen, setIsModalOpen] = useState(false);

    const handleDelete = async () => {
        await dispatch(deleteReviewThunk(spotId));
        onDeleteSuccess(spotId); 
        setIsModalOpen(false); 
    };

    return (
        <div>
            <button onClick={() => setIsModalOpen(true)}>Delete Spot</button>
            <ReviewConfirmModal
                isOpen={isModalOpen}
                onClose={() => setIsModalOpen(false)}
                onConfirm={handleDelete}
            />
        </div>
    );
};

export default DeleteReview;