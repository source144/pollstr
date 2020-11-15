import React, { useState, useEffect, useRef } from 'react';
import { useSelector } from 'react-redux';

import moment from 'moment';
import _ from 'lodash';

// Use this date picker
import momentLocalizer from 'react-widgets-moment';
import DateTimePicker from 'react-widgets/lib/DateTimePicker';
import useWindowDimension from '../util/useWindowDimension'
import HashtagTextArea from '../HashtagTextArea';
import Option from '../pages/CreatePoll/Option';
import Switch from 'react-ios-switch';

export default ({ poll }) => {
	const { width } = useWindowDimension();
	const isMobile = width <= 600;

	const { auth, global_loading: auth_loading } = useSelector(state => state.auth);
	const isLoggedIn = !_.isEmpty(auth);

	const [resultsHidden, setResultsHidden] = useState(poll.hideResults);
	const [allowGuests, setAllowGuests] = useState(!poll.usersOnly);
	const [publicPoll, setPublicPoll] = useState(poll.public);
	const [expireDate, setExpireDate] = useState(poll.timeToLive > 0 ? moment.unix(moment(poll.createDate).unix() + poll.timeToLive).toDate() : undefined)

	const errors = { tags: "" }

	return <>
		<div className="form-centered-container">
			<div className="form-form-wrapper poll-create-form">

				<h1 className='form-title'>Edit Poll</h1>
				<div onSubmit={() => { console.log("HANDLE EDIT SUBMIT") }} formNoValidate className='form-form'>
					{isMobile ?
						// --------------- //
						//   Mobile View   //
						// --------------- //
						<>
							{/* Expiry and Poll Settings */}
							<div className="form-item form-item--no-margin form--mb1">
								<label htmlFor="expire" className='rw-datepicker-label'>Expire Date</label>
								<DateTimePicker
									min={new Date()}
									onChange={date => setExpireDate(date)}
									step={5}
									timeCaption="time"
									placeholder="No Exipiry Set"
									defaultValue={poll.timeToLive > 0 ? moment.unix(moment(poll.createDate).unix() + poll.timeToLive).toDate() : undefined}
								/>
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
										onChange={(e) => { console.log("EDIT TAGS", e.target.value) }} />
									{/* onChange={handleTags} /> */}
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
										<label htmlFor="title">Poll Title</label>
										<div className='form-item-wrapper'>
											<HashtagTextArea
												className="form-item__input"
												placeholder="(No Title)"
												tagClass="form-item__input--hashtag"
												singleline={true}
												disabled
												value={poll.title}
											/>
										</div>
									</div>
									<div className="form-item">
										<label htmlFor="description">Description</label>
										<div className='form-item-wrapper'>
											<HashtagTextArea
												className="form-item__input form-item__input--textarea"
												placeholder="(No Description)"
												tagClass="form-item__input--hashtag"
												newlines={true}
												disabled
												value={poll.description}
											/>
										</div>
									</div>
									<div className="form-item">
										<label htmlFor="tags">Tags</label>
										<div className='form-item-wrapper'>
											<input
												className={`form-item__input ${!!errors.tags ? 'form-item__input--err' : ''}`}
												type="text"
												placeholder="(e.g. #Food #Health)"
												name="tags"
												formNoValidate
												onChange={(e) => { console.log('EDIT TAGS', e.target.value) }} />
											{/* onChange={handleEditTags} /> */}
											<span className='form-item__input-icon'><i className="fas fa-tags"></i></span>
										</div>
										{!!errors.tags ? <span className='form-item__error'>{errors.tags}</span> : null}
									</div>
								</div>

								{/* TODO : change passcode from different modal */}
								<div className="form-section-item w-40">
									<div className="form-item form-item--no-margin form--mb1">
										<label htmlFor="expire" className='rw-datepicker-label'>Expire Date</label>
										<DateTimePicker
											min={new Date()}
											onChange={date => setExpireDate(date)}
											step={5}
											timeCaption="time"
											placeholder="No Exipiry Set"
											defaultValue={poll.timeToLive > 0 ? moment.unix(moment(poll.createDate).unix() + poll.timeToLive).toDate() : undefined}
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
									<div className="form-item">
										<label>Options</label>
										{poll.options.map(option => {
											return (
												<div className="form-item" key={'option-' + option.id}>
													<div className="form-item-wrapper p-rel">
														<input
															type="text"
															value={option.title}
															className="form-item__input"
															disabled />
													</div>
												</div>
											)
										})}
									</div>
								</div>
							</div>
						</>
					}
				</div>
			</div>
		</div>

	</>
}