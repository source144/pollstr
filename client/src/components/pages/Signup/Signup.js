import React, { useState } from 'react'
import './Signup.css';

const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
const lowerRegex = /(?=.*[a-z])/
const upperRegex = /(?=.*[A-Z])/
const numbrRegex = /(?=.*[0-9])/
const PW_MIN_LENGTH = 8;


const checkForm = (payload) => {
	if (!payload || typeof payload !== 'object') { console.log('invalid payload'); return; }

	const errors = {
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirm: '',
	};
	const pwDetails = [];
	let valid = true;
	let pwLength;


	// Trim the payload
	Object.keys(payload).map(function (key, index) { payload[key] = payload[key].trim(); });

	if (!payload.email) errors.email = 'An email is required';
	else if (!emailRegex.test(payload.email)) errors.email = 'Please enter a valid email';

	if (!payload.password) errors.password = 'A password is required';
	else {
		if (!lowerRegex.test(payload.password)) pwDetails.push('1 lower case letter');
		if (!upperRegex.test(payload.password)) pwDetails.push('1 upper case letter');
		if (!numbrRegex.test(payload.password)) pwDetails.push('1 number');

		if (payload.password.length < PW_MIN_LENGTH) pwLength = `be at least 8 letters${!!pwDetails.length ? ',' : ''} `;

		if (pwDetails.length || pwLength)
			errors.password = `Password must ${pwLength ?? pwLength}contain ${pwDetails.slice(0, -1).join(', ')}${pwDetails.length > 2 ? ` and ${pwDetails.pop()}` : ''}`;
	}

	if (!errors.password && payload.password !== payload.confirm) errors.confirm = "passwords don't match";

	return errors;
}


const Signup = () => {


	const [firstName, setFirstName] = useState('');
	const [lastName, setLasttName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [responseError, setResponseError] = useState('');

	const [errors, setErrors] = useState({
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirm: '',
	});

	// TODO: novalidate


	const getPayload = () => ({
		firstName,
		lastName,
		email,
		password,
		confirm,
	});

	const handleFirstName = e => setFirstName(e.target.value);
	const handleLasttName = e => setLasttName(e.target.value);
	const handleEmail = e => setEmail(e.target.value);
	const handlePassword = e => setPassword(e.target.value);
	const handleConfirm = e => setConfirm(e.target.value);
	const handleSubmit = e => {
		e.preventDefault();

		console.log('Before validation', errors);

		let valid = true;
		const _errors = checkForm(getPayload());
		Object.keys(_errors).forEach(key => valid = valid && !!_errors[key]);

		console.log(_errors);
		console.log(valid);

		if (valid) {
			// Dispatch signup request
			// Handle Error
			// or Forward Home
		}
		else setErrors(_errors);
	}

	// TODO: add a span with symbol of field

	return (
		<div className="signup">
			<div className="form-form-wrapper">
				<h1 className='form-title'>Create Account</h1>
				<form onSubmit={handleSubmit} formNoValidate className='form-form'>
					<div className="form-item">
						<label htmlFor="firstName">First Name</label>
						<input
							className={`form-item__input ${!!errors.firstName ? 'form-item__input--err' : ''}`}
							type="text"
							placeholder="e.g. Serverus"
							name="firstName"
							formNoValidate
							onChange={handleFirstName} />
						{!!errors.firstName ? <span className='form-item__error'>{errors.firstName}</span> : null}
					</div>
					<div className="form-item">
						<label htmlFor="lastName">Last Name</label>
						<input
							className={`form-item__input ${!!errors.lastName ? 'form-item__input--err' : ''}`}
							type="text"
							placeholder="e.g. Snape"
							name="lastName"
							formNoValidate
							onChange={handleLasttName} />
						{!!errors.lastName ? <span className='form-item__error'>{errors.lastName}</span> : null}
					</div>
					<div className="form-item">
						<label htmlFor="email">Email</label>
						<input
							className={`form-item__input ${!!errors.email ? 'form-item__input--err' : ''}`}
							type="text"
							placeholder="e.g. serverus@hogwarts.edu"
							name="email"
							formNoValidate
							onChange={handleEmail} />
						{!!errors.email ? <span className='form-item__error'>{errors.email}</span> : null}
					</div>
					<div className="form-item">
						<label htmlFor="password">Password</label>
						<input
							className={`form-item__input ${!!errors.password || !!errors.confirm ? 'form-item__input--err' : ''}`}
							type="password"
							placeholder="Something Secret! (Shhh..)"
							name="password"
							formNoValidate
							onChange={handlePassword} />
						{!!errors.password ? <span className='form-item__error'>{errors.password}</span> : null}
					</div>
					<div className="form-item">
						<label htmlFor="confirm">Confirm Password</label>
						<input
							className={`form-item__input ${!!errors.confirm ? 'form-item__input--err' : ''}`}
							type="password"
							placeholder="Same Secret!"
							name="confirm"
							formNoValidate
							onChange={handleConfirm} />
						{!!errors.confirm ? <span className='form-item__error'>{errors.confirm}</span> : null}
					</div>
					{!!responseError ? <div className="form-item__error">{/* API error */}</div> : null}
					<div className="form-item">
						<input
							className={`btn btn--tertiary form-item__submit ${!!errors.confirm ? 'form-item__input--err' : ''}`}
							type="submit" value="Sign Up" />
					</div>
				</form>
			</div>
		</div>
	)
}

export default Signup;
