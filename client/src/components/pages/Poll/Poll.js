import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import CountdownTimer from '../../CountdownTimer';
// TODO : Create my own react-hashtag component
import ReactHashtag from "react-hashtag";
import { useSelector, useDispatch } from 'react-redux';

import moment from 'moment';
import axios from 'axios';
import _ from 'lodash';

import socket from '../../../store/socket';
import PollOption from '../../PollOption';
import Chip from '../../Chip';
import './Poll.css';
import { getPoll, disableVoting, votePoll, updatePoll } from '../../../store/actions/pollActions';

const _defaultId = '5f94abf7c82e940a918f7b3c';

const Poll = () => {
	// TODO : get ID from path
	const { id } = useParams();
	const [loaded, setLoaded] = useState(undefined);

	const { poll, loading, error, selected } = useSelector(state => state.poll);
	const dispatch = useDispatch();

	const handleHashTagClick = tag => console.log("TODO: redirect to search", tag);

	useEffect(() => {
		dispatch(getPoll(id));
		return () => { socket.emit("leave", `${id}`); }
	}, [loaded]);

	return (
		<>{poll && Object.keys(poll).length > 2 ?
			<div className="form-centered-container">
				<div className="form-form-wrapper poll-wrapper">
					<div className="poll-detail-wrapper">
						{poll.timeToLive ? <CountdownTimer startDate={poll.createDate} timeToLive={poll.timeToLive} onComplete={() => { dispatch(disableVoting()) }}></CountdownTimer> : null}
						<div className="poll-info">
							<h1 className='poll-title'><ReactHashtag onHashtagClick={handleHashTagClick}>{poll.title}</ReactHashtag></h1>
							<div className="form-description"><p className="poll-description">{poll.description}</p></div>
							<ul className='poll-tags'>{poll.tags.map((tag, i) => tag ? <Chip key={i}>{tag}</Chip> : null)}</ul>
							<span className="poll-total-votes">{`${poll.total_votes > 0 ? poll.total_votes : 'no'} voter${poll.total_votes != 1 ? 's' : ''}`}</span>
						</div>
					</div>
					<div className="form--mb1"></div>
					<div className="form--mb1"></div>

					{poll.options.map((option) =>
						<PollOption
							key={option.id}
							option={option}>
						</PollOption>)
					}
					{/* {options.map(option => <PollOption id={option.id} title={option.title} description={option.description} votes={option.votes} percent={option.percent} voted={option.voted}></PollOption>)} */}
					{/* <PollOption title={options[0].title} description={options[0].description} percent={options[0].percent}></PollOption>
				<PollOption title={options[1].title} description={options[1].description} percent={options[1].percent}></PollOption>
				<PollOption title={options[2].title} description={options[2].description} percent={options[2].percent}></PollOption> */}
					{error ? <div className="form-item form-item__error">{error}</div> : null}
					<div className="form-item">
						<input
							className="btn btn--tertiary form-item__submit"
							type="submit" value="Vote" onClick={() => dispatch(votePoll(id, selected))}
							disabled={selected == null || poll.voted != null || poll.expired} />
					</div>
				</div>
			</div> : <h1>{error ? error : 'Loading...'}</h1>
		}
		</>
	);

};

export default Poll;