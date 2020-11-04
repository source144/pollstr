import React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { selectOption } from '../store/actions/pollActions';
import './PollOption.css';

const SELECT_PERCENTAGE_INCREASE = 3;
const NO_POLL_VOTERS_PERCENTAGE = 30;
const HIDDEN_RESULTS_PERCENTAGE = 70;

const templatePollData = { voted: true, hideResults: false, expired: true, total_votes: 37 };

export default ({ option, isTemplate = false }) => {
	const { voted, hideResults, expired, total_votes } = !isTemplate ? useSelector(state => state.poll.poll) : templatePollData;
	const { selected } = !isTemplate ? useSelector(state => state.poll) : { selected: false };
	const dispatch = useDispatch();

	const disabled = voted != undefined || expired;
	const showResult = !hideResults || expired;
	const selected_this = selected === option.id;

	let optionPercentDisplayWidth;

	// Calculate the percentage width
	if (!disabled) {
		// Base percentage width
		if (total_votes === 0) optionPercentDisplayWidth = NO_POLL_VOTERS_PERCENTAGE
		else if (showResult) optionPercentDisplayWidth = option.percent;
		else optionPercentDisplayWidth = HIDDEN_RESULTS_PERCENTAGE;

		// Selected buffer
		if (selected_this)
			optionPercentDisplayWidth += SELECT_PERCENTAGE_INCREASE;

		// Otherwise, just show the actual result
	} else optionPercentDisplayWidth = option.percent;

	return (
		<div className={`form-item form--mb1 poll-option ${voted === option.id ? 'poll-option--voted' : disabled ? 'poll-option--disabled' : selected_this ? 'poll-option--selected' : ''}`}
			onClick={() => !disabled && !selected_this ? dispatch(selectOption(option.id)) : undefined}
		>
			<label >{option.title}</label>
			{option.description ? <span>{option.description}</span> : null}
			<button className="option-percent">
				<div className="option-percent-display" style={{ width: `${optionPercentDisplayWidth}%` }}>
					{/* <span className={`option-percent-value ${(!disabled && !showResult) || option.percent < 15 ? 'option-percent-value--right' : ''}`}>{disabled || showResult ? option.percent : '??'}%</span> */}
					{disabled || showResult || total_votes === 0 ? <span className={`option-percent-value ${option.percent < 15 ? 'option-percent-value--right' : ''}`}>{disabled || showResult || total_votes === 0 ? option.percent : '?'}%</span> : null}
					{!disabled && !showResult && total_votes !== 0 ? <span className={`option-percent-value option-percent-value--center`}>Vote to see result</span> : null}
				</div>
			</button>
			<span className='option-votes'>{disabled || showResult ? `(${option.votes > 0 ? option.votes : 'no'} vote${option.votes != 1 ? 's' : ''})` : ''}</span>
		</div>
	)
};