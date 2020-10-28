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
} from './types/authTypes'

const authSignupRequest = () => ({ type: AUTH_SIGNUP_REQUEST });
const authSignupSuccess = () => ({ type: AUTH_SIGNUP_SUCCESS });
const authSignupFailure = error => ({ type: AUTH_SIGNUP_FAILURE, error });
export const authSignup = auth => {
	return (dispatch) => {
		console.log('[authSignup] dispatch')
		dispatch(authSignupRequest);
		axios.post('auth/signup', auth)
			.then(response => {
				dispatch(authSignupSuccess());
			})
			.catch(error => {
				console.log(error.resonse && error.response.data ? error.response.data : error.response)
				const errorData = error.response ? error.response.data : {};
				const errorMsg = error.response && error.response.data ? error.response.data.error : error.message;
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
				const errorMsg = error.response && error.response.data ? error.response.data.error : error.message;
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
						const errorMsg = error.response && error.response.data ? error.response.data.error : error.message;
						console.log('Refresh error on GET user profile', error)
						dispatch(authRefreshFailure(error))
					});
			})
			.catch(error => {
				const errorData = error.response ? error.response.data : {};
				const errorMsg = error.response && error.response.data ? error.response.data.error : error.message;
				localStorage.removeItem('refresh');
				dispatch(authRefreshFailure(error))
			})
	}
};

export const authLogout = auth => {
	return (dispatch) => {

	}
};



const createAuthInterceptor = refresh_token => {
	return axios.interceptors.response.use(
		response => response,
		error => {
			const originalRequest = error.config;
			if (error.response.status == 403 || error.response.status == 401) {
				if (error.response.data.action && error.response.data.action === 'REFRESH') {
					let _error;
					axios.post('/auth/refresh/', { refresh_token })
						.then(response => { axios.defaults.headers.common['AUTHORIZATION'] = `Bearer ${response.data.accessToken}`; })
						.catch(error => { _error = error })
						.then(() => {

							if (!_error) console.log('[Auth Interceptor] Refreshed!')
							else console.log('[Auth Interceptor] Denied!')

							if (_error) {
								delete axios.defaults.headers.common["Authorization"];
								localStorage.removeItem('refresh');
								Promise.reject(_error);
							}
							else return axios(originalRequest);
						});
				}
				else if (!error.response.data.action || error.response.data.action === 'LOGOUT') {
					delete axios.defaults.headers.common["Authorization"];
					axios.post('/auth/logout/', refresh_token)
						.then(response => { })
						.catch(error => { })
						.then(() => {
							// TODO : dispatch authLogout()
							console.log('[Auth Interceptor] Logged out!')
							localStorage.removeItem('refresh');
							Promise.reject(error)
						});
				}
			}
			console.log('[Auth Interceptor] nothing to do!');
			Promise.reject(error);
		}
	);
}