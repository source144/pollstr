import FingerprintJS from '@fingerprintjs/fingerprintjs';
import React from 'react'
import axios from 'axios';
import moment from 'moment';
import _ from 'lodash';
import { toast } from 'react-toastify';
import {
	AUTH_FINGERPRINT_REQUEST,
	AUTH_FINGERPRINT_SUCCESS,
	AUTH_FINGERPRINT_FAILURE,
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
} from './types/authTypes'

const DATE_FORMAT = "ddd, MMM Do YYYY, hA";

// let visitorId;
// let requestInterceptor;
// requestInterceptor = axios.interceptors.request.use(config =>
// 	new Promise((resolve, reject) => {
// 		// ... your code ...

// 		axios.get(API_BASE_URL + '/auth/refresh')
// 			.then(response => {
// 				// Get your config from the response
// 				const newConfig = getConfigFromResponse(response);

// 				// Resolve the promise
// 				resolve(newConfig);
// 			}, reject);

// 		// Or when you don't need an HTTP request just resolve
// 		resolve(config);
// 	})
// });

const authFingerprintSuccess = () => ({ type: AUTH_FINGERPRINT_SUCCESS });
const authFingerprintFailure = (error, errorMsg) => ({ type: AUTH_FINGERPRINT_FAILURE, error_data: error, error: errorMsg });
export const authFingerprint = () => {
	return (dispatch) => {
		FingerprintJS.load()
			.then(fp => {
				fp.get()
					.then(({ visitorId }) => {
						
						// Register visitor with API
						axios.post('/auth/fingerprint', { visitorId })
							.then(response => {

								// Add fingerprint to header
								axios.defaults.headers.common['x-finger-print'] = visitorId;

								dispatch(authFingerprintSuccess())
							})
							.catch(error => {
								console.log(error);
								dispatch(authFingerprintFailure(error, "failed to store fingerprint on server"))
							})
					})
					.catch(error => {
						console.log(error);
						dispatch(authFingerprintFailure(error, "failed to get fingerprint"))
					})
			})
			.catch(error => {
				console.log(error);
				dispatch(authFingerprintFailure(error, "failed to connect to fingerpint server"))
			});
	}
}

const authResendVerificationRequest = () => ({ type: AUTH_RESEND_VERIFICATION_REQUEST });
const authResendVerificationSuccess = () => ({ type: AUTH_RESEND_VERIFICATION_SUCCESS });
const authResendVerificationFailure = error => ({ type: AUTH_RESEND_VERIFICATION_FAILURE, error });
export const authResendVerification = email => {
	return (dispatch) => {
		dispatch(authResendVerificationRequest);
		axios.post('auth/verify/resend', { email })
			.then(response => {
				dispatch(authResendVerificationSuccess());

				// Toast user for verification resent
				toast('Verification email resent.', { position: "top-center", autoClose: 8000 });
			})
			.catch(error => {
				const errorData = error.response ? error.response.data : {};
				const errorMsg = error.response && error.response.data ? (error.response.data.message ? error.response.data.message : (typeof error.response.data.error === 'string' ? error.response.data.error : error.message)) : error.message;
				dispatch(authResendVerificationFailure(errorMsg));
			})
	}
}

const authSignupRequest = () => ({ type: AUTH_SIGNUP_REQUEST });
const authSignupSuccess = () => ({ type: AUTH_SIGNUP_SUCCESS });
const authSignupFailure = error => ({ type: AUTH_SIGNUP_FAILURE, error });
export const authSignup = auth => {
	return (dispatch) => {
		dispatch(authSignupRequest);
		axios.post('auth/signup', auth)
			.then(response => {
				dispatch(authSignupSuccess());

				// Toast user for registration
				toast(<>Registartion Successful<br />Check your email for a verification link</>, { position: "top-center", autoClose: 8000 });
			})
			.catch(error => {
				const errorData = error.response ? error.response.data : {};
				const errorMsg = error.response && error.response.data ? (error.response.data.message ? error.response.data.message : (typeof error.response.data.error === 'string' ? error.response.data.error : error.message)) : error.message;
				dispatch(authSignupFailure(errorMsg));
			})
	}
}

let authInterceptor;
const authLoginRequest = () => ({ type: AUTH_LOGIN_REQUEST });
const authLoginSuccess = auth => ({ type: AUTH_LOGIN_SUCCESS, auth });
const authLoginFailure = (error, needsVerification) => ({ type: AUTH_LOGIN_FAILURE, error, needsVerification });
export const authLogin = auth => {
	return (dispatch) => {
		dispatch(authLoginRequest());
		axios.post('auth/login', auth)
			.then(response => {
				const authData = response.data;

				// Dispose old Auth Interceptor
				if (authInterceptor)
					axios.interceptors.response.eject(authInterceptor);

				const { accessToken, refreshToken, accessLife, refreshLife } = authData;
				localStorage.setItem('refresh', refreshToken);

				// Create new Auth Interceptor
				axios.defaults.headers.common['AUTHORIZATION'] = `Bearer ${accessToken}`;
				authInterceptor = createAuthInterceptor(refreshToken);

				dispatch(authLoginSuccess(_.omit(authData, ['accessToken', 'refreshToken', 'accessLife', 'refreshLife'])));

				// Toast user for login
				const FULL_NAME = authData.firstName || authData.lastName || '';
				const FULL_NAME_STR = FULL_NAME ? `, ${FULL_NAME}` : '';
				const WELCOME_MSG = `Welcome${authData.lastLogin ? ` Back${FULL_NAME_STR}` : FULL_NAME_STR}!`
				const LAST_LOGIN = authData.lastLogin ? <>< br /> Last login {moment(authData.lastLogin).format(DATE_FORMAT)}</> : null;
				toast(<>{WELCOME_MSG}{LAST_LOGIN}</>, { position: "top-left" });
				// TODO : set 
			})
			.catch(error => {
				const errorData = error.response ? error.response.data : {};
				const errorMsg = error.response && error.response.data ? (error.response.data.message ? error.response.data.message : (typeof error.response.data.error === 'string' ? error.response.data.error : error.message)) : error.message;

				let needsVerification;
				if (error.response && error.response.status === 426 && error.config.data)
					needsVerification = JSON.parse(error.config.data).email

				dispatch(authLoginFailure(errorMsg, needsVerification));
			})
	}
}


const authRefreshRequest = () => ({ type: AUTH_REFRESH_REQUEST });
const authRefreshSuccess = auth => ({ type: AUTH_REFRESH_SUCCESS, auth });
const authRefreshFailure = error => ({ type: AUTH_REFRESH_FAILURE, error });
export const authRefresh = refresh_token => {
	return (dispatch) => {
		dispatch(authRefreshRequest());

		// Dispose old Auth Interceptor
		if (authInterceptor != undefined)
			axios.interceptors.response.eject(authInterceptor);

		// Refresh token
		axios.post('/auth/refresh/', { refresh_token })
			.then(response => {
				// Use new token
				const new_token = response.data.accessToken;

				// Load user data
				axios.get('/auth/', { headers: { Authorization: `Bearer ${new_token}` } })
					.then(response => {
						// Default Auth header
						axios.defaults.headers.common['AUTHORIZATION'] = `Bearer ${new_token}`;

						// Create new Auth Interceptor
						authInterceptor = createAuthInterceptor(refresh_token);

						// Dispatch completion
						dispatch(authRefreshSuccess(response.data));

						// Toast user
						const FULL_NAME = response.data.firstName || response.data.lastName || '';
						const FULL_NAME_STR = FULL_NAME ? `, ${FULL_NAME}` : '';
						const WELCOME_MSG = `Welcome${response.data.lastLogin ? ` Back${FULL_NAME_STR}` : FULL_NAME_STR}!`
						toast(<>{WELCOME_MSG}</>, { position: "top-left", });
					})
					.catch(error => {
						const errorData = error.response ? error.response.data : {};
						const errorMsg = error.response && error.response.data ? (error.response.data.message ? error.response.data.message : (typeof error.response.data.error === 'string' ? error.response.data.error : error.message)) : error.message;
						dispatch(authRefreshFailure(error))
					});
			})
			.catch(error => {
				const errorData = error.response ? error.response.data : {};
				const errorMsg = error.response && error.response.data ? (error.response.data.message ? error.response.data.message : (typeof error.response.data.error === 'string' ? error.response.data.error : error.message)) : error.message;
				localStorage.removeItem('refresh');
				dispatch(authRefreshFailure(error))
			})
	}
};
const authLogoutRequest = () => ({ type: AUTH_LOGOUT_REQUEST });
const authLogoutSuccess = () => ({ type: AUTH_LOGOUT_SUCCESS });
export const authLogout = auth => {
	return (dispatch) => {
		dispatch(authLogoutRequest())

		delete axios.defaults.headers.common["Authorization"];
		const refresh_token = localStorage.getItem('refresh');

		if (refresh_token) {
			axios.post('/auth/logout/', { refresh_token })
				.then(response => { })
				.catch(error => { })
				.then(response => {
					localStorage.removeItem('refresh');
					dispatch(authLogoutSuccess());
				});
		} else dispatch(authLogoutSuccess());
	}
};


// const tokenInstance = axios.create({ baseURL: 'https://pollstr-app.herokuapp.com/api/' });
// const tokenInstance = axios.create({ baseURL: 'http://localhost:5000/api/' });

// TODO : think about using an instance to avoid recursive calls
const createAuthInterceptor = refresh_token => {
	return axios.interceptors.response.use(
		response => response,
		error => {

			const originalError = error;
			const originalRequest = error.config;

			switch (error.response.status) {
				// Auth related errors
				case 401:
				case 403:
					// Get new access token using the refresh token
					if (error.response.data.action && error.response.data.action === 'REFRESH') {
						return axios.post('/auth/refresh/', { refresh_token })
							.then(response => {
								// Set default Auth header
								axios.defaults.headers.common['AUTHORIZATION'] = `Bearer ${response.data.accessToken}`;

								// Overwrite the failed request's Auth header
								originalRequest.headers['AUTHORIZATION'] = `Bearer ${response.data.accessToken}`;

								// Send the result of the request again
								return axios(originalRequest);
							})
							// Failed to get new access token
							.catch(error => {

								// Dispose bad access token and refresh token
								delete axios.defaults.headers.common["Authorization"];
								localStorage.removeItem('refresh');

								// TODO : eject the interceptor in this case!
								// Dispose old Auth Interceptor
								if (authInterceptor != undefined)
									axios.interceptors.response.eject(authInterceptor);

								// TODO : reject the original error?
								return Promise.reject(originalError);
							});
					}
					// API prompts client to logout
					else if (!error.response.data.action || error.response.data.action === 'LOGOUT') {
						return axios.post('/auth/logout/', { refresh_token })
							.finally(() => {
								// TODO : dispatch authLogout()

								// Dispose bad access token and refresh token
								delete axios.defaults.headers.common["Authorization"];
								localStorage.removeItem('refresh');

								// TODO : eject the interceptor in this case!
								// Dispose old Auth Interceptor
								if (authInterceptor != undefined)
									axios.interceptors.response.eject(authInterceptor);

								// Reject the original error?
								return Promise.reject(originalError)
							})
					}
					return Promise.reject(originalError);

				default: return Promise.reject(originalError);
			}
		}
	);
}