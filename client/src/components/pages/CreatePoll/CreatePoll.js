import React, { useState, useEffect } from 'react'
import { DragDropContext, Draggable, Droppable } from 'react-beautiful-dnd';
import './CreatePoll.css';
import HashtagTextArea from '../../HashtagTextArea';
import Option from './Option';
import _ from 'lodash';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import Switch from 'react-ios-switch';
import { v4 as uuid } from 'uuid'

const Container = ({ children }) => {
	return <div>{children}</div>
}

const CreatePoll = () => {
	const [responseError, setResponseError] = useState('');
	const [resultsHidden, setResultsHidden] = useState(true);
	const [privatePoll, setPrivatePoll] = useState(false);
	const [usersOnly, setUsersOnly] = useState(false);
	const [expireDate, setExpireDate] = useState('');

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
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');

	const [errors, setErrors] = useState({
		firstName: '',
		lastName: '',
		tags: '',
		password: '',
		confirm: '',
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

	const handleSubmit = (e) => { console.log("In submit") };
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
		<DragDropContext onDragEnd={onDragEnd}>

			<div className="form-centered-container">
				<div className="form-form-wrapper">
					<h1 className='form-title'>Create Poll</h1>
					<form onSubmit={handleSubmit} formNoValidate className='form-form'>
						<div className="form-item">
							<label htmlFor="title">Poll Title</label>
							<div className='form-item-wrapper'>
								<HashtagTextArea
									className={`form-item__input${!!errors.title ? 'form-item__input--err' : ''}`}
									placeholder="e.g. Apples or Bananas? #Fruit"
									tagClass="form-item__input--hashtag"
									onChange={handleTitle}
								/>
							</div>
							{!!errors.title ? <span className='form-item__error'>{errors.title}</span> : null}
						</div>
						<div className="form-item">
							<label htmlFor="description">Description</label>
							<div className='form-item-wrapper'>
								<HashtagTextArea
									className={`form-item__input form-item__input--textarea${!!errors.description ? 'form-item__input--err' : ''}`}
									placeholder="e.g. Let's settle this once and for all! Which #fruit is better? Apples or Bananas?"
									tagClass="form-item__input--hashtag"
									newlines={true}
									onChange={handleDescription}
								/>
							</div>
							{!!errors.description ? <span className='form-item__error'>{errors.description}</span> : null}
						</div>
						<div className="form-item">
							<label >Options</label>
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
						</div>
						<div className="poll__add-option">
							<button className="btn btn--primary" onClick={onOptionAdd}><i className="fas fa-plus-circle"></i></button>
						</div>
						<div className="form-item">
							<label htmlFor="expire" className='optional'>Expire Date</label>
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
							<label htmlFor="passcode" className='optional'>Passcode</label>
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
							<label htmlFor="tags" className='optional'>Tags</label>
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
							<label htmlFor="resultsHidden" onClick={() => setResultsHidden(!resultsHidden)}>Hidden Results</label>
							<Switch
								checked={resultsHidden}
								onChange={() => setResultsHidden(!resultsHidden)}
								name="resultsHidden"
							/>
						</div>

						<div className="form-item form-item--row">
							<label htmlFor="usersOnly" onClick={() => setResultsHidden(!usersOnly)}>Users Only</label>
							<Switch
								checked={usersOnly}
								onChange={() => setUsersOnly(!usersOnly)}
								name="usersOnly"
							/>
						</div>

						<div className="form-item form-item--row">
							<label htmlFor="privatePoll" onClick={() => setResultsHidden(!privatePoll)}>Private Poll</label>
							<Switch
								checked={privatePoll}
								onChange={() => setPrivatePoll(!privatePoll)}
								name="privatePoll"
							/>
						</div>

						{!!responseError ? <div className="form-item__error">{responseError}</div> : null}
						<div className="form-item">
							<input
								className={`btn btn--tertiary form-item__submit ${!!errors.confirm ? 'form-item__input--err' : ''}`}
								type="submit" value="Create!" />
						</div>

					</form>
				</div>
			</div>
		</DragDropContext >
	)
}

export default CreatePoll;