
import { useModal } from '../../context/Modal';
import { useNavigate } from 'react-router-dom';



function OpenModalMenuItem({ modalComponent, itemText, onItemClick, onModalClose }) {
  console.log('OpenModalMenuItemrendered');
  const { setModalContent, setOnModalClose } = useModal();
  const navigate = useNavigate(); // Initialize navigate

  const onClick = () => {
      if (onModalClose) setOnModalClose(onModalClose);
      setModalContent(modalComponent);
      if (typeof onItemClick === "function") onItemClick();
  };

  return (
      <ul>
          <li onClick={onClick}>{itemText}</li>
          {/* Add Manage Spots option */}
          <li onClick={() => navigate('/managespots')}>Manage Spots</li>
          
      </ul>
  );
}

export default OpenModalMenuItem;