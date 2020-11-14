import React from 'react';
import Poll from './Poll/Poll';
import './UserPolls.css';

import _TestPolls from './_TestPolls.json';
const dbgPolls = _TestPolls.slice(0, Math.min(5, _TestPolls.length))
	.map(poll => ({...poll, options: poll.options.map(
		option => ({...option, percent: poll.total_votes > 0 ? parseInt((option.votes / poll.total_votes) * 100) : 0})
	)}))
console.log(dbgPolls);

export default () => {
	return (
		<>
			<div className="content-fullscreen">
				<div className="content-horizontal-center mt-4">
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
					{dbgPolls.map(poll => <Poll poll={poll} key={poll.id} />)}
				</div>
			</div>
		</>
	)
}