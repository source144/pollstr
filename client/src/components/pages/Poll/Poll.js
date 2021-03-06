import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useModal, Modal } from 'react-morphing-modal';
import CountdownTimer from '../../CountdownTimer';
// TODO : Create my own react-hashtag component
import ReactHashtag from "react-hashtag";
import { useSelector, useDispatch } from 'react-redux';
import { ImpulseSpinner } from 'react-spinners-kit'
import QRCode from 'qrcode.react';

import moment from 'moment';

import useWindowDimension from '../../util/useWindowDimension'
import socket from '../../../store/socket';
import Placeholder from '../Placeholder/Placeholder';
import PollOption from '../../PollOption';
import Chip from '../../Chip';
import SharePoll from '../../SharePoll/SharePoll';
import './Poll.css';


import { getPoll, disableVoting, votePoll, flushPoll } from '../../../store/actions/pollActions';
import { modalClose, modalOpen, modalStatFade } from '../../../store/actions/modalActions';
import { setWebTitle } from '../../../utils';

// TODO : probably not gonna use this
const __poll_placeholder = (() => {
	const poll = {
		timeToLive: 900,
		title: "Loading...",
		description: "Please wait...",
		createDate: moment().subtract({ minutes: 3 }).toString(),
		tags: ['loading', 'patience'],
		total_votes: 37,
		options: [
			{ id: 11, title: "Loading..", percent: 73, votes: 27 },
			{ id: 22, title: "Please wait..", percent: 27, votes: 10 }
		]
	}

	return (
		<div className="form-form-wrapper poll-wrapper">
			<div className="poll-detail-wrapper">
				<CountdownTimer startDate={poll.createDate} timeToLive={poll.timeToLive}></CountdownTimer>
				<div className="poll-info">
					<h1 className='poll-title'><ReactHashtag>{poll.title}</ReactHashtag></h1>
					<div className="form-description"><p className="poll-description">{poll.description}</p></div>
					<ul className='poll-tags'>{poll.tags.map((tag, i) => tag ? <Chip key={i}>{tag}</Chip> : null)}</ul>
					<span className="poll-total-votes">{poll.total_votes} voters</span>
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
			<div className="form-item">
				<input
					className="btn btn--tertiary form-item__submit"
					type="button" value="Vote" disabled />
			</div>
		</div>
	)
});


const Poll = () => {
	// TODO : Use a global state from AppContext
	const { width } = useWindowDimension();
	const isMobile = width <= 600;

	// TODO : get ID from path
	const { id } = useParams();
	const [modalContent, setModalContent] = useState(undefined);
	const [minimized, setMinimized] = useState(false);
	const [passcode, setPasscode] = useState(undefined);
	const pollWrapper = useRef();
	const passcodeInput = useRef();

	const { poll, error, selected, loading: poll_loading, voting: isVoting } = useSelector(state => state.poll);
	const { global_loading: auth_loading, fingerprint } = useSelector(state => state.auth);

	// Prevent API calls until authenticated/identified
	const _prevent_fetch_ = auth_loading || !fingerprint

	const dispatch = useDispatch();
	const { modalProps, open, close } = useModal({
		id: 'passcode-modal',
		onClose: () => dispatch(modalClose(pollWrapper)),
		onOpen: () => { if (passcodeInput && passcodeInput.current) passcodeInput.current.focus() },
		background: 'rgb(0, 0, 0, 0.6)'
	});

	const handleHashTagClick = tag => console.log("TODO: redirect to search", tag);

	const handleVote = (e) => {
		e.preventDefault();
		if (!poll) return;

		if (poll.passcode) {
			setModalContent("PASSCODE");
			dispatch(modalOpen(pollWrapper));
			open(pollWrapper);
		}
		else dispatch(votePoll(id, selected))
	}

	const handlePasscode = (e) => {
		e.preventDefault();
		if (!poll) return;

		dispatch(votePoll(id, selected, passcode));
		setPasscode(undefined);
		dispatch(modalStatFade())
		close(pollWrapper);
	}

	const handleShare = (e) => {
		e.preventDefault();
		if (!poll) return;

		setModalContent("QR");
		dispatch(modalOpen(pollWrapper));
		open(pollWrapper);
	}

	// TODO : useEffect for error to display error toasts
	// Fetch poll ONLY after 
	// identifying user/guest
	useEffect(() => {
		if (!_prevent_fetch_) {
			dispatch(getPoll(id));
			return () => { socket.emit("leave", `${id}`); dispatch(flushPoll()) }
		}
	}, [id, _prevent_fetch_, dispatch]);

	useEffect(() => {
		if (poll && poll.title) {
			const tagsString = !poll.tags ? '' : (typeof poll.tags === 'string' ? poll.tags : poll.tags.filter(tag => tag.trim() != '').join(' - '));
			const tagsFormatted = tagsString && tagsString.trim() ? ` (${tagsString})` : '';

			setWebTitle(`${poll.title}${tagsFormatted}`);
		}
		else setWebTitle("Loading Poll...")

	}, [poll]);

	const _passcodeModal = <div className="form-centered-container">
		<div className="form-form-wrapper">
			<h1 className='form-title'>Enter Passcode</h1>
			<form onSubmit={handlePasscode} formNoValidate className='form-form'>
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

	const _QRModal = <SharePoll poll={poll} />

	let _modal_content;
	switch (modalContent) {
		case "PASSCODE": _modal_content = _passcodeModal; break;
		case "QR": _modal_content = _QRModal; break;
		default: _modal_content = undefined; break;
	}

	return (
		<>
			<div className="form-centered-container">
				{!_prevent_fetch_ && !poll_loading && poll && Object.keys(poll).length > 2 ?
					<div className="form-form-wrapper poll-wrapper" ref={pollWrapper}>
						<div className="poll-detail-wrapper" style={isMobile && poll.timeToLive ? { padding: "2rem" } : {}}>
							{!poll.timeToLive ? undefined :
								<CountdownTimer
									onComplete={() => { dispatch(disableVoting()) }}
									startDate={poll.createDate}
									timeToLive={poll.timeToLive} />}
							<div className="poll-info">
								<h1 className='poll-title' style={isMobile && !poll.timeToLive ? { fontSize: '2.5rem' } : {}}><ReactHashtag onHashtagClick={handleHashTagClick}>{poll.title}</ReactHashtag></h1>
								<div className="form-description" style={isMobile && !poll.timeToLive ? { fontSize: '1.8rem' } : {}}><p className="poll-description">{poll.description}</p></div>
								<ul className='poll-tags'>{poll.tags.map((tag, i) => tag ? <Chip key={i}>{tag}</Chip> : null)}</ul>
								<span className="poll-total-votes">{`${poll.total_votes > 0 ? poll.total_votes : 'no'} voter${poll.total_votes != 1 ? 's' : ''}`}</span>
							</div>
							<div className="poll-actions">

								{poll.passcode ? <div className="poll-action poll-action--passcode poll-action--no-active-style">
									<i className="fas fa-lock"></i>
								</div> : undefined}
								<div className="poll-action poll-action--share" onClick={handleShare}>
									<i className="fas fa-link"></i>
								</div>
								{/* <div className="poll-action poll-action--share" onClick={() => { }}>
								<i className="fas fa-share-alt"></i>
							</div> */}
								{/* <div className="poll-action poll-action--edit" onClick={() => { }}>
									<i className="fas fa-pencil-alt"></i>
								</div>
								<div className="poll-action poll-action--delete" onClick={() => { }}>
									<i className="fas fa-trash-alt"></i>
								</div>
								<div className="poll-action poll-action--minimize" onClick={() => setMinimized(!minimized)}>
									{minimized ? <i className="fas fa-chevron-down"></i> : <i className="fas fa-chevron-up"></i>}
								</div> */}
							</div>
						</div>
						<div className="poll-body">
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
								<button
									className="btn btn--tertiary form-item__submit form-item__submit--center-content"
									type="submit" onClick={handleVote}
									disabled={selected == null || poll.voted != null || poll.expired || isVoting}>
									{isVoting ? <ImpulseSpinner backColor={'#55c57a'} /> : "Vote"}
								</button>
							</div>
						</div>

						<Modal {...modalProps}>
							{_modal_content}
						</Modal>
					</div>
					// : error ? <h1>{error}</h1> : <div style={{ height: "100%", width: "100%" }}></div>
					: error ? <h1>{error}</h1> : <Placeholder />
					// : error ? <h1>{error}</h1> : <__poll_placeholder />
					// __poll_placeholder()
				}

			</div>
		</>
	);

};

export default Poll;