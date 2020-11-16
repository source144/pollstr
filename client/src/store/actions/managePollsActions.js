import React from 'react';
import axios from 'axios';
import socket from '../socket';
import { toast } from 'react-toastify';
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
} from './types/managePollsTypes'

const updatePoll = (pollId, pollData) => ({ type: UPDATE_POLL, pollId, pollData });
export const flushOpErrors = () => ({ type: FLUSH_OP_ERRORS })
export const flushPolls = () => ({ type: FLUSH_POLLS })

const getPollsRequest = () => ({ type: GET_POLLS_REQUEST })
const getPollsSuccess = polls => ({ type: GET_POLLS_SUCCESS, polls })
const getPollsFailure = error => ({ type: GET_POLLS_FAILURE, error })
export const getPolls = () => {
	return (dispatch) => {
		dispatch(getPollsRequest());
		axios.get('polls/')
			.then(response => {
				const polls = response.data;
				dispatch(getPollsSuccess(polls));

				// Listen to this polls' updates
				polls.forEach(poll => {
					socket.emit('join', `${poll.id}`);
					socket.on(`update_${poll.id}`, updatedPoll => {
						dispatch(updatePoll(poll.id, updatedPoll));
					});
				})
			})
			.catch(error => {
				const errorData = error.response ? error.response.data : {};
				const errorMsg = error.response && error.response.data ? (error.response.data.message ? error.response.data.message : (typeof error.response.data.error === 'string' ? error.response.data.error : error.message)) : error.message;
				dispatch(getPollsFailure(errorMsg))
			});
	}
}

const deletePollRequest = () => ({ type: DELETE_POLL_REQUEST })
const deletePollSuccess = pollId => ({ type: DELETE_POLL_SUCCESS, pollId })
const deletePollFailure = error => ({ type: DELETE_POLL_FAILURE, error })
export const deletePoll = pollId => {
	return (dispatch) => {
		dispatch(deletePollRequest());
		axios.delete(`poll/${pollId}`)
			.then(response => {
				dispatch(deletePollSuccess(pollId));

				// Toast user
				toast(<>Poll Deleted!</>, {
					autoClose: 2000,
				})

				// Leave Poll Channel
				socket.emit("leave", `${pollId}`)
			})
			.catch(error => {
				const errorData = error.response ? error.response.data : {};
				const errorMsg = error.response && error.response.data ? (error.response.data.message ? error.response.data.message : (typeof error.response.data.error === 'string' ? error.response.data.error : error.message)) : error.message;
				dispatch(deletePollFailure(errorMsg))

				// Toast user
				toast.error(<><strong>Oops!</strong> {errorMsg}</>, {
					autoClose: 5000,
				})
			});
	}
}

const editPollRequest = () => ({ type: EDIT_POLL_REQUEST })
const editPollSuccess = (pollId, pollData) => ({ type: EDIT_POLL_SUCCESS, pollId, pollData })
const editPollFailure = error => ({ type: EDIT_POLL_FAILURE, error })
export const editPoll = (pollId, pollData) => {
	return (dispatch) => {
		dispatch(editPollRequest());
		axios.put(`poll/${pollId}`, pollData)
			.then(response => {
				dispatch(editPollSuccess(pollId, pollData));

				// Toast user
				toast(<>Poll Saved!</>, {
					autoClose: 2000,
				})
			})
			.catch(error => {
				const errorData = error.response ? error.response.data : {};
				const errorMsg = error.response && error.response.data ? (error.response.data.message ? error.response.data.message : (typeof error.response.data.error === 'string' ? error.response.data.error : error.message)) : error.message;
				dispatch(editPollFailure(errorMsg))

				// Toast user
				toast.error(<><strong>Oops!</strong> {errorMsg}</>, {
					autoClose: 5000,
				})
			});
	}
}
const editPollPasscodeRequest = () => ({ type: EDIT_POLL_PASSCODE_REQUEST })
const editPollPasscodeSuccess = (pollId, passcode) => ({ type: EDIT_POLL_PASSCODE_SUCCESS, pollId, passcode })
const editPollPasscodeFailure = error => ({ type: EDIT_POLL_PASSCODE_FAILURE, error })
export const editPollPasscode = (pollId, passcode) => {
	return (dispatch) => {
		dispatch(editPollPasscodeRequest());
		axios.put(`poll/${pollId}/passcode`, { passcode })
			.then(response => {
				dispatch(editPollPasscodeSuccess(pollId, !!passcode));

				// Toast user
				toast(<>Passcode {!!passcode ? 'Updated' : 'Removed'}!</>, {
					autoClose: 2000,
				})
			})
			.catch(error => {
				const errorData = error.response ? error.response.data : {};
				const errorMsg = error.response && error.response.data ? (error.response.data.message ? error.response.data.message : (typeof error.response.data.error === 'string' ? error.response.data.error : error.message)) : error.message;
				dispatch(editPollPasscodeFailure(errorMsg))
			});
	}
}