// frontend/src/App.jsx

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet } from 'react-router-dom';
import Navigation from './components/Navigation';
import * as sessionActions from './store/session';
import LandingPage from './components/LandingPage';
import './index.css';
import LoginFormModal from './components/LoginFormModal';
import Spots from './components/Spots/Spots';
import CreateSpot from './components/CreateSpot/CreateSpot';
import GetSpotdetails from './components/GetSpotdetails';
import UpdateSpot from './components/UpdateSpot/UpdateSpot';
import ReviewFormModal from './components/ReviewFormModal';
import ManageSpots from './components/ManageSpots';
import ManageSpotTile from './components/ManageSpotTile/ManageSpotTile';
import DeleteSpot from './components/DeleteSpot';
import ConfirmationModal from './components/ConfirmationModal';
import ReviewList from './components/ReviewList';
import Review from './components/Review';
import DeleteReview from './components/DeleteReview';

function Layout() {
  const dispatch = useDispatch();
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    dispatch(sessionActions.restoreUser()).then(() => {
      setIsLoaded(true)
    });
  }, [dispatch]);

  return (
    <>
      <Navigation isLoaded={isLoaded} />
      {isLoaded && <Outlet />}
    </>
  );
}

const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [


      {
        path: '/login',
        element: <LoginFormModal />,
      },

      {
        path: '/',
        element: <LandingPage />,
      },

      {
        path: '/Spots',
        element: < Spots />,

      },

      {
        path: '/Spots/:id',
        element: <GetSpotdetails />,
      },

      {
        path: '/createspot',
        element: <CreateSpot />,

      },

      {
        path: '/updatespot/:id',
        element: < UpdateSpot />,
      },

      {
        path: '/delete/:id',
        element: <DeleteSpot />,
      },

     {
       path: '/confirmationmodal',
       element:<ConfirmationModal/>,
     },
     {
         path: '/spots/:spotId/review',
         element: <Review/>
     },
      
      {
        path: '/delete/:spotId/review',
        element: <DeleteReview/>
      },



     {
      path: '/spots/:spotId/reviews',
      element: <ReviewList/>
     },

      {
        path: '/reviewformModal',
        element: <ReviewFormModal />,
      },
      {
        path: '/managespots',
        element: <ManageSpots />,
      },
      {
        path: '/mangespottile',
        element: <ManageSpotTile />
      }


    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;