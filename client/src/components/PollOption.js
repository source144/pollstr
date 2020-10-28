import React, { useState, useEffect } from 'react';
import './PollOption.css';

export default ({ selectOption, option, selected, voted, disabled, showResult }) => {
	console.log(`(${option.id}) Selcted: ${selected} Voted: ${voted} Disabled: ${disabled}`);
	console.log(`(${option.id}) showResult: ${showResult}`);
	return (
		<div className={`form-item form--mb1 poll-option ${voted ? 'poll-option--voted' : disabled ? 'poll-option--disabled' : selected ? 'poll-option--selected' : ''}`}>
			<label>{option.title}</label>
			{option.description ? <span>{option.description}</span> : null}
			<button className="option-percent" onClick={() => !disabled ? selectOption(option.id) : undefined}>
				<div className="option-percent-display" style={{ width: disabled || showResult ? `${option.percent}%` : `${70 + Math.floor(Math.random() * 16)}%` }}>
					{/* <span className={`option-percent-value ${(!disabled && !showResult) || option.percent < 15 ? 'option-percent-value--right' : ''}`}>{disabled || showResult ? option.percent : '??'}%</span> */}
					{disabled || showResult ? <span className={`option-percent-value ${option.percent < 15 ? 'option-percent-value--right' : ''}`}>{disabled || showResult ? option.percent : '?'}%</span> : null}
					{!disabled && !showResult ? <span className={`option-percent-value option-percent-value--center`}>Vote to see result</span> : null}
				</div>
			</button>
			<span className='option-votes'>{disabled || showResult ? `(${option.votes > 0 ? option.votes : 'no'} vote${option.votes != 1 ? 's' : ''})` : ''}</span>
		</div>
	)
};



// Hidden results with just ?%
// 	return (
// 		<div className={`form-item form--mb1 poll-option ${voted ? 'poll-option--voted' : disabled ? 'poll-option--disabled' : selected ? 'poll-option--selected' : ''}`}>
// 		<label>{option.title}</label>
// 		{option.description ? <span>{option.description}</span> : null}
// 		<button className="option-percent" onClick={() => !disabled ? selectOption(option.id) : undefined}>
// 			<div className="option-percent-display" style={{ width: disabled || showResult ? `${option.percent}%` : "0%" }}>
// 				<span className={`option-percent-value ${(!disabled && !showResult) || option.percent < 15 ? 'option-percent-value--right' : ''}`}>{disabled || showResult ? option.percent : '?'}%</span>
// 				{/* {disabled || showResult ? <span className={`option-percent-value ${option.percent < 15 ? 'option-percent-value--right' : ''}`}>{disabled || showResult ? option.percent : '?'}%</span> : null} */}
// 				{/* {!disabled && !showResult ? <span className={`option-percent-value option-percent-value--center`}>Vote to see result</span> : null} */}
// 			</div>
// 		</button>
// 		<span className='option-votes'>{disabled ? `(${option.votes > 0 ? option.votes : 'no'} vote${option.votes != 1 ? 's' : ''})` : ''}</span>
// 	</div>
// )