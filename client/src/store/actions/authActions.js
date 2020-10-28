import axios from 'axios';
import {
	AUTH_SIGNUP_REQUEST,
	AUTH_SIGNUP_SUCCESS,
	AUTH_SIGNUP_FAILURE
} from './types/pollTypes'

const authSignupRequest = () => ({ type: AUTH_SIGNUP_REQUEST });
const authSignupSuccess = () => ({ type: AUTH_SIGNUP_SUCCESS });
const authSignupFailure = error => ({ type: AUTH_SIGNUP_FAILURE, register_error: error });
const authSignup = auth => {
	return (dispatch) => {
		dispatch(authSignupRequest);
		axios.post('auth/signup', auth)
			.then(response => {
				dispatch(authSignupSuccess);
			})
			.catch(error => {
				const errorData = error.response ? error.reponse.data : {};
				const errorMsg = error.response ? error.response.message : error.message;
				dispatch(authSignupFailure(errorMsg));
			})
	}
}

const authLoginRequest = () => ({ type: AUTH_LOGIN_REQUEST });
const authLoginSuccess = auth => ({ type: AUTH_LOGIN_SUCCESS, auth });
const authLoginFailure = error => ({ type: AUTH_LOGIN_FAILURE, register_error: error });
const authLogin = auth => {
	return (dispatch) => {
		dispatch(authLoginRequest);
		axios.post('auth/login', auth)
			.then(response => {
				const authData = response.data;
				axios.defaults.headers.common['AUTHORIZATION'] = `Bearer ${response.data.token}`;
				dispatch(authLoginSuccess(_.omit(authData, ['token'])));

				// TODO : set 
			})
			.catch(error => {
				const errorData = error.response ? error.reponse.data : {};
				const errorMsg = error.response ? error.response.message : error.message;
				dispatch(authLoginFailure(errorMsg));
			})
	}
}