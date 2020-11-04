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
	AUTH_FINGERPRINT_REQUEST,
	AUTH_FINGERPRINT_SUCCESS,
	AUTH_FINGERPRINT_FAILURE,
} from '../actions/types/authTypes'

const initState = {
	auth: {},
	loading: undefined,
	error: undefined,
	signup_complete: undefined,
	signup_loading: undefined,
	signup_error: undefined,
	needsVerification: undefined,
	global_loading: undefined,
	global_error: undefined,
};
const authReducer = (state = initState, action) => {

	// Grab the current fingerprint state
	const { fingerprint } = state;

	switch (action.type) {
		case AUTH_SIGNUP_REQUEST: return { ...initState, fingerprint, signup_loading: true };
		case AUTH_SIGNUP_SUCCESS: return { ...initState, fingerprint, signup_complete: true };
		case AUTH_SIGNUP_FAILURE: return { ...initState, fingerprint, signup_error: action.error };

		case AUTH_LOGIN_REQUEST: return { ...initState, fingerprint, global_loading: true };
		case AUTH_LOGIN_SUCCESS: return { ...initState, fingerprint, auth: action.auth };
		case AUTH_LOGIN_FAILURE: return { ...initState, fingerprint, error: action.error, needsVerification: action.needsVerification };

		case AUTH_REFRESH_REQUEST: return { ...initState, fingerprint, global_loading: true };
		case AUTH_REFRESH_SUCCESS: return { ...initState, fingerprint, auth: action.auth };
		case AUTH_REFRESH_FAILURE: return { ...initState, fingerprint, global_error: action.error };

		case AUTH_LOGOUT_REQUEST: return { ...initState, fingerprint, global_loading: true };
		case AUTH_LOGOUT_SUCCESS: return { ...initState, fingerprint };

		case AUTH_RESEND_VERIFICATION_REQUEST: return { ...initState, fingerprint, loading: true };
		case AUTH_RESEND_VERIFICATION_SUCCESS: return { ...initState, fingerprint, error: "Verification email resent." };
		case AUTH_RESEND_VERIFICATION_FAILURE: return { ...initState, fingerprint, error: action.error };

		case AUTH_FINGERPRINT_REQUEST: return { ...state };
		case AUTH_FINGERPRINT_SUCCESS: return { ...state, fingerprint: true };
		case AUTH_FINGERPRINT_FAILURE: return { ...state, global_error: action.error, fingerprint: true };

		default: return state;
	}
}

export default authReducer;