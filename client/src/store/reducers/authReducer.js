import _ from 'lodash';
import {
	AUTH_SIGNUP_REQUEST,
	AUTH_SIGNUP_SUCCESS,
	AUTH_SIGNUP_FAILURE,
	AUTH_RESEND_VERIFICATION_REQUEST,
	AUTH_RESEND_VERIFICATION_SUCCESS,
	AUTH_RESEND_VERIFICATION_FAILURE,
	AUTH_LOGIN_REQUEST,
	AUTH_LOGIN_SUCCESS,
	AUTH_LOGIN_FAILURE,
	AUTH_REFRESH_REQUEST,
	AUTH_REFRESH_SUCCESS,
	AUTH_REFRESH_FAILURE,
	AUTH_LOGOUT_REQUEST,
	AUTH_LOGOUT_SUCCESS,
} from '../actions/types/authTypes'
const initialState = {};

const initState = { auth: {}, loading: undefined, error: undefined, signup_complete: undefined, signup_loading: undefined, signup_error: undefined, global_loading: undefined, global_error: undefined, needsVerification: undefined };
const authReducer = (state = initState, action) => {

	switch (action.type) {
		case AUTH_SIGNUP_REQUEST: return { ...initState, signup_loading: true };
		case AUTH_SIGNUP_SUCCESS: return { ...initState, signup_complete: true };
		case AUTH_SIGNUP_FAILURE: return { ...initState, signup_error: action.error };

		case AUTH_LOGIN_REQUEST: return { ...initState, loading: true };
		case AUTH_LOGIN_SUCCESS: return { ...initState, auth: action.auth };
		case AUTH_LOGIN_FAILURE: return { ...initState, error: action.error, needsVerification: action.needsVerification };

		case AUTH_REFRESH_REQUEST: return { ...initState, global_loading: true };
		case AUTH_REFRESH_SUCCESS: return { ...initState, auth: action.auth };
		case AUTH_REFRESH_FAILURE: return { ...initState, global_error: action.error };

		case AUTH_LOGOUT_REQUEST: return { ...initState, global_loading: true };
		case AUTH_LOGOUT_SUCCESS: return { ...initState };

		case AUTH_RESEND_VERIFICATION_REQUEST: return { ...initState, loading: true };
		case AUTH_RESEND_VERIFICATION_SUCCESS: return { ...initState, error: "Verification email resent." };
		case AUTH_RESEND_VERIFICATION_FAILURE: return { ...initState, error: action.error };

		default: return state;
	}
}

export default authReducer;