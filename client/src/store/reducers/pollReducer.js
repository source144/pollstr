import axios from 'axios';
import moment from 'moment';
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
	DISABLE_VOTING,
	FLUSH_POLL
} from '../actions/types/pollTypes'

const initState = { poll: {}, loading: undefined, error: undefined, selected: undefined };
const transform = poll => {
	const expired = poll.timeToLive != 0 && poll.timeToLive - (moment().unix() - moment(poll.createDate).unix()) < 0;
	return {
		...poll,
		tags: _.uniq([...(poll.autoTags || []), ...(poll.tags || [])]),
		options: poll.options.map(option => ({
			...option,
			percent: poll.total_votes > 0 ? parseInt((option.votes / poll.total_votes) * 100) : 0,
		})),
		expired
	}
}

const pollReducer = (state = initState, action) => {

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
		case FLUSH_POLL: return { ...state, poll: {} };

		case VOTE_POLL_REQUEST: return { ...initState, poll: { ...state.poll }, loading: true };
		case VOTE_POLL_SUCCESS: return { ...initState, poll: { ...state.poll, ...transform(action.poll) } };
		case VOTE_POLL_FAILURE: return { ...initState, poll: { ...state.poll }, error: action.error, selected: state.selected };
		default: return state;
	}
}

export default pollReducer;