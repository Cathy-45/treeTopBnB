

import { useEffect, useState } from 'react'; 
import { useDispatch, useSelector } from 'react-redux'; 
import { Link } from 'react-router-dom'; 
import { getAllSpotsThunk } from '../../store/spots'; 
import outdoorImage from '../../images/outdoors.jpg';
import wisteriaImage from '../../images/wisteria.png';
import grapevineImage from '../../images/grapevine.png';
import './Spots.css';

const Spots = () => {
    const dispatch = useDispatch(); 
    const allSpots = useSelector(state => state.spots.allSpots); 
    const [isLoaded, setIsLoaded] = useState(true); 

    useEffect(() => {
        const getSpots = async () => {
            await dispatch(getAllSpotsThunk()); 
            setIsLoaded(true); // Set loading to true after dispatch 
        }; 
        getSpots(); // Call the function to get spots 
    }, [dispatch]); // Dependency array with dispatch 

    
    if (!isLoaded) return <div>Loading...</div>; 


    if (allSpots.length === 0) return <div>No spots available</div>; 

    const spotsData = [
        {
            id: 1,
            
              ownerId: 1,
              address: "123 Disney Lane",
              imagesUrl: outdoorImage,
              city: "San Francisco",
              state: "California",
              country: "United States of America",
              lat: -90,
              lng: -180,
              name: "App Academy",
              description: "Place where web developers are created",
              price: 123,
              reviews:[]
            },
            {
                id: 2,

              ownerId: 2,
              address: "123 Disney Lane",
              imagesUrl:wisteriaImage,
              city: "San Francisco",
              state: "California",
              country: "United States of America",
              lat: -90,
              lng: -180,
              name: "Hotel California",
              description: "What a lovely place",
              price: 999,
              review:[]
            },
            {
                id: 3,

              ownerId: 3,
              address: "546 Walnut Lane",
              imagesUrl: grapevineImage,
              city: "San Francisco",
              state: "California",
              country: "United States of America",
              lat: -90,
              lng: -180,
              name: "Studio",
              description: "blah blah blah",
              price: 567,
              reviews: []
            }
           
    ];

    return (
        <div className='spots_container'>
            {spotsData.map((spot, idx) => {
                const averageRating = 4.5; 
                return (
                    <div key={`${idx}-${spot.id}`} className='spot_tile'>
                        <Link to={`/spots/${spot.id}`} className='spot_link'>
                            <img src={spot.imagesUrl} alt={spot.name} className='spot_image' />
                            <div className='spot_details'>
                                <div className='spot_location'>{spot.city}, {spot.state}</div>
                                <div className='spot_price'>${spot.price} night</div>
                                <div className='rating'>
                                    <span className='star-icon'>⭐</span>
                                    {averageRating}
                                </div>
                            </div>
                        </Link>
                    </div>
                );
            })}
        </div>
    );
};

export default Spots;