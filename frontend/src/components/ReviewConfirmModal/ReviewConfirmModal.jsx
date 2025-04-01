import './ReviewConfirmModal.css'



import './ReviewConfirmModal.css';

const ReviewConfirmModal = ({ title, message, onConfirm, onCancel }) => {
    return (
        <div className="modal">
            <div className="modal__content">
                <div className="modal__header">{title}</div>
                <div className="modal__message">{message}</div>
                <div className="modal__buttons">
                    <button className="modal__button confirm" onClick={onConfirm}>Confirm</button>
                    <button className="modal__button cancel" onClick={onCancel}>Cancel</button>
                </div>
            </div>
        </div>
    );
};


export default ReviewConfirmModal;