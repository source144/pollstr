import moment from 'moment';
import _ from 'lodash';
// GET_POLLS_REQUEST
// GET_POLLS_SUCCESS
// GET_POLLS_FAILURE
import {
	GET_POLLS_REQUEST,
	GET_POLLS_SUCCESS,
	GET_POLLS_FAILURE,
	DELETE_POLL_REQUEST,
	DELETE_POLL_SUCCESS,
	DELETE_POLL_FAILURE,
	EDIT_POLL_REQUEST,
	EDIT_POLL_SUCCESS,
	EDIT_POLL_FAILURE,
	EDIT_POLL_PASSCODE_REQUEST,
	EDIT_POLL_PASSCODE_SUCCESS,
	EDIT_POLL_PASSCODE_FAILURE,
	UPDATE_POLL,
	FLUSH_OP_ERRORS,
	FLUSH_POLLS,
} from '../actions/types/managePollsTypes'

// ~~~~~~~~~~~~~~
// TODO : Idea ~~
// ~~~~~~~~~~~~~~
// Listen to all polls that are loaded?
// (or a portion of them that are displayed)
// Update all of them live????

const initState = { polls: [], loading: undefined, error: undefined, op_loading: undefined, op_error: undefined };
const transform_one = poll => ({
	...poll,
	tags: _.uniq([...(poll.autoTags || []), ...(poll.tags || [])]),
	options: poll.options.map(option => ({
		...option,
		percent: poll.total_votes > 0 ? parseInt((option.votes / poll.total_votes) * 100) : 0,
	})),
	expired: poll.timeToLive != 0 && poll.timeToLive - (moment().unix() - moment(poll.createDate).unix()) < 0
});
const transform = polls => {
	if (!polls || !Array.isArray(polls))
		return [];

	return polls.map(transform_one);
}

const pollReducer = (state = initState, action) => {

	switch (action.type) {
		case GET_POLLS_REQUEST: return { ...initState, loading: true };
		case GET_POLLS_SUCCESS: return { ...initState, polls: transform(action.polls) };
		case GET_POLLS_FAILURE: return { ...initState, error: action.error };

		case DELETE_POLL_REQUEST: return { polls: state.polls, ...initState, op_loading: true };
		case DELETE_POLL_SUCCESS: return { ...initState, polls: state.polls.filter(poll => poll.id != action.pollId) };
		case DELETE_POLL_FAILURE: return { ...initState, polls: state.polls, op_error: action.error };

		case EDIT_POLL_SUCCESS:
		case UPDATE_POLL:
			return { ...initState, polls: state.polls.map(poll => poll.id != action.pollId ? poll : transform_one({ ...poll, ...action.pollData })) };
		case EDIT_POLL_FAILURE: return { ...initState, polls: state.polls, op_error: action.error };
		case EDIT_POLL_REQUEST: return { ...initState, polls: state.polls, op_loading: true };

		case EDIT_POLL_PASSCODE_REQUEST: return { ...initState, polls: state.polls, op_loading: true };
		case EDIT_POLL_PASSCODE_SUCCESS: return { ...initState, polls: state.polls.map(poll => poll.id != action.pollId ? poll : transform_one({ ...poll, passcode: action.passcode })) };
		case EDIT_POLL_PASSCODE_FAILURE: return { ...initState, polls: state.polls, op_error: action.error };


		case FLUSH_OP_ERRORS: return { ...state, op_error: undefined };
		case FLUSH_POLLS: return { ...initState };

		default: return state;
	}
}

export default pollReducer;