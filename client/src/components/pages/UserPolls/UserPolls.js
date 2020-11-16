import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { getPolls, flushPolls, deletePoll, editPoll, editPollPasscode } from '../../../store/actions/managePollsActions';

import Placeholder from '../Placeholder/Placeholder';
import Poll from './Poll/Poll';
import './UserPolls.css';

import _ from 'lodash';

import _TestPolls from './_TestPolls.json';
const dbgPolls = _TestPolls.slice(0, Math.min(5, _TestPolls.length))
	.map(poll => ({
		...poll, options: poll.options.map(
			option => ({ ...option, percent: poll.total_votes > 0 ? parseInt((option.votes / poll.total_votes) * 100) : 0 })
		)
	}))
console.log(dbgPolls);

export default () => {

	const dispatch = useDispatch();
	const { polls, loading: polls_loading, error: polls_error } = useSelector(state => state.polls);
	const { auth, global_loading: auth_loading, fingerprint } = useSelector(state => state.auth);
	const hasAuth = !_.isEmpty(auth);

	// Prevent API calls until authenticated/identified
	const _prevent_fetch_ = auth_loading || (!fingerprint && !hasAuth)


	useEffect(() => {
		if (!_prevent_fetch_) {
			dispatch(getPolls());
			return () => { dispatch(flushPolls()) }
		}
	}, [_prevent_fetch_, dispatch]);

	return (
		<div className="content-fullscreen">
			{!_prevent_fetch_ && !polls_loading && Array.isArray(polls) ? <>
				<div className="content-horizontal-center pt-4">
					<header className="form-form-wrapper polls-header">
						<h1>Your Polls</h1>
						<div className="my-polls__search">
							<div className="my-polls__search-input">
								<input
									className="form-item__input form-item__input--small"
									type="text"
									placeholder="Filter Polls" />
								<span className='form-item__input-icon'><i className="fas fa-search"></i></span>
							</div>
							<div className="my-polls__search-filters">
								<label htmlFor="guests">Guests</label>
								<input name="guests" type="checkbox" />
							</div>
						</div>
					</header>
				</div>
				<div className="content-horizontal-center mt-6 user-polls">
					{
						!polls_error ?
							polls.length > 0 ?
								polls.map(poll => <Poll poll={poll} key={poll.id} />)
								:
								<h1>Oops. Couldn't find any polls!</h1>
							:
							<h1>{polls_error}</h1>
					}
					{/* {dbgPolls.map(poll => <Poll poll={poll} key={poll.id} />)} */}
				</div>
			</> : <Placeholder />}
		</div>
	)
}