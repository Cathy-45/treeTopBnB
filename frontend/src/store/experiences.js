import { csrfFetch } from './csrf';

// ---- Action Types ----
const GET_ALL_EXPERIENCES = 'experiences/GET_ALL_EXPERIENCES';
const GET_EXPERIENCE_DETAILS = 'experiences/GET_EXPERIENCE_DETAILS';
const CREATE_EXPERIENCE = 'experiences/CREATE_EXPERIENCE';
const UPDATE_EXPERIENCE = 'experiences/UPDATE_EXPERIENCE';
const DELETE_EXPERIENCE = 'experiences/DELETE_EXPERIENCE';
const ADD_EXPERIENCE_BOOKING = 'experiences/ADD_EXPERIENCE_BOOKING';
const SET_MY_EXPERIENCES = 'experiences/SET_MY_EXPERIENCES';
const SET_CURRENT_USER_EXPERIENCE_BOOKINGS = 'experiences/SET_CURRENT_USER_EXPERIENCE_BOOKINGS';

// ---- Action Creators ----
export const getAllExperiences = (experiences) => ({
    type: GET_ALL_EXPERIENCES,
    payload: experiences,
});

export const getExperienceDetails = (experience) => ({
    type: GET_EXPERIENCE_DETAILS,
    payload: experience,
});

export const createExperience = (experience) => ({
    type: CREATE_EXPERIENCE,
    payload: experience,
});

export const updateExperience = (experience) => ({
    type: UPDATE_EXPERIENCE,
    payload: experience,
});

export const deleteExperience = (experienceId) => ({
    type: DELETE_EXPERIENCE,
    payload: experienceId,
});

export const setMyExperiences = (experiences) => ({
    type: SET_MY_EXPERIENCES,
    payload: experiences,
});

export const setCurrentUserExperienceBookings = (bookings) => ({
    type: SET_CURRENT_USER_EXPERIENCE_BOOKINGS,
    payload: bookings,
});

// ---- Thunks ----

// csrfFetch throws the raw Response object for any 4xx/5xx status, so every
// thunk here unwraps it into a real Error the calling component can display.
const unwrapError = async (err, fallback) => {
    if (err && typeof err.json === 'function') {
        try {
            const data = await err.json();
            if (data?.errors) return Object.values(data.errors).join(' ');
            if (data?.message) return data.message;
        } catch (_) { /* fall back to generic message */ }
    }
    return fallback;
};

export const getAllExperiencesThunk = ({ city, category } = {}) => async (dispatch) => {
    try {
        const params = new URLSearchParams();
        if (city) params.set('city', city);
        if (category) params.set('category', category);
        const qs = params.toString();
        const response = await csrfFetch(`/api/experiences${qs ? `?${qs}` : ''}`);
        const data = await response.json();
        dispatch(getAllExperiences(data));
        return data;
    } catch (err) {
        console.error('Error fetching experiences:', err);
    }
};

export const getExperienceDetailsThunk = (experienceId) => async (dispatch) => {
    try {
        const response = await csrfFetch(`/api/experiences/${experienceId}`);
        const experience = await response.json();
        dispatch(getExperienceDetails(experience));
        return experience;
    } catch (err) {
        console.error('Error fetching experience:', err);
    }
};

export const createExperienceThunk = (newExperience) => async (dispatch) => {
    try {
        const response = await csrfFetch('/api/experiences', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newExperience),
        });
        const experience = await response.json();
        dispatch(createExperience(experience));
        return experience;
    } catch (err) {
        const message = await unwrapError(err, 'Could not create this experience. Please try again.');
        throw new Error(message);
    }
};

export const updateExperienceThunk = (experienceId, updatedData) => async (dispatch) => {
    try {
        const response = await csrfFetch(`/api/experiences/${experienceId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(updatedData),
        });
        const experience = await response.json();
        dispatch(updateExperience(experience));
        return experience;
    } catch (err) {
        const message = await unwrapError(err, 'Could not update this experience. Please try again.');
        throw new Error(message);
    }
};

export const deleteExperienceThunk = (experienceId) => async (dispatch) => {
    try {
        await csrfFetch(`/api/experiences/${experienceId}`, { method: 'DELETE' });
        dispatch(deleteExperience(experienceId));
    } catch (err) {
        const message = await unwrapError(err, 'Could not delete this experience. Please try again.');
        throw new Error(message);
    }
};

export const bookExperienceThunk = (experienceId, { date, guests, paymentMethod, phoneNumber, provider }) => async (dispatch) => {
    try {
        const response = await csrfFetch(`/api/experiences/${experienceId}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ date, guests, paymentMethod, phoneNumber, provider }),
        });
        const booking = await response.json();
        dispatch({ type: ADD_EXPERIENCE_BOOKING, payload: booking });
        return booking;
    } catch (err) {
        const message = await unwrapError(err, 'Could not complete this booking. Please try again.');
        throw new Error(message);
    }
};

// Polls the direct-charge deposit status for an experience booking that's
// 'awaiting_payment'. Safe to call repeatedly.
export const checkExperienceBookingPaymentThunk = (bookingId) => async () => {
    const response = await csrfFetch(`/api/payments/verify-pawapay?bookingId=${encodeURIComponent(bookingId)}&bookingType=experience`);
    return response.json();
};

// The signed-in provider's own listed experiences — for Manage Experiences.
export const getCurrentUserExperiencesThunk = () => async (dispatch) => {
    try {
        const response = await csrfFetch('/api/experiences/current');
        const data = await response.json();
        dispatch(setMyExperiences(data.Experiences || []));
        return data;
    } catch (err) {
        console.error('Error fetching your experiences:', err);
    }
};

// The signed-in guest's own experience bookings across every experience —
// for My Trips.
export const getCurrentUserExperienceBookingsThunk = () => async (dispatch) => {
    try {
        const response = await csrfFetch('/api/experiences/bookings/current');
        const data = await response.json();
        dispatch(setCurrentUserExperienceBookings(data || []));
        return data;
    } catch (err) {
        console.error('Error fetching your experience bookings:', err);
    }
};

// ---- Reducer ----
const initialState = {
    allExperiences: [],
    byId: {},
    currentExperience: null,
    myExperiences: [],
    currentUserBookings: [],
};

const experiencesReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_MY_EXPERIENCES: {
            return { ...state, myExperiences: action.payload || [] };
        }

        case SET_CURRENT_USER_EXPERIENCE_BOOKINGS: {
            return { ...state, currentUserBookings: action.payload || [] };
        }

        case GET_ALL_EXPERIENCES: {
            const experiencesArr = action.payload.Experiences || [];
            const byId = {};
            for (const experience of experiencesArr) {
                byId[experience.id] = experience;
            }
            return { ...state, allExperiences: experiencesArr, byId };
        }

        case GET_EXPERIENCE_DETAILS: {
            const experience = action.payload;
            return {
                ...state,
                currentExperience: experience,
                byId: { ...state.byId, [experience.id]: experience },
            };
        }

        case CREATE_EXPERIENCE: {
            const newExperience = action.payload;
            return {
                ...state,
                allExperiences: [...state.allExperiences, newExperience],
                byId: { ...state.byId, [newExperience.id]: newExperience },
                currentExperience: newExperience,
            };
        }

        case UPDATE_EXPERIENCE: {
            const updated = action.payload;
            const merged = { ...(state.byId[updated.id] || {}), ...updated };
            return {
                ...state,
                allExperiences: state.allExperiences.map((e) => (e.id === updated.id ? merged : e)),
                byId: { ...state.byId, [updated.id]: merged },
                currentExperience: state.currentExperience && state.currentExperience.id === updated.id
                    ? merged
                    : state.currentExperience,
            };
        }

        case DELETE_EXPERIENCE: {
            const idToDelete = action.payload;
            const newById = { ...state.byId };
            delete newById[idToDelete];
            return {
                ...state,
                allExperiences: state.allExperiences.filter((e) => e.id !== idToDelete),
                myExperiences: state.myExperiences.filter((e) => e.id !== idToDelete),
                byId: newById,
            };
        }

        default:
            return state;
    }
};

export default experiencesReducer;
