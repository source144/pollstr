import axios from 'axios';
import {
	AUTH_SIGNUP_REQUEST,
	AUTH_SIGNUP_SUCCESS,
	AUTH_SIGNUP_FAILURE
} from './actions/types/authTypes'

let authInterceptor;
export default store => next => action => {

	// Intercept only when we have a token
	if (action.type != AUTH_SIGNUP_SUCCESS)
		return next(action)

	// Dispose old interceptor
	if (authInterceptor)
		axios.interceptors.response.eject(authInterceptor);

	const { accessToken, refreshToken, accessLife, refreshLife } = action.auth;

	axios.defaults.headers.common['AUTHORIZATION'] = `Bearer ${accessToken}`;
	authInterceptor = axios.interceptors.response.use(
		response => response,
		error => {
			const originalRequest = error.config;
			if (error.response.status == 403 || error.response.status == 401) {
				if (error.response.data.action && error.response.data.action === 'REFRESH') {
					let _error;
					axios.post('/auth/refresh/', refreshToken)
						.then(response => { axios.defaults.headers.common['AUTHORIZATION'] = `Bearer ${response.data.accessToken}`; })
						.catch(error => { _error = error })
						.then(() => {
							if (!_error) return axios(originalRequest);
							else Promise.reject(_error);
						});
				}
				else if (!error.response.data.action || error.response.data.action === 'LOGOUT') {
					delete axios.defaults.headers.common["Authorization"];
					axios.post('/auth/logout/', refreshToken)
						.then(response => { })
						.catch(error => { })
						.then(() => Promise.reject(error));
				}
			}
			Promise.reject(error);
		}
	);

	return next(action);
}
