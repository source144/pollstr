import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { useSelector } from 'react-redux';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import useWindowDimension from '../../util/useWindowDimension';
import './CreatePoll.css';
import HashtagTextArea from '../../HashtagTextArea';
import Option from './Option';
import _ from 'lodash';

import Switch from 'react-ios-switch';
import axios from 'axios';
import moment from 'moment'
import QRCode from 'qrcode.react';
import { v4 as uuid } from 'uuid'

import Placeholder from '../Placeholder/Placeholder'

// Use this date picker
import momentLocalizer from 'react-widgets-moment';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';

// For React-Widgets 
// DateTimePicker
moment.locale("en");
momentLocalizer();

const pwRegex = /^\S+$/;
const validate = (payload) => {

	const errors = {
		title: "",
		description: "",
		passcode: "",
		optionErrors: false,
		hasErrors: false,
		options: ""
	}

	const _options = _.uniqBy(payload.options, 'title');

	// Title:
	if (!payload.title || !(payload.title = payload.title.trim())) errors.title = 'Title is required';
	else if (payload.title.trim().length > 50) errors.title = "Title too long. (50 chars max)";


	// if (payload.description && payload.description.trim().length > 50) errors.description = "Description too long. (50 chars max)";

	if (_options.length < 2) errors.options = "Must have two or more unique options";
	// errors.options = _.map(payload.options, (option, idx) => {
	// 	if (option.title && option.title.trim().length > 50) {
	// 		errors.optionErrors = true;
	// 		return "Option is too long. (50 chars max)";
	// 	} else return '';
	// });


	if (payload.passcode) {
		if (payload.passcode.length > 24) errors.passcode = 'Passcode too long. (24 chars max)';
		else if (!pwRegex.test(payload.passcode)) errors.passcode = 'Passcode must not contain whitespaces';
	}

	errors.hasErrors = errors.title || errors.description || errors.passcode || errors.optionErrors

	return errors;
}

const CreatePoll = () => {
	// TODO : Use a global state from AppContext
	const { width } = useWindowDimension();
	const isMobile = width <= 960;

	const { auth, global_loading: auth_loading } = useSelector(state => state.auth);
	const isLoggedIn = !_.isEmpty(auth);

	const [responseError, setResponseError] = useState('');
	const [resultsHidden, setResultsHidden] = useState(true);
	const [publicPoll, setPublicPoll] = useState(false);
	const [allowGuests, setAllowGuests] = useState(true);
	const [expireDate, setExpireDate] = useState('');
	const [createdId, setCreatedId] = useState(undefined);
	const [options, setOptions] = useState(
		[
			{ id: uuid(), value: "" },
			{ id: uuid(), value: "" },
			{ id: uuid(), value: "" },
		]
	)

	const [title, setTitle] = useState('');
	const [passcode, setPasscode] = useState('');
	const [description, setDescription] = useState('');
	const [tags, setTags] = useState('');

	const [errors, setErrors] = useState({
		title: "",
		description: "",
		passcode: "",
		optionErrors: false,
		hasErrors: false,
		options: ""
	});


	const checkForDuplicates = (_options_, mutable = true) => {
		// Use a "clone" if options is immutable
		if (!mutable) _options_ = [..._options_]

		// Find duplicate options' indecies
		const duplicates = {};
		_.forEach(_options_, (option, idx) => {
			// If can't operate on option or option can't be a duplicate
			if (typeof option.value !== 'string' || !option.value)
				return;

			// For ease of use
			const trimmedVal = option.value.trim();

			// Add index of existing duplicate
			if (duplicates.hasOwnProperty(trimmedVal)) duplicates[trimmedVal].push(idx);

			// Add index of new duplicate
			else if (idx != _.findLastIndex(_options_, _o => typeof _o.value === 'string' && _o.value.trim() === trimmedVal))
				duplicates[trimmedVal] = [idx];
		})

		// Mark all duplicate options as duplicates, using indecies found above
		_.forEach(duplicates, duplicate => { _.forEach(duplicate, idx => _options_[idx].error = "duplicate") });

		// Return options with marked duplicates
		return _options_;
	}

	const onOptionChange = (index, value) => {
		const _options = [...options].map(option => ({ ...option, error: "" }));
		_options[index].value = value;

		// Update the options with new 
		// values and possible dupliates
		setOptions([...checkForDuplicates(_options)])
	}

	const onOptionDelete = (index) => {
		// Mutate options and reset all error states
		const _options = [...options].map(option => ({ ...option, error: "" }));

		// Eject the deleted option
		_options.splice(index, 1);

		// Check for possible duplicates
		// and update the options state 
		setOptions([...checkForDuplicates(_options)])
	}

	const onOptionAdd = (e) => {
		e.preventDefault();
		setOptions([...options, { id: uuid(), value: "" }]);
	}

	const onDragEnd = result => {
		const { destination, source } = result;

		if (!destination || (destination.droppableId === source.droppableId && destination.index === source.index))
			return;

		const _options = [...options];
		_options.splice(source.index, 1);
		_options.splice(destination.index, 0, options[source.index]);

		setOptions([..._options]);
	}

	const handleSubmit = (e) => {
		e.preventDefault();

		// Must finish logging
		if (auth_loading)
			return;

		const _payloadOptions = _.map(
			_.filter(options, option => option.value && !!option.value.trim()),
			option => ({ title: option.value.trim() })
		);
		const _timeToLive = !!expireDate ? moment(expireDate).unix() - moment().unix() : 0
		const payload = {
			title: title || undefined,
			description: description || undefined,
			timeToLive: _timeToLive >= 0 ? _timeToLive : 0,
			options: _payloadOptions,
			passcode: passcode || undefined,
			tags: tags,
			usersOnly: !allowGuests,
			public: publicPoll,
			hideResults: resultsHidden
		}

		const _errors = { ...errors, ...validate(payload) };
		if (_errors.hasErrors) {
			setErrors(_errors);
			setResponseError('Make sure all fields are entered correctly!')
			return;
		}

		// TODO : loading
		axios.post('/poll/', payload)
			.then(response => { setCreatedId(response.data.id) })
			.catch(error => {
				const errorMsg = error.response && error.response.data ? (error.response.data.message ? error.response.data.message : (typeof error.response.data.error === 'string' ? error.response.data.error : error.message)) : error.message;
				setResponseError(errorMsg);
			})
	};
	const handlePasscode = e => { setPasscode(e.target.value) };

	const handleTitle = value => { setTitle(value) };

	const handleDescription = value => { setDescription(value); };

	const handleTags = e => { setTags(e.target.value) };

	useEffect(() => { }, [description, title]);

	return (

		<div className="form-centered-container">
			{auth_loading ? <Placeholder /> :
				<div className="form-form-wrapper poll-create-form">
					{createdId ?
						// ------------------ //
						//   Create Success   //
						// ------------------ //
						<>
							<h1 className='form-title'>Poll Created</h1>
							<div onSubmit={(e) => { e.preventDefault() }} formNoValidate className='form-form'>
								<div className="form-switch poll-created-description">Use this QR Code to Acces Poll</div>
								<div className="poll-created-qr">
									<QRCode value={`${window.location.protocol}//${window.location.host}/poll/${createdId}`} size={200} />
								</div>
								<div className="form-switch poll-created-description">You can also use <Link to={`/poll/${createdId}`} className='form-switch-action'>This Link</Link></div>
								<div className="form-item">
									<input
										className="btn btn--tertiary form-item__submit"
										type="submit" value="Create Another!"
										onClick={() => setCreatedId(undefined)} />
								</div>
							</div>
						</>
						:
						// --------------- //
						//   Create Poll   //
						// --------------- //
						<>
							<h1 className='form-title'>Create Poll</h1>
							<div onSubmit={handleSubmit} formNoValidate className='form-form'>
								{isMobile ?
									// --------------- //
									//   Mobile View   //
									// --------------- //
									<>
										{/* General Information */}
										<div className="form-item">
											<label htmlFor="title" className="required">Poll Title</label>
											<div className='form-item-wrapper'>
												<HashtagTextArea
													className={`form-item__input ${!!errors.title ? 'form-item__input--err' : ''}`}
													placeholder="e.g. Apples or Bananas? #Fruit"
													tagClass="form-item__input--hashtag"
													onChange={handleTitle}
													singleline={true}
												/>
											</div>
											{!!errors.title ? <span className='form-item__error'>{errors.title}</span> : null}
										</div>
										<div className="form-item">
											<label htmlFor="description">Description</label>
											{/* <div className='form-item-wrapper'> */}
											<HashtagTextArea
												className={`form-item__input form-item__input--textarea ${!!errors.description ? 'form-item__input--err' : ''}`}
												placeholder="e.g. Let's settle this once and for all! Which #fruit is better? Apples or Bananas?"
												tagClass="form-item__input--hashtag"
												newlines={true}
												onChange={handleDescription}
											/>
											{/* </div> */}
											{!!errors.description ? <span className='form-item__error'>{errors.description}</span> : null}
										</div>

										{/* Poll Options */}
										<DragDropContext onDragEnd={onDragEnd}>
											<div className="form-item">
												<label className="required">Options</label>
												{!!errors.options ? <span className='form-item__error'>{errors.options}</span> : null}
												<Droppable droppableId={"droppable-0"}>
													{(provided) => (
														<div
															className="droppable"
															ref={provided.innerRef}
															{...provided.droppableProps}>
															{options.map((option, index) => {
																return <Draggable
																	draggableId={option.id}
																	key={option.id}
																	index={index}>

																	{(provided) => (
																		<div
																			ref={provided.innerRef}
																			{...provided.draggableProps}
																			{...{ ...provided.dragHandleProps, tabIndex: -1 }}
																		>
																			<Option
																				id={option.id}
																				index={index}
																				hasError={option.error}
																				deleteable={options.length > 2}
																				onChange={onOptionChange}
																				onDelete={onOptionDelete}
																				value={option.value}
																			/>
																		</div>
																	)}


																</Draggable>
															})}
															{provided.placeholder}
														</div>
													)}
												</Droppable>
											</div>
											<div className="poll__add-option">
												<button className="btn btn--primary" onClick={onOptionAdd}><i className="fas fa-plus-circle"></i></button>
											</div>
										</DragDropContext >

										{/* Expiry and Poll Settings */}
										<div className="form-item form-item--no-margin form--mb1">
											<label htmlFor="expire" className='rw-datepicker-label'>Expire Date</label>
											<DateTimePicker
												min={new Date()}
												onChange={date => setExpireDate(date)}
												step={5}
												timeCaption="time"
												placeholder="No Exipiry Set"
											/>
										</div>
										<div className="form-item">
											<label htmlFor="passcode">Passcode</label>
											<p className="optional">Require a passcode for every vote</p>
											<div className='form-item-wrapper'>
												<input
													className={`form-item__input ${!!errors.passcode ? 'form-item__input--err' : ''}`}
													type="password"
													placeholder="e.g. *******"
													name="passcode"
													formNoValidate
													onChange={handlePasscode} />
												<span className='form-item__input-icon'><i className="fas fa-passcode"></i></span>
											</div>
											{!!errors.passcode ? <span className='form-item__error'>{errors.passcode}</span> : null}
										</div>
										<div className="form-item">
											<label htmlFor="tags">Tags</label>
											<div className='form-item-wrapper'>
												<input
													className={`form-item__input ${!!errors.tags ? 'form-item__input--err' : ''}`}
													type="text"
													placeholder="e.g. #Food #Health"
													name="tags"
													formNoValidate
													onChange={handleTags} />
												<span className='form-item__input-icon'><i className="fas fa-tags"></i></span>
											</div>
											{!!errors.tags ? <span className='form-item__error'>{errors.tags}</span> : null}
										</div>
										<div className="form-item form-item--row">
											<label className="form-item__multiline-label" htmlFor="resultsHidden" onClick={() => setResultsHidden(!resultsHidden)}>
												<span className="form-item__multiline-label-title">Hidden Results</span>
												<span className="form-item__multiline-label-description">Visible only after voting?</span>
											</label>
											<Switch
												checked={resultsHidden}
												onChange={() => setResultsHidden(!resultsHidden)}
												name="resultsHidden"
											/>
										</div>
										<div className="form-item form-item--row">
											<label className="form-item__multiline-label" htmlFor="allowGuests" onClick={() => !isLoggedIn ? setResultsHidden(!allowGuests) : undefined}>
												<span className="form-item__multiline-label-title">Guest Votes</span>
												<span className="form-item__multiline-label-description">Can guests vote?</span>
											</label>
											<Switch
												checked={allowGuests}
												onChange={() => setAllowGuests(!allowGuests)}
												name="allowGuests"
												disabled={!isLoggedIn}
											/>
										</div>
										<div className="form-item form-item--row">
											<label className="form-item__multiline-label" htmlFor="publicPoll" onClick={() => setPublicPoll(!publicPoll)}>
												<span className="form-item__multiline-label-title">Public Poll</span>
												<span className="form-item__multiline-label-description">Should the poll be featured?</span>
											</label>
											<Switch
												checked={publicPoll}
												onChange={() => setPublicPoll(!publicPoll)}
												name="publicPoll"
											/>
										</div>

									</>
									:
									// ---------------- //
									//   Desktop View   //
									// ---------------- //
									<>
										<div className='form-section'>
											<div className="form-section-item w-60">
												<div className="form-item">
													<label htmlFor="title" className="required">Poll Title</label>
													<div className='form-item-wrapper'>
														<HashtagTextArea
															className={`form-item__input ${!!errors.title ? 'form-item__input--err' : ''}`}
															placeholder="e.g. Apples or Bananas? #Fruit"
															tagClass="form-item__input--hashtag"
															onChange={handleTitle}
															singleline={true}
														/>
													</div>
													{!!errors.title ? <span className='form-item__error'>{errors.title}</span> : null}
												</div>
												<div className="form-item">
													<label htmlFor="description">Description</label>
													<div className='form-item-wrapper'>
														<HashtagTextArea
															className={`form-item__input form-item__input--textarea ${!!errors.description ? 'form-item__input--err' : ''}`}
															placeholder="e.g. Let's settle this once and for all! Which #fruit is better? Apples or Bananas?"
															tagClass="form-item__input--hashtag"
															newlines={true}
															onChange={handleDescription}
														/>
													</div>
													{!!errors.description ? <span className='form-item__error'>{errors.description}</span> : null}
												</div>
												<div className="form-item">
													<label htmlFor="tags">Tags</label>
													<div className='form-item-wrapper'>
														<input
															className={`form-item__input ${!!errors.tags ? 'form-item__input--err' : ''}`}
															type="text"
															placeholder="e.g. #Food #Health"
															name="tags"
															formNoValidate
															onChange={handleTags} />
														<span className='form-item__input-icon'><i className="fas fa-tags"></i></span>
													</div>
													{!!errors.tags ? <span className='form-item__error'>{errors.tags}</span> : null}
												</div>
											</div>

											<div className="form-section-item w-40">
												<div className="form-item">
													<label htmlFor="passcode" className="optional">Passcode</label>
													{/* <p className="optional">Require a passcode for every vote</p> */}
													<div className='form-item-wrapper'>
														<input
															className={`form-item__input ${!!errors.passcode ? 'form-item__input--err' : ''}`}
															type="password"
															placeholder="e.g. *******"
															name="passcode"
															formNoValidate
															onChange={handlePasscode} />
														<span className='form-item__input-icon'><i className="fas fa-passcode"></i></span>
													</div>
													{!!errors.passcode ? <span className='form-item__error'>{errors.passcode}</span> : null}
												</div>
												<div className="form-item form-item--no-margin form--mb1">
													<label htmlFor="expire" className='rw-datepicker-label'>Expire Date</label>
													<DateTimePicker
														min={new Date()}
														onChange={date => setExpireDate(date)}
														step={5}
														timeCaption="time"
														placeholder="No Exipiry Set"
													/>
												</div>
												<div className="form-item form-item--row">
													<label className="form-item__multiline-label" htmlFor="resultsHidden" onClick={() => setResultsHidden(!resultsHidden)}>
														<span className="form-item__multiline-label-title">Hidden Results</span>
														<span className="form-item__multiline-label-description">Visible only after voting?</span>
													</label>
													<Switch
														checked={resultsHidden}
														onChange={() => setResultsHidden(!resultsHidden)}
														name="resultsHidden"
													/>
												</div>
												<div className="form-item form-item--row">
													<label className="form-item__multiline-label" htmlFor="allowGuests" onClick={() => !isLoggedIn ? setResultsHidden(!allowGuests) : undefined}>
														<span className="form-item__multiline-label-title">Guest Votes</span>
														<span className="form-item__multiline-label-description">Can guests vote?</span>
													</label>
													<Switch
														checked={allowGuests}
														onChange={() => setAllowGuests(!allowGuests)}
														name="allowGuests"
														disabled={!isLoggedIn}
													/>
												</div>
												<div className="form-item form-item--row">
													<label className="form-item__multiline-label" htmlFor="publicPoll" onClick={() => setPublicPoll(!publicPoll)}>
														<span className="form-item__multiline-label-title">Public Poll</span>
														<span className="form-item__multiline-label-description">Should the poll be featured?</span>
													</label>
													<Switch
														checked={publicPoll}
														onChange={() => setPublicPoll(!publicPoll)}
														name="publicPoll"
													/>
												</div>
											</div>
										</div>

										<div className='form-section form-section--centered'>
											<div className="form-section-item w-100 center-self">
												<DragDropContext onDragEnd={onDragEnd}>
													<div className="form-item">
														<label className="required">Options</label>
														{!!errors.options ? <span className='form-item__error'>{errors.options}</span> : null}
														<Droppable droppableId={"droppable-0"}>
															{(provided) => (
																<div
																	className="droppable"
																	ref={provided.innerRef}
																	{...provided.droppableProps}>
																	{options.map((option, index) => {
																		return <Draggable
																			draggableId={option.id}
																			key={option.id}
																			index={index}>

																			{(provided) => (
																				<div
																					ref={provided.innerRef}
																					{...provided.draggableProps}
																					{...{ ...provided.dragHandleProps, tabIndex: -1 }}
																				>
																					<Option
																						id={option.id}
																						index={index}
																						hasError={option.error}
																						deleteable={options.length > 2}
																						onChange={onOptionChange}
																						onDelete={onOptionDelete}
																						value={option.value}
																					/>
																				</div>
																			)}


																		</Draggable>
																	})}
																	{provided.placeholder}
																</div>
															)}
														</Droppable>
													</div>
													<div className="poll__add-option">
														<button className="btn btn--primary" onClick={onOptionAdd}><i className="fas fa-plus-circle"></i></button>
													</div>
												</DragDropContext >
											</div>
										</div>
									</>
								}
								{!!responseError ? <div className="form-item__error">{responseError}</div> : null}
								<div className="form-item" style={!isMobile ? { marginRight: '-1rem' } : {}}>
									<input
										className={`btn btn--tertiary form-item__submit ${!!errors.confirm ? 'form-item__input--err' : ''}`}
										type="submit" value="Create!" onClick={handleSubmit} disabled={!title || !_.filter(options, option => !!option.value && !!option.value.trim()).length >= 2} />
								</div>
							</div>
						</>}
				</div>
			}
		</div >
	)
}

export default CreatePoll;