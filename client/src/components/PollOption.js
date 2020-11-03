import { object } from 'joi';
import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectOption } from '../store/actions/pollActions';
import './PollOption.css';

export default ({ option }) => {
	const { voted, hideResults, expired } = useSelector(state => state.poll.poll);
	const { selected } = useSelector(state => state.poll);
	const dispatch = useDispatch();

	const disabled = voted != undefined || expired;
	const showResult = !hideResults || expired;

	let optionPercentDisplayWidth;

	// Calculate the percentage width
	if (!disabled) {
		// Base percentage width
		if (showResult) optionPercentDisplayWidth = total_votes === 0 ? NO_POLL_VOTERS_PERCENTAGE : option.percent;
		else optionPercentDisplayWidth = HIDDEN_RESULTS_PERCENTAGE;

		// Selected buffer
		if (selected_this)
			optionPercentDisplayWidth += SELECT_PERCENTAGE_INCREASE;

		// Otherwise, just show the actual result
	} else optionPercentDisplayWidth = option.percent;

	return (
		<div className={`form-item form--mb1 poll-option ${voted === option.id ? 'poll-option--voted' : disabled ? 'poll-option--disabled' : selected === option.id ? 'poll-option--selected' : ''}`}>
			<label>{option.title}</label>
			{option.description ? <span>{option.description}</span> : null}
			<button className="option-percent" onClick={() => !disabled ? dispatch(selectOption(option.id)) : undefined}>
				<div className="option-percent-display" style={{ width: `${optionPercentDisplayWidth}%` }}>
					{/* <span className={`option-percent-value ${(!disabled && !showResult) || option.percent < 15 ? 'option-percent-value--right' : ''}`}>{disabled || showResult ? option.percent : '??'}%</span> */}
					{disabled || showResult ? <span className={`option-percent-value ${option.percent < 15 ? 'option-percent-value--right' : ''}`}>{disabled || showResult ? option.percent : '?'}%</span> : null}
					{!disabled && !showResult ? <span className={`option-percent-value option-percent-value--center`}>Vote to see result</span> : null}
				</div>
			</button>
			<span className='option-votes'>{disabled || showResult ? `(${option.votes > 0 ? option.votes : 'no'} vote${option.votes != 1 ? 's' : ''})` : ''}</span>
		</div>
	)
};