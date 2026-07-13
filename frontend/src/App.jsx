// frontend/src/App.jsx

import { useState, useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { createBrowserRouter, RouterProvider, Outlet, Navigate } from 'react-router-dom';
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
import Experiences from './components/Experiences/Experiences';
import ExperienceDetails from './components/ExperienceDetails/ExperienceDetails';
import CreateExperience from './components/CreateExperience/CreateExperience';
import PaymentCallback from './components/PaymentCallback/PaymentCallback';
import MyTrips from './components/MyTrips/MyTrips';
import ManageExperiences from './components/ManageExperiences/ManageExperiences';

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
        // ZedBnB's landing page is '/', not '/home' — but FarmLink (the
        // sister project, same dev habits) uses '/home' for its landing
        // route, so this redirect exists purely to save a 404 whenever
        // that muscle memory carries over here.
        path: '/home',
        element: <Navigate to="/" replace />,
      },

      {
        path: '/spots',
        element: < Spots />,

      },

      {
        path: '/search',
        element: <Spots />,
      },

      {
        path: '/spots/:id',
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
      },

      {
        path: '/experiences',
        element: <Experiences />,
      },

      {
        path: '/experiences/:id',
        element: <ExperienceDetails />,
      },

      {
        path: '/createexperience',
        element: <CreateExperience />,
      },

      {
        path: '/payment/callback',
        element: <PaymentCallback />,
      },

      {
        path: '/trips',
        element: <MyTrips />,
      },

      {
        path: '/manageexperiences',
        element: <ManageExperiences />,
      },


    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;