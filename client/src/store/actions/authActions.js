import axios from 'axios';
import _ from 'lodash';
import {
	AUTH_SIGNUP_REQUEST,
	AUTH_SIGNUP_SUCCESS,
	AUTH_SIGNUP_FAILURE,
	AUTH_LOGIN_REQUEST,
	AUTH_LOGIN_SUCCESS,
	AUTH_LOGIN_FAILURE,
	AUTH_REFRESH_REQUEST,
	AUTH_REFRESH_SUCCESS,
	AUTH_REFRESH_FAILURE,
	AUTH_LOGOUT_REQUEST,
	AUTH_LOGOUT_SUCCESS,
} from './types/authTypes'

const authSignupRequest = () => ({ type: AUTH_SIGNUP_REQUEST });
const authSignupSuccess = () => ({ type: AUTH_SIGNUP_SUCCESS });
const authSignupFailure = error => ({ type: AUTH_SIGNUP_FAILURE, error });
export const authSignup = auth => {
	return (dispatch) => {
		dispatch(authSignupRequest);
		axios.post('auth/signup', auth)
			.then(response => {
				dispatch(authSignupSuccess());
			})
			.catch(error => {
				const errorData = error.response ? error.response.data : {};
				const errorMsg = error.response && error.response.data ? (error.response.data.error ? error.response.data.error : error.response.data.message) : error.message;
				dispatch(authSignupFailure(errorMsg));
			})
	}
}

let authInterceptor;
const authLoginRequest = () => ({ type: AUTH_LOGIN_REQUEST });
const authLoginSuccess = auth => ({ type: AUTH_LOGIN_SUCCESS, auth });
const authLoginFailure = error => ({ type: AUTH_LOGIN_FAILURE, error });
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

				// TODO : set 
			})
			.catch(error => {
				const errorData = error.response ? error.response.data : {};
				const errorMsg = error.response && error.response.data ? (error.response.data.error ? error.response.data.error : error.response.data.message) : error.message;
				dispatch(authLoginFailure(errorMsg));
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
		if (authInterceptor)
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
					})
					.catch(error => {
						const errorData = error.response ? error.response.data : {};
						const errorMsg = error.response && error.response.data ? (error.response.data.error ? error.response.data.error : error.response.data.message) : error.message;
						dispatch(authRefreshFailure(error))
					});
			})
			.catch(error => {
				const errorData = error.response ? error.response.data : {};
				const errorMsg = error.response && error.response.data ? (error.response.data.error ? error.response.data.error : error.response.data.message) : error.message;
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
					dispatch(authLogoutSuccess);
				});
		} else dispatch(authLogoutSuccess);
	}
};


// const tokenInstance = axios.create({ baseURL: 'https://pollstr-app.herokuapp.com/api/' });
// const tokenInstance = axios.create({ baseURL: 'http://localhost:5000/api/' });

const createAuthInterceptor = refresh_token => {
	return axios.interceptors.response.use(
		response => response,
		error => {
			console.log('[Auth Interceptor] Process begins');
			console.log('[Auth Interceptor] Original error:', error);
			if (error.response && error.response.data)
				console.log('[Auth Interceptor] Original error data:', error.response.data);

			const originalError = error;
			const originalRequest = error.config;
			if (error.response.status == 403 || error.response.status == 401) {
				if (error.response.data.action && error.response.data.action === 'REFRESH') {
					return axios.post('/auth/refresh/', { refresh_token })
						.then(response => {
							console.log('[Auth Interceptor] Refreshed!')

							axios.defaults.headers.common['AUTHORIZATION'] = `Bearer ${response.data.accessToken}`;
							originalRequest.headers['AUTHORIZATION'] = `Bearer ${response.data.accessToken}`;

							return axios(originalRequest);
						})
						.catch(error => {
							console.log('[Auth Interceptor] Denied!')

							delete axios.defaults.headers.common["Authorization"];
							localStorage.removeItem('refresh');
							return Promise.reject(error);
						});
				}
				else if (!error.response.data.action || error.response.data.action === 'LOGOUT') {
					console.log('[Auth Interceptor] Should LOGOUT');

					return axios.post('/auth/logout/', { refresh_token })
						.finally(() => {
							// TODO : dispatch authLogout()
							console.log('[Auth Interceptor] Logged out!')

							delete axios.defaults.headers.common["Authorization"];
							localStorage.removeItem('refresh');

							return Promise.reject(originalError)
						})
				}
			}
			else {
				console.log('[Auth Interceptor] nothing to do!');
				return Promise.reject(originalError);
			}
		}
	);
}