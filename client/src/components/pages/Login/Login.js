import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import './Login.css';

const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
const lowerRegex = /(?=.*[a-z])/
const upperRegex = /(?=.*[A-Z])/
const numbrRegex = /(?=.*[0-9])/
const PW_MIN_LENGTH = 8;


const checkForm = (payload) => {
	if (!payload || typeof payload !== 'object') { console.log('invalid payload'); return; }

	const errors = {
		email: '',
		password: ''
	};
	const pwDetails = [];
	let valid = true;
	let pwLength;


	// Trim the payload
	Object.keys(payload).map(function (key, index) { payload[key] = payload[key].trim(); });

	if (!payload.email) errors.email = 'An email is required';
	else if (!emailRegex.test(payload.email)) errors.email = 'Please enter a valid email';

	if (!payload.password) errors.password = 'A password is required';

	return errors;
}


const Login = () => {

	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [responseError, setResponseError] = useState('');

	const [errors, setErrors] = useState({
		email: '',
		password: ''
	});

	const getPayload = () => ({
		email,
		password
	});

	const handleEmail = e => setEmail(e.target.value);
	const handlePassword = e => setPassword(e.target.value);
	const handleSubmit = e => {
		e.preventDefault();

		console.log('Before validation', errors);

		let valid = true;
		const _errors = checkForm(getPayload());
		Object.keys(_errors).forEach(key => valid = valid && !_errors[key]);

		console.log('After validation', _errors);
		console.log(valid);

		if (valid) {
			// Dispatch login request
			// Handle Error
			// or Forward Home
		}

		setErrors(_errors);
	}

	// TODO: add a span with symbol of field

	return (
		<div className="login">
			<div className="form-form-wrapper">
				<h1 className='form-title'>Sign In</h1>
				<form onSubmit={handleSubmit} formNoValidate className='form-form'>
					<div className="form-item">
						<label htmlFor="email">Email</label>
						<div className='form-item-wrapper'>
							<input
								className={`form-item__input ${!!errors.email ? 'form-item__input--err' : ''}`}
								type="text"
								placeholder="e.g. serverus@hogwarts.edu"
								name="email"
								formNoValidate
								onChange={handleEmail} />
							<span className='form-item__input-icon'><i class="fas fa-envelope"></i></span>
						</div>
						{!!errors.email ? <span className='form-item__error'>{errors.email}</span> : null}
					</div>
					<div className="form-item">
						<label htmlFor="password">Password</label>
						<div className='form-item-wrapper'>
							<input
								className={`form-item__input ${!!errors.password || !!errors.confirm ? 'form-item__input--err' : ''}`}
								type="password"
								// placeholder="e.g. CaputDraconis420"
								placeholder="e.g. ••••••••••••"
								name="password"
								formNoValidate
								onChange={handlePassword} />
							<span className='form-item__input-icon'><i class="fas fa-lock"></i></span>
						</div>
						{!!errors.password ? <span className='form-item__error'>{errors.password}</span> : null}
					</div>
					<div className="form-item">
						<input
							className={`btn btn--tertiary form-item__submit ${!!errors.confirm ? 'form-item__input--err' : ''}`}
							type="submit" value="Sign In " />
					</div>
					<div className="login-switch"><p>Don't have an account? <Link to='/signup' className='login-switch-action'>Sign Up</Link></p></div>
				</form>
			</div>
		</div>
	)
}

export default Login;
