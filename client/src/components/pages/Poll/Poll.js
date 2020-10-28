import React, { useState, useEffect } from 'react';
import PollOption from '../../PollOption';
import moment from 'moment';
import axios from 'axios';
import { socket } from '../../../store/socket';
import Chip from '../../Chip';
import ReactHashtag from "react-hashtag";
import CountdownTimer from '../../CountdownTimer';
import _ from 'lodash';
import './Poll.css';

axios.defaults.baseURL = 'http://pollstr-app.herokuapp.com/api/';
// axios.defaults.baseURL = 'https://pollstr.app/api/';
// axios.defaults.baseURL = 'http://localhost:5000/api/';


const Poll = () => {
	const errors = { confirm: false };
	const [selectedOption, setSelectedOption] = useState(undefined);
	const [pollId, setPollId] = useState('5f94abf7c82e940a918f7b3c')
	const [poll, setPoll] = useState(undefined);
	const [error, setError] = useState(undefined);

	const handleHashTagClick = tag => console.log("TODO: redirect to search", tag);
	const selectOption = optionId => { setSelectedOption(optionId); }
	const handleUpdate = update => { setPoll({ ...poll, ...update }) };
	const voteOption = optionId => {
		if (optionId == null)
			return;

		axios.post(`poll/${pollId}/vote/${selectedOption}`)
			.then(function (response) {
				const _options = poll.options.map(option => ({
					...option,
					votes: option.id == selectedOption ? option.votes + 1 : option.votes
				}))
				const _poll = {
					...poll,
					options: _options,
					total_votes: poll.total_votes + 1,
					voted: selectedOption
				};
				setPoll(responseToPoll(_poll));
			})
			.catch(function (error) {
				console.log(error.response.data);
				setError(error.response.data);
			})

	};
	const disableVote = () => setPoll({ ...poll, expired: true })
	const responseToPoll = res => {
		return { ...res, tags: _.uniq([...(res.autoTags || []), ...(res.tags || [])]), options: res.options.map(option => ({ ...option, percent: parseInt((option.votes / res.total_votes) * 100) })) };
	};


	useEffect(() => {
		const _currentPollId = pollId;
		console.log(`useEffect - ${pollId}`);


		axios
			.get(`poll/${pollId}`).then(function (response) {
				console.log("Got response from Backend", response);
				const _poll = responseToPoll(response.data);
				setPoll(_poll);

				// Listen to this poll's updates
				socket.on(`update_${_currentPollId}`, updatedPoll => {
					console.log('[SocketIO] received updated poll from SocketIO', updatedPoll);
					console.log('[SocketIO] Poll in memory:', _poll);
					setPoll(responseToPoll({ ..._poll, ...updatedPoll }));
				});
			})
			.catch(function (error) {
				console.log('Caught error', error);
			})

		if (socket) {
			// Subscribe to this poll
			socket.emit('join', `${_currentPollId}`);
		}

		return () => socket.emit("leave", `update_${_currentPollId}`);
	}, [pollId]);

	return (
		<>{poll ?
			<div className="form-centered-container">
				<div className="form-form-wrapper poll-wrapper">
					<div className="poll-detail-wrapper">
						{poll.timeToLive ? <CountdownTimer startDate={poll.createDate} timeToLive={poll.timeToLive} onComplete={disableVote}></CountdownTimer> : null}
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
							disabled={poll.voted != undefined || poll.expired}
							option={option} selectOption={selectOption}
							selected={selectedOption === option.id}
							voted={poll.voted === option.id}
							showResult={!poll.hideResults || !poll.expired}>
						</PollOption>)
					}
					{/* {options.map(option => <PollOption id={option.id} title={option.title} description={option.description} votes={option.votes} percent={option.percent} voted={option.voted}></PollOption>)} */}
					{/* <PollOption title={options[0].title} description={options[0].description} percent={options[0].percent}></PollOption>
				<PollOption title={options[1].title} description={options[1].description} percent={options[1].percent}></PollOption>
				<PollOption title={options[2].title} description={options[2].description} percent={options[2].percent}></PollOption> */}
					{error ? <div className="form-item__error">{error.message}</div> : null}
					<div className="form-item">
						<input
							className={`btn btn--tertiary form-item__submit ${!!errors.confirm ? 'form-item__input--err' : ''}`}
							type="submit" value="Vote" onClick={() => voteOption(selectedOption)}
							disabled={selectedOption == null || poll.voted != null || poll.expired} />
					</div>
				</div>
			</div> : <h1>{error ? error.message : 'Loading...'}</h1>}
		</>
	);

};

export default Poll;