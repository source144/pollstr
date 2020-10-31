import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom';
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import './CreatePoll.css';
import HashtagTextArea from '../../HashtagTextArea';
import Option from './Option';
import _ from 'lodash';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Switch from 'react-ios-switch';
import axios from 'axios';
import moment from 'moment'
import QRCode from 'qrcode.react';
import { v4 as uuid } from 'uuid'

const pwRegex = /^\S+$/;
const validate = (payload) => {

	const errors = {
		title: "",
		description: "",
		passcode: "",
		optionErrors: false,
		hasErrors: false
	}

	// Title:
	if (!payload.title || !(payload.title = payload.title.trim())) errors.title = 'Title is required';
	else if (payload.title.trim().length > 50) errors.title = "Title too long. (50 chars max)";


	if (payload.description && payload.description.trim().length > 50) errors.description = "Description too long. (50 chars max)";

	errors.options = _.map(payload.options, (option, idx) => {
		if (option.value && option.value.trim().length > 50) {
			errors.optionErrors = true;
			return "Option is too long. (50 chars max)";
		} else return '';
	});


	if (payload.passcode) {
		if (payload.passcode.length > 24) errors.passcode = 'Passcode too long. (50 chars max)';
		else if (!pwRegex.test(payload.passcode)) errors.passcode = 'Passcode must not contain whitespaces';
	}

	errors.hasErrors = errors.title || errors.description || errors.passcode || errors.optionErrors

	return errors;
}

const CreatePoll = () => {
	const [responseError, setResponseError] = useState('');
	const [resultsHidden, setResultsHidden] = useState(true);
	const [publicPoll, setPublicPoll] = useState(false);
	const [allowGuests, setAllowGuests] = useState(false);
	const [expireDate, setExpireDate] = useState('');
	const [createdId, setCreatedId] = useState(undefined);

	const [options, setOptions] = useState(
		[
			{ id: uuid(), value: "One" },
			{ id: uuid(), value: "Two" },
			{ id: uuid(), value: "Three" },
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
		hasErrors: false
	});


	const onOptionChange = (index, value) => {
		const _options = [...options];
		_options[index].value = value;

		setOptions([..._options]);
	}
	const onOptionDelete = (index) => {
		const _options = [...options];
		_options.splice(index, 1);

		setOptions([..._options]);
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

		const _payloadOptions = _.map(
			_.filter(options, option => option.value && !!option.value.trim()),
			option => ({ title: option.value })
		);
		const _timeToLive = !!expireDate ? moment(expireDate).unix() - moment().unix() : 0
		const payload = {
			title: title || undefined,
			description: description || undefined,
			timeToLive: _timeToLive >= 0 ? _timeToLive : 0,
			options: _payloadOptions,
			passcode: passcode.trim() || undefined,
			tags: tags,
			usersOnly: !allowGuests,
			public: publicPoll,
			hideResults: resultsHidden
		}

		const _errors = { ...errors, ...validate(payload) };
		if (_errors.hasErrors) {
			setErrors(_errors);
			return;
		}

		// TODO : loading
		axios.post('/poll/', payload)
			.then(response => { console.log(response.data); setCreatedId(response.data.id) })
			.catch(error => {
				console.log(error);
				console.log(error.response.data);
				// setResponseError(error.response.data.error);
			})
	};
	const handlePasscode = e => { setPasscode(e.target.value) };
	const handleTitle = value => {
		setTitle(value)

	};
	const handleDescription = value => {
		setDescription(value);
		// e.target.style.height = "1px";
		// e.target.style.height = `${Math.max(e.target.scrollHeight + 4, 70)}px`;
		// setDescription(e.target.value)
	};
	const handleTags = e => { setTags(e.target.value) };

	useEffect(() => { console.log('Title: ', title); console.log('Desciption: ', description) }, [description, title]);

	return (

		<div className="form-centered-container">
			<div className="form-form-wrapper">
				{createdId ?
					<>
						<h1 className='form-title'>Poll Created</h1>
						<form onSubmit={(e) => { e.preventDefault() }} formNoValidate className='form-form'>
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
						</form>
					</>
					:
					<>
						<h1 className='form-title'>Create Poll</h1>
						<div className="form-description form-item__error form--mb1 neg-margin"><p>Please enter required information</p></div>
						<form onSubmit={handleSubmit} formNoValidate className='form-form'>
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
								<label className="required">Options</label>
								<DragDropContext onDragEnd={onDragEnd}>
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
																{...provided.dragHandleProps}
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
								</DragDropContext >
							</div>
							<div className="poll__add-option">
								<button className="btn btn--primary" onClick={onOptionAdd}><i className="fas fa-plus-circle"></i></button>
							</div>
							<div className="form-item">
								<label htmlFor="expire">Expire Date</label>
								<DatePicker
									selected={expireDate}
									onChange={date => setExpireDate(date)}
									className={`form-item__input ${!!errors.passcode ? 'form-item__input--err' : ''}`}
									isClearable
									showTimeSelect
									timeFormat="HH:mm"
									timeIntervals={15}
									timeCaption="time"
									dateFormat="MMMM d, yyyy h:mm aa"
									placeholderText="No Exipiry Set"
								/>
							</div>


							<div className="form-item">
								<label htmlFor="passcode">Passcode</label>
								<div className='form-item-wrapper'>
									<input
										className={`form-item__input ${!!errors.passcode ? 'form-item__input--err' : ''}`}
										type="password"
										placeholder="e.g. #Food #Health"
										name="passcode"
										formNoValidate
										onChange={handlePasscode} />
									<span className='form-item__input-icon'><i className="fas fa-passcode"></i></span>
								</div>
								{!!errors.tags ? <span className='form-item__error'>{errors.tags}</span> : null}
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

							<br />

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
								<label className="form-item__multiline-label" htmlFor="allowGuests" onClick={() => setResultsHidden(!allowGuests)}>
									<span className="form-item__multiline-label-title">Guest Votes</span>
									<span className="form-item__multiline-label-description">Can guests vote?</span>
								</label>
								<Switch
									checked={allowGuests}
									onChange={() => setAllowGuests(!allowGuests)}
									name="allowGuests"
								/>
							</div>

							<div className="form-item form-item--row">
								<label className="form-item__multiline-label" htmlFor="publicPoll" onClick={() => setResultsHidden(!publicPoll)}>
									<span className="form-item__multiline-label-title">Public Poll</span>
									<span className="form-item__multiline-label-description">Should the poll be featured?</span>
								</label>
								<Switch
									checked={publicPoll}
									onChange={() => setPublicPoll(!publicPoll)}
									name="publicPoll"
								/>
							</div>

							{!!responseError ? <div className="form-item__error">{responseError}</div> : null}
							<div className="form-item">
								<input
									className={`btn btn--tertiary form-item__submit ${!!errors.confirm ? 'form-item__input--err' : ''}`}
									type="submit" value="Create!" />
							</div>

						</form>
					</>}
			</div>
		</div >
	)
}

export default CreatePoll;