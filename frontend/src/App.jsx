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
import SpotDetails from './components/SpotDetails/SpotDetails';


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
        path: '/',
        element: <LandingPage />,
      },

      {
        path: '/Spots',
        element: < Spots/>,

      },
      {
         path: '/spots/:id',
          element: <SpotDetails />,
      },


      {
        path: '/login',
        element: <LoginFormModal />
      }



    ]
  }
]);

function App() {
  return <RouterProvider router={router} />;
}

export default App;