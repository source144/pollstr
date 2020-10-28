import React from 'react'
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import moment from 'moment';
import './CountdownTimer.css';

const minuteSeconds = 60;
const hourSeconds = 3600;
const daySeconds = 86400;

const timerProps = {
	isPlaying: true,
	size: 100,
	strokeWidth: 5
};

const renderTime = ({ remainingTime }) => {
	let time = remainingTime;
	let dimension = '';

	if (time <= 0)
		return <div className="time-wrapper"><div className='too-late'>Too late...</div></div>;

	if (time > daySeconds) { time = Math.floor(time / daySeconds); dimension = `day${time > 1 ? 's' : ''}`; }
	else if (time > hourSeconds) { time = Math.floor(time / hourSeconds); dimension = `hour${time > 1 ? 's' : ''}`; }
	else if (time > minuteSeconds) { time = Math.floor(time / minuteSeconds); dimension = `minute${time > 1 ? 's' : ''}`; }
	else dimension = `second${time > 1 ? 's' : ''}`

	return (
		<div className="timer">
			<div className="text">Remaining</div>
			<div className="time">{time}</div>
			<div className="text">{dimension}</div>
		</div>
	);
};

const CountdownTimer = ({ startDate, timeToLive, onComplete }) => {
	const timeLeft = timeToLive - (moment().unix() - moment(startDate).unix())
	
	return (
		<div className="timer-wrapper">
			<CountdownCircleTimer
				{...timerProps}
				duration={timeToLive}
				initialRemainingTime={timeLeft > 0 ? timeLeft : 0}
				onComplete={() => onComplete ? onComplete() : undefined}
				colors={[["#004777", 0.33], ["#F7B801", 0.33], ["#A30000"]]}
			>
				{renderTime}
			</CountdownCircleTimer>
		</div >
	);
}

export default CountdownTimer;