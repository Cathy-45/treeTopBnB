

const NavIcon = ({ Icon, onClick, className }) => {
    return (
        <div className={className} onClick={onClick} style={{ cursor: 'pointer' }}>
            <Icon />
        </div>
    );
};
export default NavIcon;

