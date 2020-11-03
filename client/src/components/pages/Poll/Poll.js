import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useModal, Modal } from 'react-morphing-modal';
import CountdownTimer from '../../CountdownTimer';
// TODO : Create my own react-hashtag component
import ReactHashtag from "react-hashtag";
import { useSelector, useDispatch } from 'react-redux';

import _ from 'lodash';

import socket from '../../../store/socket';
import PollOption from '../../PollOption';
import Chip from '../../Chip';
import './Poll.css';

import { getPoll, disableVoting, votePoll, updatePoll, flushPoll } from '../../../store/actions/pollActions';
import { modalClose, modalOpen, modalStatFade } from '../../../store/actions/modalActions';

const Poll = () => {
	// TODO : get ID from path
	const { id } = useParams();
	const [passcode, setPasscode] = useState(undefined);
	const pollWrapper = useRef();
	const passcodeInput = useRef();

	const { poll, error, selected } = useSelector(state => state.poll);

	const dispatch = useDispatch();
	const { modalProps, open, close } = useModal({
		id: 'passcode-modal',
		onClose: () => dispatch(modalClose()),
		onOpen: () => passcodeInput.current.focus(),
		background: 'rgb(0, 0, 0, 0.6)'
	});

	const handleHashTagClick = tag => console.log("TODO: redirect to search", tag);

	const handleVote = (e) => {
		e.preventDefault();

		if (poll.passcode) {
			dispatch(modalOpen());
			open(pollWrapper);
		}
		else dispatch(votePoll(id, selected))
	}

	const handlePasscode = (e) => {
		e.preventDefault();

		dispatch(votePoll(id, selected, passcode));
		setPasscode(undefined);
		dispatch(modalStatFade())
		close(pollWrapper);
	}

	useEffect(() => {
		dispatch(getPoll(id));
		return () => { socket.emit("leave", `${id}`); dispatch(flushPoll()) }
	}, [id]);

	return (
		<>{poll && Object.keys(poll).length > 2 ?
			<>
				<div className="form-centered-container">
					<div className="form-form-wrapper poll-wrapper" ref={pollWrapper}>
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
								type="submit" value="Vote" onClick={handleVote}
								disabled={selected == null || poll.voted != null || poll.expired} />
						</div>
					</div>
				</div>
				<Modal {...modalProps}>
					<div className="form-centered-container">
						<div className="form-form-wrapper">
							<h1 className='form-title'>Enter Passcode</h1>
							<form onSubmit={() => { }} formNoValidate className='form-form'>
								<div className="form-item">
									<div className='form-item-wrapper'>
										<input
											value={passcode ?? ''}
											className='form-item__input'
											type="password"
											placeholder="e.g. ********"
											name="passcode"
											formNoValidate
											onChange={(e) => setPasscode(e.target.value)}
											ref={passcodeInput} />
										<span className='form-item__input-icon'><i className="fas fa-lock"></i></span>
									</div>
								</div>
								<div className="form-item">
									<input
										disabled={!passcode || !passcode.trim()}
										onClick={handlePasscode}
										className='btn btn--tertiary form-item__submit'
										type="button" value="Vote" />
								</div>
							</form>
						</div>
					</div>
				</Modal>
			</> : <h1>{error ? error : null}</h1>
		}
		</>
	);

};

export default Poll;