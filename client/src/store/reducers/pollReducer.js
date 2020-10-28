import axios from 'axios';
import _ from 'lodash';
import {
	CREATE_POLL_REQUEST,
	CREATE_POLL_SUCCESS,
	CREATE_POLL_FAILURE,
	GET_POLL_REQUEST,
	GET_POLL_SUCCESS,
	GET_POLL_FAILURE,
	DELETE_POLL_REQUEST,
	DELETE_POLL_SUCCESS,
	DELETE_POLL_FAILURE,
	EDIT_POLL_REQUEST,
	EDIT_POLL_SUCCESS,
	EDIT_POLL_FAILURE,
	UPDATE_POLL,
	VOTE_POLL_REQUEST,
	VOTE_POLL_SUCCESS,
	VOTE_POLL_FAILURE,
	SELECT_OPTION,
	DISABLE_VOTING
} from '../actions/types/pollTypes'

const initState = { poll: {}, loading: undefined, error: undefined, selected: undefined };
const transform = poll => ({
	...poll,
	tags: _.uniq([...(poll.autoTags || []), ...(poll.tags || [])]),
	options: poll.options.map(option => ({ ...option, percent: parseInt((option.votes / poll.total_votes) * 100) }))
})

const pollReducer = (state = initState, action) => {
	console.log('[pollReducer] action', action);

	switch (action.type) {
		case CREATE_POLL_REQUEST:
		case CREATE_POLL_SUCCESS:
		case CREATE_POLL_FAILURE:
			return state;
		case GET_POLL_REQUEST: return { ...initState, poll: { ...state.poll }, loading: true };
		case GET_POLL_SUCCESS: return { ...initState, poll: { ...state.poll, ...transform(action.poll) } };
		case GET_POLL_FAILURE: return { ...initState, poll: { ...state.poll }, error: action.error };

		case DELETE_POLL_REQUEST:
		case DELETE_POLL_SUCCESS:
		case DELETE_POLL_FAILURE:
			return state;
		case EDIT_POLL_REQUEST:
		case EDIT_POLL_SUCCESS:
		case EDIT_POLL_FAILURE:
			return state;

		case UPDATE_POLL: return { ...state, poll: { ...state.poll, ...transform(action.poll) } };
		case SELECT_OPTION: return { ...state, selected: action.selected };
		case DISABLE_VOTING: return { ...state, poll: { ...state.poll, expired: true } };

		case VOTE_POLL_REQUEST: return { ...initState, poll: { ...state.poll }, loading: true };
		case VOTE_POLL_SUCCESS: return { ...initState, poll: { ...state.poll, ...transform(action.poll) } };
		case VOTE_POLL_FAILURE: return { ...initState, poll: { ...state.poll }, error: action.error };
		default: return state;
	}
}

export default pollReducer;