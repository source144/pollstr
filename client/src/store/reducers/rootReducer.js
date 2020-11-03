import { combineReducers } from 'redux';
import pollReducer from './pollReducer';
import authReducer from './authReducer';
import modalReducer from './modalReducer';

const rootReducer = combineReducers({
	poll: pollReducer,
	auth: authReducer,
	modal: modalReducer
});

export default rootReducer;