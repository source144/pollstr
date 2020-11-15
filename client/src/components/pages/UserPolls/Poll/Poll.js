import React, { useState, useEffect, useRef } from 'react';
import { useModal, Modal } from 'react-morphing-modal';
import CountdownTimer from '../../../CountdownTimer';
// TODO : Create my own react-hashtag component
import ReactHashtag from "react-hashtag";
import AnimateHeight from 'react-animate-height';
import { useSelector, useDispatch } from 'react-redux';

import useWindowDimension from '../../../util/useWindowDimension'
import PollOption from '../../../PollOption';
import Chip from '../../../Chip';
import SharePoll from '../../../SharePoll/SharePoll';

import { modalClose, modalOpen, modalStatFade } from '../../../../store/actions/modalActions';
import EditPoll from '../../../EditPoll/EditPoll';

const error = undefined;
const selected = undefined;

const Poll = ({ poll }) => {
	const { width } = useWindowDimension();
	const isMobile = width <= 600;

	const [modalContent, setModalContent] = useState(undefined);
	const [minimized, setMinimized] = useState(false);
	const [passcode, setPasscode] = useState(undefined);
	const pollWrapper = useRef();

	const dispatch = useDispatch();

	const { modalProps, open, close } = useModal({
		id: `poll-${poll.id}-modal`,
		onClose: () => dispatch(modalClose(pollWrapper)),
		background: 'rgb(0, 0, 0, 0.6)'
	});

	const handleHashTagClick = tag => console.log("TODO: redirect to search", tag);

	const handleVote = (e) => {
		e.preventDefault();

	}

	const handleOpenModal = (e, modalFor) => {
		if (e) e.preventDefault();

		setModalContent(modalFor)
		dispatch(modalOpen(pollWrapper));
		open(pollWrapper);
	}


	const handlePasscode = (e) => {
		e.preventDefault();

		dispatch(modalStatFade())
		close(pollWrapper);
	}

	const _deleteModal = <div className="form-centered-container form-centered-container--auto-height">
		<div className="form-form-wrapper">
			<h1 className='form-title'>Delete Poll</h1>
			<form onSubmit={() => { }} formNoValidate className='form-form'>
				<div className="form-item" style={{ fontSize: '14px' }}>
					Are you sure you want to delete this poll?
				</div>
				<div className="form-item">
					<input
						// TODO : Disabled when deleting..
						// onClick={handleDelete}
						onClick={() => { }}
						className='btn btn--danger form-item__submit'
						style={{ marginTop: 0 }}
						type="button" value="DELETE" />
				</div>
			</form>
		</div>
	</div>

	const _editPasscodeModal = <div className="form-centered-container form-centered-container--auto-height">
		<div className="form-form-wrapper">
			<h1 className='form-title'>{poll.passcode ? "Modify Passcode" : "Add Passcode"}</h1>
			<form onSubmit={(e) => { e.preventDefault(); console.log("EDIT PASSCODE") }} formNoValidate className='form-form'>
				<div className="form-item">
					<div className='form-item-wrapper'>


						<input
							value={passcode ?? ''}
							className='form-item__input'
							type="password"
							// placeholder="Remove Passcode"
							placeholder="e.g. *******"
							name="passcode"
							formNoValidate
							onChange={(e) => setPasscode(e.target.value)} />
						<span className='form-item__input-icon'><i className="fas fa-lock"></i></span>
						{poll.passcode ? <label htmlFor="passcode" style={{ flexDirection: "column" }}>
							<span style={{
								alignSelf: 'flex-end',
								fontStyle: "italic",
								fontSize: "1rem"
							}}>(leave empty to remove passcode)</span>
						</label> : undefined}
					</div>
				</div>
				<div className="form-item">
					<input
						onClick={(e) => { e.preventDefault(); console.log("EDIT PASSCODE") }}
						className='btn btn--tertiary form-item__submit'
						type="button" value="Save" />
				</div>
			</form>
		</div>
	</div>

	let _modal_content;
	switch (modalContent) {
		case "PASSCODE": _modal_content = _editPasscodeModal; break;
		case "DELETE": _modal_content = _deleteModal; break;
		case "EDIT": _modal_content = <EditPoll poll={poll} />; break;
		case "QR": _modal_content = <SharePoll poll={poll} />; break;
		default: _modal_content = undefined; break;
	}
	// TODO : useEffect for error to display error toasts

	return (
		<>
			{/* TODO : Minimize & and & Expand Buttons on top right */}
			{/* TODO : -------------------------------------------- */}
			{/* TODO : for minimize can use max-height: 100% */}
			{/* TODO : on state change, add a class with max-height: 0% */}
			{/* TODO : example at https://stackoverflow.com/a/49517490/9382757 */}
			{/* TODO : Or... BETTER: */}
			{/* TODO : https://www.npmjs.com/package/react-animate-height*/}
			{/* TODO : ------------------------------------------------------- */}
			{/* TODO : Remove "vote" button */}
			{/* TODO : Add "Edit" and "Delete" buttons?? */}

			{poll && Object.keys(poll).length > 2 ?
				<div className="form-form-wrapper poll-wrapper" ref={pollWrapper}>
					<div className="poll-detail-wrapper" style={isMobile && poll.timeToLive ? { padding: "2rem" } : {}}>
						{!poll.timeToLive ? undefined :
							<CountdownTimer
								onComplete={() => {/* TODO : disable editing?? */ }}
								startDate={poll.createDate}
								timeToLive={poll.timeToLive} />}
						<div className="poll-info">
							<h1 className='poll-title' style={isMobile && !poll.timeToLive ? { fontSize: '2.5rem' } : {}}><ReactHashtag onHashtagClick={handleHashTagClick}>{poll.title}</ReactHashtag></h1>
							<div className="form-description" style={isMobile && !poll.timeToLive ? { fontSize: '1.8rem' } : {}}><p className="poll-description">{poll.description}</p></div>
							<ul className='poll-tags'>{poll.tags.map((tag, i) => tag ? <Chip key={i}>{tag}</Chip> : null)}</ul>
							<span className="poll-total-votes">{`${poll.total_votes > 0 ? poll.total_votes : 'no'} voter${poll.total_votes != 1 ? 's' : ''}`}</span>
						</div>
						<div className="poll-actions">
							<div className="poll-action poll-action--share" onClick={e => handleOpenModal(e, "QR")}>
								<i className="fas fa-link"></i>
							</div>
							{/* <div className="poll-action poll-action--share" onClick={() => { }}>
								<i className="fas fa-share-alt"></i>
							</div> */}
							<div className="poll-action poll-action--edit" onClick={e => handleOpenModal(e, "EDIT")}>
								<i className="fas fa-pencil-alt"></i>
							</div>
							<div className="poll-action poll-action--passcode" onClick={e => handleOpenModal(e, "PASSCODE")}>
								{poll.passcode ? <i className="fas fa-lock"></i> : <i className="fas fa-unlock"></i>}
							</div>
							<div className="poll-action poll-action--delete" onClick={e => handleOpenModal(e, "DELETE")}>
								<i className="fas fa-trash-alt"></i>
							</div>
							<div className="poll-action poll-action--minimize" onClick={() => setMinimized(!minimized)}>
								{minimized ? <i className="fas fa-chevron-down"></i> : <i className="fas fa-chevron-up"></i>}
							</div>
						</div>
					</div>
					<AnimateHeight
						duration={500}
						height={minimized ? 0 : 'auto'}
						className="poll-body"
					>
						<div className="form--mb1"></div>
						<div className="form--mb1"></div>

						{/* TODO : Poll options without selection, etc. */}
						{poll.options.map((option) =>
							<PollOption
								key={option.id}
								option={option}
								interactable={false}>
							</PollOption>)
						}
						{error ? <div className="form-item form-item__error">{error}</div> : null}

						{/* TODO : Edit/Delete Buttons ?? */}

					</AnimateHeight>

					{/* TODO : Edit / or / Stats Modal */}
					{/* TODO : use the Create Poll Form, with disabled fields */}

					<Modal {...modalProps}>
						{_modal_content}
					</Modal>

					{/* TODO : modal for "are you sure you want to delete"? */}
				</div>

				// TODO : no need for placeholder component here
				// TODO : Display error nicer ??
				// TODO : on loading have loading modal on top of component
				: error ? <h1>{error}</h1> : <h3>PLACE-HOLDER</h3>
			}


		</>
	);

};

export default Poll;