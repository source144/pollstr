import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useModal, Modal } from 'react-morphing-modal';
import CountdownTimer from '../../../CountdownTimer';
// TODO : Create my own react-hashtag component
import ReactHashtag from "react-hashtag";
import AnimateHeight from 'react-animate-height';
import QRCode from 'qrcode.react';
import { useSelector, useDispatch } from 'react-redux';

import moment from 'moment';

import useWindowDimension from '../../../util/useWindowDimension'
import PollOption from '../../../PollOption';
import Chip from '../../../Chip';
import SharePoll from '../../../SharePoll/SharePoll';


import { modalClose, modalOpen, modalStatFade } from '../../../../store/actions/modalActions';

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

	const _deleteModal = <div className="form-centered-container">
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

	// const _editModal = (<>
	// 	<h1 className='form-title'>Create Poll</h1>
	// 	<div onSubmit={handleSubmit} formNoValidate className='form-form'>
	// 		{isMobile ?
	// 			// --------------- //
	// 			//   Mobile View   //
	// 			// --------------- //
	// 			<>
	// 				{/* General Information */}
	// 				<div className="form-item">
	// 					<label htmlFor="title">Poll Title</label>
	// 					<div className='form-item-wrapper'>
	// 						<HashtagTextArea
	// 							className="form-item__input"
	// 							tagClass="form-item__input--hashtag"
	// 							onChange={handleTitle}
	// 							singleline={true}
	// 							disabled
	// 						/>
	// 					</div>
	// 					{!!errors.title ? <span className='form-item__error'>{errors.title}</span> : null}
	// 				</div>
	// 				<div className="form-item">
	// 					<label htmlFor="description">Description</label>
	// 					{/* <div className='form-item-wrapper'> */}
	// 					<HashtagTextArea
	// 						className={`form-item__input form-item__input--textarea ${!!errors.description ? 'form-item__input--err' : ''}`}
	// 						placeholder="(No description)"
	// 						tagClass="form-item__input--hashtag"
	// 						newlines={true}
	// 						onChange={handleDescription}
	// 						disabled
	// 					/>
	// 					{/* </div> */}
	// 					{!!errors.description ? <span className='form-item__error'>{errors.description}</span> : null}
	// 				</div>

	// 				{/* Poll Options */}

	// 				<div className="form-item">
	// 					<label>Options</label>
	// 					{options.map((option, index) => {
	// 						return (
	// 							<div key={"option-" + index}>
	// 								<Option
	// 									id={option.id}
	// 									index={index}
	// 									deleteable={false}
	// 									onChange={onOptionChange}
	// 									onDelete={onOptionDelete}
	// 									value={option.value}
	// 									disabled
	// 								/>
	// 							</div>)
	// 					})}

	// 				</div>
	// 				<div className="poll__add-option">
	// 					<button className="btn btn--primary" onClick={onOptionAdd}><i className="fas fa-plus-circle"></i></button>
	// 				</div>

	// 				{/* Expiry and Poll Settings */}
	// 				<div className="form-item form-item--no-margin form--mb1">
	// 					<label htmlFor="expire" className='rw-datepicker-label'>Expire Date</label>
	// 					<DateTimePicker
	// 						min={new Date()}
	// 						onChange={date => setExpireDate(date)}
	// 						step={5}
	// 						timeCaption="time"
	// 						placeholder="No Exipiry Set"
	// 					/>
	// 				</div>
	// 				<div className="form-item">
	// 					<label htmlFor="passcode">Passcode</label>
	// 					<p className="optional">Require a passcode for every vote</p>
	// 					<div className='form-item-wrapper'>
	// 						<input
	// 							className={`form-item__input ${!!errors.passcode ? 'form-item__input--err' : ''}`}
	// 							type="password"
	// 							placeholder="e.g. *******"
	// 							name="passcode"
	// 							formNoValidate
	// 							onChange={handlePasscode} />
	// 						<span className='form-item__input-icon'><i className="fas fa-passcode"></i></span>
	// 					</div>
	// 					{!!errors.passcode ? <span className='form-item__error'>{errors.passcode}</span> : null}
	// 				</div>
	// 				<div className="form-item">
	// 					<label htmlFor="tags">Tags</label>
	// 					<div className='form-item-wrapper'>
	// 						<input
	// 							className={`form-item__input ${!!errors.tags ? 'form-item__input--err' : ''}`}
	// 							type="text"
	// 							placeholder="e.g. #Food #Health"
	// 							name="tags"
	// 							formNoValidate
	// 							onChange={handleTags} />
	// 						<span className='form-item__input-icon'><i className="fas fa-tags"></i></span>
	// 					</div>
	// 					{!!errors.tags ? <span className='form-item__error'>{errors.tags}</span> : null}
	// 				</div>
	// 				<div className="form-item form-item--row">
	// 					<label className="form-item__multiline-label" htmlFor="resultsHidden" onClick={() => setResultsHidden(!resultsHidden)}>
	// 						<span className="form-item__multiline-label-title">Hidden Results</span>
	// 						<span className="form-item__multiline-label-description">Visible only after voting?</span>
	// 					</label>
	// 					<Switch
	// 						checked={resultsHidden}
	// 						onChange={() => setResultsHidden(!resultsHidden)}
	// 						name="resultsHidden"
	// 					/>
	// 				</div>
	// 				<div className="form-item form-item--row">
	// 					<label className="form-item__multiline-label" htmlFor="allowGuests" onClick={() => !isLoggedIn ? setResultsHidden(!allowGuests) : undefined}>
	// 						<span className="form-item__multiline-label-title">Guest Votes</span>
	// 						<span className="form-item__multiline-label-description">Can guests vote?</span>
	// 					</label>
	// 					<Switch
	// 						checked={allowGuests}
	// 						onChange={() => setAllowGuests(!allowGuests)}
	// 						name="allowGuests"
	// 						disabled={!isLoggedIn}
	// 					/>
	// 				</div>
	// 				<div className="form-item form-item--row">
	// 					<label className="form-item__multiline-label" htmlFor="publicPoll" onClick={() => setPublicPoll(!publicPoll)}>
	// 						<span className="form-item__multiline-label-title">Public Poll</span>
	// 						<span className="form-item__multiline-label-description">Should the poll be featured?</span>
	// 					</label>
	// 					<Switch
	// 						checked={publicPoll}
	// 						onChange={() => setPublicPoll(!publicPoll)}
	// 						name="publicPoll"
	// 					/>
	// 				</div>

	// 			</>
	// 			:
	// 			// ---------------- //
	// 			//   Desktop View   //
	// 			// ---------------- //
	// 			<>
	// 				<div className='form-section'>
	// 					<div className="form-section-item w-60">
	// 						<div className="form-item">
	// 							<label htmlFor="title" className="required">Poll Title</label>
	// 							<div className='form-item-wrapper'>
	// 								<HashtagTextArea
	// 									className={`form-item__input ${!!errors.title ? 'form-item__input--err' : ''}`}
	// 									placeholder="e.g. Apples or Bananas? #Fruit"
	// 									tagClass="form-item__input--hashtag"
	// 									onChange={handleTitle}
	// 									singleline={true}
	// 								/>
	// 							</div>
	// 							{!!errors.title ? <span className='form-item__error'>{errors.title}</span> : null}
	// 						</div>
	// 						<div className="form-item">
	// 							<label htmlFor="description">Description</label>
	// 							<div className='form-item-wrapper'>
	// 								<HashtagTextArea
	// 									className={`form-item__input form-item__input--textarea ${!!errors.description ? 'form-item__input--err' : ''}`}
	// 									placeholder="e.g. Let's settle this once and for all! Which #fruit is better? Apples or Bananas?"
	// 									tagClass="form-item__input--hashtag"
	// 									newlines={true}
	// 									onChange={handleDescription}
	// 								/>
	// 							</div>
	// 							{!!errors.description ? <span className='form-item__error'>{errors.description}</span> : null}
	// 						</div>
	// 						<div className="form-item">
	// 							<label htmlFor="tags">Tags</label>
	// 							<div className='form-item-wrapper'>
	// 								<input
	// 									className={`form-item__input ${!!errors.tags ? 'form-item__input--err' : ''}`}
	// 									type="text"
	// 									placeholder="e.g. #Food #Health"
	// 									name="tags"
	// 									formNoValidate
	// 									onChange={handleTags} />
	// 								<span className='form-item__input-icon'><i className="fas fa-tags"></i></span>
	// 							</div>
	// 							{!!errors.tags ? <span className='form-item__error'>{errors.tags}</span> : null}
	// 						</div>
	// 					</div>

	// 					<div className="form-section-item w-40">
	// 						<div className="form-item">
	// 							<label htmlFor="passcode">Passcode</label>
	// 							<div className='form-item-wrapper'>
	// 								<input
	// 									className={`form-item__input ${!!errors.passcode ? 'form-item__input--err' : ''}`}
	// 									type="password"
	// 									placeholder="e.g. *******"
	// 									name="passcode"
	// 									formNoValidate
	// 									onChange={handlePasscode} />
	// 								<span className='form-item__input-icon'><i className="fas fa-passcode"></i></span>
	// 							</div>
	// 							{!!errors.passcode ? <span className='form-item__error'>{errors.passcode}</span> : null}
	// 						</div>
	// 						<div className="form-item form-item--no-margin form--mb1">
	// 							<label htmlFor="expire" className='rw-datepicker-label'>Expire Date</label>
	// 							<DateTimePicker
	// 								min={new Date()}
	// 								onChange={date => setExpireDate(date)}
	// 								step={5}
	// 								timeCaption="time"
	// 								placeholder="No Exipiry Set"
	// 							/>
	// 						</div>
	// 						<div className="form-item form-item--row">
	// 							<label className="form-item__multiline-label" htmlFor="resultsHidden" onClick={() => setResultsHidden(!resultsHidden)}>
	// 								<span className="form-item__multiline-label-title">Hidden Results</span>
	// 								<span className="form-item__multiline-label-description">Visible only after voting?</span>
	// 							</label>
	// 							<Switch
	// 								checked={resultsHidden}
	// 								onChange={() => setResultsHidden(!resultsHidden)}
	// 								name="resultsHidden"
	// 							/>
	// 						</div>
	// 						<div className="form-item form-item--row">
	// 							<label className="form-item__multiline-label" htmlFor="allowGuests" onClick={() => !isLoggedIn ? setResultsHidden(!allowGuests) : undefined}>
	// 								<span className="form-item__multiline-label-title">Guest Votes</span>
	// 								<span className="form-item__multiline-label-description">Can guests vote?</span>
	// 							</label>
	// 							<Switch
	// 								checked={allowGuests}
	// 								onChange={() => setAllowGuests(!allowGuests)}
	// 								name="allowGuests"
	// 								disabled={!isLoggedIn}
	// 							/>
	// 						</div>
	// 						<div className="form-item form-item--row">
	// 							<label className="form-item__multiline-label" htmlFor="publicPoll" onClick={() => setPublicPoll(!publicPoll)}>
	// 								<span className="form-item__multiline-label-title">Public Poll</span>
	// 								<span className="form-item__multiline-label-description">Should the poll be featured?</span>
	// 							</label>
	// 							<Switch
	// 								checked={publicPoll}
	// 								onChange={() => setPublicPoll(!publicPoll)}
	// 								name="publicPoll"
	// 							/>
	// 						</div>
	// 					</div>
	// 				</div>

	// 				<div className='form-section form-section--centered'>
	// 					<div className="form-section-item w-100 center-self">
	// 						<DragDropContext onDragEnd={onDragEnd}>
	// 							<div className="form-item">
	// 								<label className="required">Options</label>
	// 								{!!errors.options ? <span className='form-item__error'>{errors.options}</span> : null}
	// 								<Droppable droppableId={"droppable-0"}>
	// 									{(provided) => (
	// 										<div
	// 											className="droppable"
	// 											ref={provided.innerRef}
	// 											{...provided.droppableProps}>
	// 											{options.map((option, index) => {
	// 												return <Draggable
	// 													draggableId={option.id}
	// 													key={option.id}
	// 													index={index}>

	// 													{(provided) => (
	// 														<div
	// 															ref={provided.innerRef}
	// 															{...provided.draggableProps}
	// 															{...{ ...provided.dragHandleProps, tabIndex: -1 }}
	// 														>
	// 															<Option
	// 																id={option.id}
	// 																index={index}
	// 																hasError={option.error}
	// 																deleteable={options.length > 2}
	// 																onChange={onOptionChange}
	// 																onDelete={onOptionDelete}
	// 																value={option.value}
	// 															/>
	// 														</div>
	// 													)}


	// 												</Draggable>
	// 											})}
	// 											{provided.placeholder}
	// 										</div>
	// 									)}
	// 								</Droppable>
	// 							</div>
	// 							<div className="poll__add-option">
	// 								<button className="btn btn--primary" onClick={onOptionAdd}><i className="fas fa-plus-circle"></i></button>
	// 							</div>
	// 						</DragDropContext >
	// 					</div>
	// 				</div>
	// 			</>
	// 		}
	// 	</div>
	// </>)

	let _modal_content;
	switch (modalContent) {
		case "DELETE": _modal_content = _deleteModal; break;
		case "EDIT": _modal_content = <h1>EDIT</h1>; break;
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