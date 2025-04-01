import './ConfirmationModal.css'


const ConfirmationModal = ({ isOpen, onClose, onConfirm }) => {
    if (!isOpen) return null;

    return (
        <div className="modal-overlay">
            <div className="modal-content">
                <h2>Confirm Delete</h2>
                <p>Are you sure you want to remove this spot?</p>
                <div className="modal-buttons">
                    <button className="delete-button" onClick={onConfirm}>Yes (Delete Spot)</button>
                    <button className="cancel-button" onClick={onClose}>No (Keep Spot)</button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmationModal;