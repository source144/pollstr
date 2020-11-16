import { combineReducers } from 'redux';
import managePollsReducer from './managePollsReducer';
import pollReducer from './pollReducer';
import authReducer from './authReducer';
import modalReducer from './modalReducer';

const rootReducer = combineReducers({
	polls: managePollsReducer,
	poll: pollReducer,
	auth: authReducer,
	modal: modalReducer
});

export default rootReducer;