import { csrfFetch } from './csrf';

// ---- Action Types ----
const SET_CURRENT_USER_BOOKINGS = 'bookings/SET_CURRENT_USER_BOOKINGS';
const ADD_BOOKING = 'bookings/ADD_BOOKING';
const UPDATE_BOOKING = 'bookings/UPDATE_BOOKING';
const REMOVE_BOOKING = 'bookings/REMOVE_BOOKING';
const SET_BOOKING_ERROR = 'bookings/SET_BOOKING_ERROR';
const CLEAR_BOOKING_ERROR = 'bookings/CLEAR_BOOKING_ERROR';

// ---- Action Creators ----
const setCurrentUserBookings = (bookings) => ({
    type: SET_CURRENT_USER_BOOKINGS,
    payload: bookings,
});

const addBooking = (booking) => ({
    type: ADD_BOOKING,
    payload: booking,
});

const updateBookingAction = (booking) => ({
    type: UPDATE_BOOKING,
    payload: booking,
});

const removeBookingAction = (bookingId) => ({
    type: REMOVE_BOOKING,
    payload: bookingId,
});

const setBookingError = (error) => ({
    type: SET_BOOKING_ERROR,
    payload: error,
});

export const clearBookingError = () => ({
    type: CLEAR_BOOKING_ERROR,
});

// ---- Thunks ----

// Create a booking for a spot. Mirrors the backend's actual error shape
// (400 validation, 403 conflict) so the UI can show a real message instead
// of a generic failure.
export const createBookingThunk = (spotId, { startDate, endDate, paymentMethod, phoneNumber, provider }) => async (dispatch) => {
    dispatch(clearBookingError());
    try {
        const response = await csrfFetch(`/api/spots/${spotId}/bookings`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate, endDate, paymentMethod, phoneNumber, provider }),
        });
        const booking = await response.json();
        dispatch(addBooking(booking));
        return booking;
    } catch (err) {
        let message = 'Could not complete the booking. Please try again.';
        if (err && typeof err.json === 'function') {
            try {
                const data = await err.json();
                if (data?.errors) {
                    message = Object.values(data.errors).join(' ');
                } else if (data?.message) {
                    message = data.message;
                }
            } catch (_) { /* fall back to generic message */ }
        }
        dispatch(setBookingError(message));
        throw new Error(message);
    }
};

// Polls the direct-charge deposit status for a booking that's
// 'awaiting_payment' — the guest is expected to be entering their mobile
// money PIN on their own phone right about now. Safe to call repeatedly.
export const checkBookingPaymentStatusThunk = (bookingId, bookingType = 'spot') => async () => {
    const response = await csrfFetch(`/api/payments/verify-pawapay?bookingId=${encodeURIComponent(bookingId)}&bookingType=${encodeURIComponent(bookingType)}`);
    return response.json();
};

export const fetchCurrentUserBookingsThunk = () => async (dispatch) => {
    try {
        const response = await csrfFetch('/api/bookings/current');
        const data = await response.json();
        dispatch(setCurrentUserBookings(data.Bookings || data));
    } catch (err) {
        console.error('Error fetching current user bookings:', err);
    }
};

export const updateBookingThunk = (bookingId, { startDate, endDate }) => async (dispatch) => {
    dispatch(clearBookingError());
    try {
        const response = await csrfFetch(`/api/bookings/${bookingId}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ startDate, endDate }),
        });
        const booking = await response.json();
        dispatch(updateBookingAction(booking));
        return booking;
    } catch (err) {
        let message = 'Could not update the booking.';
        if (err && typeof err.json === 'function') {
            try {
                const data = await err.json();
                message = data?.message || message;
            } catch (_) { /* noop */ }
        }
        dispatch(setBookingError(message));
        throw new Error(message);
    }
};

export const deleteBookingThunk = (bookingId) => async (dispatch) => {
    try {
        await csrfFetch(`/api/bookings/${bookingId}`, { method: 'DELETE' });
        dispatch(removeBookingAction(bookingId));
    } catch (err) {
        console.error('Error deleting booking:', err);
        throw err;
    }
};

// ---- Reducer ----
const initialState = {
    currentUserBookings: [],
    error: null,
};

const bookingsReducer = (state = initialState, action) => {
    switch (action.type) {
        case SET_CURRENT_USER_BOOKINGS:
            return { ...state, currentUserBookings: action.payload || [] };
        case ADD_BOOKING:
            return { ...state, currentUserBookings: [...state.currentUserBookings, action.payload] };
        case UPDATE_BOOKING:
            return {
                ...state,
                currentUserBookings: state.currentUserBookings.map((b) =>
                    b.id === action.payload.id ? action.payload : b
                ),
            };
        case REMOVE_BOOKING:
            return {
                ...state,
                currentUserBookings: state.currentUserBookings.filter((b) => b.id !== action.payload),
            };
        case SET_BOOKING_ERROR:
            return { ...state, error: action.payload };
        case CLEAR_BOOKING_ERROR:
            return { ...state, error: null };
        default:
            return state;
    }
};

export default bookingsReducer;
