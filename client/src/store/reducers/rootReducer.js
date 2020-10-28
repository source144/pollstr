import { combineReducers } from 'redux';
import pollReducer from './pollReducer';
import authReducer from './authReducer';

const rootReducer = combineReducers({
	poll: pollReducer,
	auth: authReducer
});

export default rootReducer;