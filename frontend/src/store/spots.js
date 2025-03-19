import { csrfFetch } from './csrf';


// ----ACTION TYPES---
const GET_ALL_SPOTS = 'spots/GET_ALL_SPOTS';
const CREATE_SPOT = "create/CREATE_SPOT";
const UPDATE_SPOT = "update/UPDATE_SPOT";
const DELETE_SPOT = "delete/DELETE_SPOT";
const GET_SPOT_DETAILS = "view spot details/GET_SPOT_DETAILS";

//ACTION CREATORS
//----step  6 : package the data into an action object

// Action creator for getting all spots
export const getAllSpots = (spots) => ({
  type: GET_ALL_SPOTS,
  payload: spots,
});

// Action creator for creating a new spot
export const createSpot = (newSpot) => ({
  type: CREATE_SPOT,
  payload: newSpot,
});

// Action creator for updating an existing spot
export const updateSpot = (updatedSpot) => ({
  type: UPDATE_SPOT,
  payload: updatedSpot,
});

// Action creator for deleting a spot
export const deleteSpot = (spotId) => ({
  type: DELETE_SPOT,
  payload: spotId,
});
// Action creator for getting spot details
export const getSpotDetails = (spotDetails) => ({
  type: GET_SPOT_DETAILS,
  payload: spotDetails,
});

///


//----THUNKS----

export const getAllSpotsThunk = () => async (dispatch) => {
  //step 1: fetch the data from the backend server
  try {
    console.log("step 3)");
    const response = await csrfFetch('/api/spots');
    console.log("step 5)");

    if (response.ok) {
      const spots = await response.json();
      console.log("spots");
      dispatch(getAllSpots(spots));
    } else {
      throw new Error('Failed to fetch spots');
    }

  } catch (error) {
    console.log('Error fetching spots:', error);
  }
}


export const createSpotThunk = (newSpot) => async (dispatch) => {
  try {
      const response = await csrfFetch('/api/spots', {
          method: 'POST',
          body: JSON.stringify(newSpot),
          headers: {
              'Content-Type': 'application/json',
          },
      });
      if (response.ok) {
          const createdSpot = await response.json();
          dispatch(createSpot(createdSpot));
      } else {
          throw new Error('Failed to create spot');
      }
  } catch (error) {
      console.log('Error creating spot:', error);
  }
};


export const updateSpotThunk = (newSpot) => async (dispatch) => {
  try {
    const response = await csrfFetch('/api/spots', {
      method: 'POST',
      body: JSON.stringify(newSpot),
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (response.ok) {
      const updateSpot = await response.json();
      dispatch(updateSpot(updateSpot));
    } else {
      throw new Error('Failed to create spot');
    }
  } catch (error) {
    console.log('Error creating spot:', error);
  }
};

export const deleteSpotThunk = (spotId) => async (dispatch) => {
  try {
      const response = await csrfFetch(`/api/spots/${spotId}`, {
          method: 'DELETE',
      });
      if (response.ok) {
          dispatch(deleteSpot(spotId)); // Pass the ID to the action creator
      } else {
          throw new Error('Failed to delete spot');
      }
  } catch (error) {
      console.log('Error deleting spot:', error);
  }
};


export const getSpotDetailsThunk = (id) => async (dispatch) => {
  //step 1: fetch the data from the backend server
  try {
    console.log("step 3)");
    const response = await csrfFetch(`/api/spots/${id}`);
    console.log("step 5)");

    if (response.ok) {
      const spotDetails = await response.json();
      console.log("spotDetails");
      dispatch(getSpotDetails(spotDetails));
    } else {
      throw new Error('Failed to fetch spots');
    }

  } catch (error) {
    console.log('Error fetching spots:', error);
  }
}



//<------>

//export const getSpotDetailsThunk = (id) => async (dispatch) => {
//const spotDetails = await csrfFetch(`api/spots/${id}`); 

// Fetching the spot details from API backend server
//dispatch(getSpotDetails(spotDetails));
//};

//<-------REDUCERS----->

const initialState = {
  allSpots: [],
  byId: {}
};

const spotsReducer = (state = initialState, action) => {
  switch (action.type) {

    case "GET_ALL_SPOTS": {
      const newState = { ...state }; // Clone the current state
      const spots = action.payload; // Get the spots from the action payload

      // REPLACE ALL SPOTS
      newState.allSpots = spots; // Update the allSpots array

      // REPLACE BY ID
      const newById = { ...newState.byId }; // Clone the current byId object

      // Go through all the spots and normalize them
      for (let spot of spots) {
        newById[spot.id] = spot; // Normalize the structure
      }

      newState.byId = newById; // Update the byId object

      // Last line of every case - return the newState
      return newState;
    }

    case "CREATE_SPOT": {
      const newState = { ...state };
      const newSpot = action.payload; // New spot data from the action

      // Add the new spot to the allSpots array
      newState.allSpots.push(newSpot);

      // Add the new spot to the byId object
      newState.byId[newSpot.id] = newSpot;
      return newState;
    }

    case "UPDATE_SPOT": {
      const newState = { ...state };
      const updatedSpot = action.payload; // Updated spot data from the action

      // Update the allSpots array
      newState.allSpots = newState.allSpots.map(spot =>
        spot.id === updatedSpot.id ? updatedSpot : spot
      );

      // Update the byId object
      newState.byId[updatedSpot.id] = updatedSpot;
      return newState;
    }

    case "DELETE_SPOT": {
      const newState = { ...state };
      const spotId = action.payload; // ID of the spot to delete

      // Remove the spot from the allSpots array
      newState.allSpots = newState.allSpots.filter(spot => spot.id !== spotId);

      // Remove the spot from the byId object
      const newById = { ...newState.byId };
      delete newById[spotId];
      newState.byId = newById;
      return newState;
    }


    case "GET_SPOT_DETAILS": {
      const newState = { ...state };
      const spotDetails = action.payload;
      newState.byId[spotDetails.id] = spotDetails;
      return newState;
    }


    default:
      return state;
  }
};


export default spotsReducer;
