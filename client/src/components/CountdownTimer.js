import React from 'react'
import { CountdownCircleTimer } from "react-countdown-circle-timer";
import moment from 'moment';
import './CountdownTimer.css';

const minuteSeconds = 60;
const hourSeconds = 3600;
const daySeconds = 86400;

const timerProps = {
	isPlaying: true,
	size: 120,
	strokeWidth: 6
};

const getTimeSeconds = time => (minuteSeconds - time / 1000) | 0;
const getTimeMinutes = time => ((time % hourSeconds) / minuteSeconds) | 0;
const getTimeHours = time => ((time % daySeconds) / hourSeconds) | 0;
const getTimeDays = time => (time / daySeconds) | 0;

const renderTime = (dimension, time) => {

	if (time < 0)
		return <div className="time-wrapper"><div className='too-late'>Too late...</div></div>;

	return (
		<div className="timer">
			<div className="text">Remaining</div>
			<div className="time">{time}</div>
			<div className="text">{dimension}</div>
		</div>
	);
};

const CountdownTimer = ({ startDate, timeToLive, onComplete }) => {
	// TODO : calc unixTime as totalTime
	// TODO : calc initial time remaining
	const totalTime = timeToLive;
	let timeLeft = timeToLive - (moment().unix() - moment(startDate).unix())
	const startDateUnix = moment(startDate).unix();

	const days = Math.floor(timeLeft / daySeconds);
	const hours = Math.floor(timeLeft / hourSeconds);
	const mins = Math.floor(timeLeft / minuteSeconds);

	const daysDuration = days * daySeconds;

	let renderFunction;
	if (days) renderFunction = ({ elapsedTime }) => renderTime("days", getTimeDays(daysDuration - elapsedTime / 1000));
	else if (hours) renderFunction = ({ elapsedTime }) => renderTime("hours", getTimeHours(daySeconds - elapsedTime / 1000));
	else if (mins) renderFunction = ({ elapsedTime }) => renderTime("minutes", getTimeMinutes(hourSeconds - elapsedTime / 1000));
	else renderFunction = ({ elapsedTime }) => renderTime("seconds", getTimeSeconds(elapsedTime));

	return (
		<div className="timer-wrapper">
			<CountdownCircleTimer
				{...timerProps}
				duration={timeToLive}
				initialRemainingTime={timeLeft > 0 ? timeLeft : 0}
				onComplete={() => onComplete ? onComplete() : undefined}
				colors={[["#004777", 0.33], ["#F7B801", 0.33], ["#A30000"]]}
			>
				{renderFunction}
			</CountdownCircleTimer>
		</div >
	);
}

export default CountdownTimer;