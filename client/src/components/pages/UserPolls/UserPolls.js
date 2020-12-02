import React, { useState, useEffect, useRef } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';

import { getPolls, flushPolls, deletePoll, editPoll, editPollPasscode } from '../../../store/actions/managePollsActions';

import Placeholder from '../Placeholder/Placeholder';
import Poll from './Poll/Poll';
import './UserPolls.css';

import _ from 'lodash';

import _TestPolls from './_TestPolls.json';
import { setWebTitle } from '../../../utils';
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
	const [searchQuery, setSearchQuery] = useState("");
	const [disableSearch, setDisableSearch] = useState(true);
	const [ownsNothing, setOwnsNothing] = useState(false);
	const searchForm = useRef(null);
	const hasAuth = !_.isEmpty(auth);

	// Prevent API calls until authenticated/identified
	const _prevent_fetch_ = auth_loading || (!fingerprint && !hasAuth)

	// if (!ownsNothing && !_prevent_fetch_ && !polls_loading && !searchQuery && polls && Array.isArray(polls) && !polls.length)
	// 	setOwnsNothing(true);

	let noResults;
	if (!_prevent_fetch_ && !polls_loading) {
		if (searchQuery)
			noResults =
				<>
					<div className="noresult--primary">No Polls Found</div>
					<div className="noresult--secondary">Try a different filter</div>
				</>
		else
			noResults =
				<>
					<div className="noresult--primary">You have no Polls</div>
					<Link to="/polls/create" className="btn btn--primary-1 noresult--cta">Create New Poll</Link>
				</>
	}

	const submitSearch = e => {
		e.preventDefault();

		const form = searchForm.current;
		const query = form['query'].value;

		if (_prevent_fetch_ || disableSearch)
			return;

		setDisableSearch(true);
		setSearchQuery(query);
		dispatch(getPolls(query));
	}

	const onSearchChange = e => {
		e.preventDefault();

		setDisableSearch(e.target.value === searchQuery);
	}

	useEffect(() => {
		if (!_prevent_fetch_) {
			dispatch(getPolls());
			return () => { dispatch(flushPolls()) }
		}
	}, [_prevent_fetch_, dispatch]);

	useEffect(() => {
		if (polls && Array.isArray(polls)) {
			if (hasAuth && auth.firstName && typeof auth.firstName === 'string' && auth.firstName.trim())
				setWebTitle(`${auth.firstName}'s Polls (${polls.length})`);
			else setWebTitle(`Manage My Polls (${polls.length})`)
		}
		else setWebTitle("Manage My Polls (Loading...)")

	}, [polls]);

	return (
		<div className="content-fullscreen">
			<div className="content-horizontal-center pt-4">
				<form className="form-form-wrapper polls-header" onSubmit={submitSearch} ref={searchForm}>
					<div className="my-polls__search-input">
						<input
							onChange={onSearchChange}
							name="query"
							className="form-item__input form-item__input--small"
							type="text"
							placeholder="Filter Polls" />
						<button type="submit" className='form-item__input-icon my-polls__search-btn' disabled={disableSearch}>
							<i className="my-polls__search-btn--icon fas fa-search"></i>
						</button>
					</div>
				</form>
			</div>
			{!_prevent_fetch_ && !polls_loading && Array.isArray(polls) ? <>
				<div className="content-horizontal-center mt-6 user-polls">
					{
						!polls_error ?
							polls.length > 0 ?
								polls.map(poll => <Poll poll={poll} key={poll.id} />)
								:
								<div className="noresult">{noResults}</div>
							:
							<h1>{polls_error}</h1>
					}
					{/* {dbgPolls.map(poll => <Poll poll={poll} key={poll.id} />)} */}
				</div>
			</> : <Placeholder />}
		</div>
	)
}