import React, { useState, useEffect } from 'react';
import PollOption from '../../PollOption';
import moment from 'moment';
import axios from 'axios';
import { socket } from '../../../store/socket';
import Chip from '../../Chip';
import ReactHashtag from "react-hashtag";
import CountdownTimer from '../../CountdownTimer';
import './Poll.css';



const Poll = () => {
	const errors = { confirm: false };
	const [selectedOption, setSelectedOption] = useState(undefined);
	const [pollId, setPollId] = useState('5f94abf7c82e940a918f7b3c')
	const [poll, setPoll] = useState(undefined);
	const [error, setError] = useState(undefined);

	const handleHashTagClick = tag => console.log("TODO: redirect to search", tag);
	const selectOption = optionId => { setSelectedOption(optionId); }
	const voteOption = optionId => {
		if (optionId == null)
			return;

		axios.post(`https://pollstr.app/api/poll/${pollId}/vote/${pollId}`)
			.then(function (response) { console.log(response) })
			.catch(function (error) { console.log(error); setError(error); })
	};
	const disableVote = () => setPoll({ ...poll, expired: true })
	const responseToPoll = res => {
		setPoll({
			title: res.title,
			description: res.description,
			total_votes: res.total_votes,
			tags: [...res.autoTags, ...res.tags],
			createDate: res.createDate,

			options: res.options.map(option => ({ ...option, percent: parseInt((option.votes / res.total_votes) * 100) })),
			voted: res.voted,


			timeToLive: res.timeToLive,
			usersOnly: res.usersOnly,
			hideResults: res.hideResults,
			passcode: res.passcode,
		})
	}


	useEffect(() => {
		const _currentPollId = pollId;
		console.log(`useEffect - ${pollId}`);


		axios
			.get(`http://pollstr.app/api/poll/${pollId}`).then(function (response) {
				console.log(response);
				responseToPoll(response);
			})
			.catch(function (error) {
				responseToPoll({
					"timeToLive": 0,
					"hideResults": true,
					"usersOnly": false,
					"public": true,
					"autoTags": [
						"Beautiful",
						"2020",
						"amazinggf"
					],
					"tags": [
						""
					],
					"total_votes": 5,
					"title": "Catherine #Beautiful #2020 #amazinggf",
					"description": "She is very talented and sweet",
					"options": [
						{
							"votes": 3,
							"title": "Gorgeous",
							"id": "5f94abf7c82e940a918f7b3d"
						},
						{
							"votes": 2,
							"title": "Gorgeous AND Sexy",
							"id": "5f94abf7c82e940a918f7b3e"
						}
					],
					"createDate": "2020-10-24T22:34:31.812Z",
					"passcode": false,
					"id": "5f94abf7c82e940a918f7b3c",
					"voted": "5f94abf7c82e940a918f7b3e"
				});
			})

		if (socket) {
			// Subscribe to this poll
			socket.emit('join', `${_currentPollId}`);
			// Listen to this poll's updates
			socket.on(`update_${_currentPollId}`, updatedPoll => {
				console.log('received updated poll from SocketIO', updatedPoll);
			});
		}

		return () => socket.emit("leave", `update_${_currentPollId}`);
	}, [pollId]);

	console.log("selectedOption", !selectedOption)
	console.log(poll);

	return (
		<>{poll ?
			<div className="form-centered-container">
				<div className="form-form-wrapper poll-wrapper">
					<h1 className='poll-title'><ReactHashtag onHashtagClick={handleHashTagClick}>{poll.title}</ReactHashtag></h1>
					<div className="poll-detail-wrapper">
						{poll.timeToLive ? <CountdownTimer startDate={poll.createDate} timeToLive={poll.timeToLive} onComplete={disableVote}></CountdownTimer> : null}
						<div className="poll-info">
							<div className="form-description"><p className="poll-description">{poll.description}</p></div>
							<ul className='poll-tags'>{poll.tags.map(tag => tag ? <Chip>{tag}</Chip> : null)}</ul>
							<span className="poll-total-votes">{`${poll.total_votes > 0 ? poll.total_votes : 'no'} voter${poll.total_votes != 1 ? 's' : ''}`}</span>
						</div>
					</div>
					<div className="form--mb1"></div>
					<div className="form--mb1"></div>

					{poll.options.map((option) => <PollOption key={option.id} disabled={poll.voted != undefined} option={option} selectOption={selectOption} selected={selectedOption === option.id} voted={poll.voted === option.id}></PollOption>)}
					{/* {options.map(option => <PollOption id={option.id} title={option.title} description={option.description} votes={option.votes} percent={option.percent} voted={option.voted}></PollOption>)} */}
					{/* <PollOption title={options[0].title} description={options[0].description} percent={options[0].percent}></PollOption>
				<PollOption title={options[1].title} description={options[1].description} percent={options[1].percent}></PollOption>
				<PollOption title={options[2].title} description={options[2].description} percent={options[2].percent}></PollOption> */}
					{error ? <div className="form-item__error">error.message</div> : null}
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