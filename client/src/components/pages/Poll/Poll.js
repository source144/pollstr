import React, { useState, useEffect } from 'react';
import PollOption from '../../PollOption';
import './Poll.css';

const Poll = () => {
	const errors = { confirm: false };
	const [totalVoters, setTotalVoters] = useState(212);
	const [showResultes, setShowresults] = useState(false);
	const [options, setOptions] = useState([
		{
			id: 0,
			title: 'Option 1',
			description: 'Description for option 1',
			votes: 11,
			percent: 34
		},
		{
			id: 1,
			title: 'Option 2',
			description: 'Description for option 2',
			votes: 22,
			percent: 44
		},
		{
			id: 2,
			title: 'Option 3',
			description: 'Description for option 3',
			votes: 33,
			percent: 22
		}
	]);
	const [selectedOptionId, setSelectedOptionId] = useState(undefined);
	const [votedOptionId, setVotedOptionId] = useState(undefined);

	const refreshOptions = () => {
		setOptions([
			{
				id: 0,
				title: 'Option 1',
				description: 'Description for option 1',
				votes: Math.floor(Math.random() * 100) + 1,
				percent: Math.floor(Math.random() * 100) + 1
			},
			{
				id: 1,
				title: 'Option 2',
				description: 'Description for option 2',
				votes: Math.floor(Math.random() * 100) + 1,
				percent: Math.floor(Math.random() * 100) + 1
			},
			{
				id: 2,
				title: 'Option 3',
				description: 'Description for option 3',
				votes: Math.floor(Math.random() * 100) + 1,
				percent: Math.floor(Math.random() * 100) + 1
			}]
		)
	};


	const selectOption = optionId => {
		console.log('Selecting option', optionId);
		setSelectedOptionId(optionId);
	}

	const voteOption = optionId => {
		if (optionId == null)
			return;

		console.log('Voting option', optionId);
		setVotedOptionId(optionId);
	}

	return (
		<div className="form-centered-container">
			<div className="form-form-wrapper">
				<h1 className='form-title form--mb0'>Poll Name</h1>
				<span className="poll-total-votes">{`${totalVoters > 0 ? totalVoters : 'no'} voter${totalVoters != 1 ? 's' : ''}`}</span>
				<div className="form-description"><p>Poll description</p></div>
				<span>[TAGS GO HERE]</span>
				<div className="form--mb1"></div>
				<span>[Expire Timer Here If Poll Set To Expire]</span>
				<div className="form--mb1"></div>

				{options.map((option) => <PollOption key={option.id} disabled={votedOptionId != undefined} option={option} selectOption={selectOption} selected={selectedOptionId === option.id} voted={votedOptionId === option.id}></PollOption>)}
				{/* {options.map(option => <PollOption id={option.id} title={option.title} description={option.description} votes={option.votes} percent={option.percent} voted={option.voted}></PollOption>)} */}
				{/* <PollOption title={options[0].title} description={options[0].description} percent={options[0].percent}></PollOption>
				<PollOption title={options[1].title} description={options[1].description} percent={options[1].percent}></PollOption>
				<PollOption title={options[2].title} description={options[2].description} percent={options[2].percent}></PollOption> */}
				<div className="form-item">
					<input
						className={`btn btn--tertiary form-item__submit ${!!errors.confirm ? 'form-item__input--err' : ''}`}
						type="submit" value="Vote" onClick={() => voteOption(selectedOptionId)} />
				</div>
				<button onClick={refreshOptions}>Refresh Options</button>
			</div>
		</div>
	);

};

export default Poll;