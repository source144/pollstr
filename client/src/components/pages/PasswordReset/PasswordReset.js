import React, { useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom';


const lowerRegex = /(?=.*[a-z])/
const upperRegex = /(?=.*[A-Z])/
const numbrRegex = /(?=.*[0-9])/
const PW_MIN_LENGTH = 8;

const checkForm = (payload) => {
	if (!payload || typeof payload !== 'object') { console.log('invalid payload'); return; }

	const errors = {
		password: '',
		confirm: ''
	};
	const pwDetails = [];
	let pwLength;


	// Trim the payload
	Object.keys(payload).map(function (key, index) { payload[key] = payload[key].trim(); });

	if (!payload.password) errors.password = 'A password is required';
	else {
		if (!lowerRegex.test(payload.password)) pwDetails.push('1 lower case letter');
		if (!upperRegex.test(payload.password)) pwDetails.push('1 upper case letter');
		if (!numbrRegex.test(payload.password)) pwDetails.push('1 number');

		if (payload.password.length < PW_MIN_LENGTH) pwLength = `be at least 8 letters${!!pwDetails.length ? ',' : ''} `;

		if (pwDetails.length || pwLength)
			errors.password = `Password must ${pwLength ? pwLength : ''}contain ${pwDetails.slice(0, -1).join(', ')}${pwDetails.length >= 2 ? ` and ${pwDetails.pop()}` : ''}`;
	}

	if (!errors.password && payload.password !== payload.confirm) errors.confirm = "passwords don't match";

	return errors;
}

const PasswordReset = () => {
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');
	const [responseError, setResponseError] = useState('');

	// Params
	// const { id } = useParams();
	// const token = new URLSearchParams(useLocation().search).get('token');
	
	// Params
	const { id, token } = useParams();
	console.log(id, token);

	const [errors, setErrors] = useState({
		password: '',
		confirm: ''
	});

	const getPayload = () => ({
		token,
		password,
		confirm
	});

	const handlePassword = e => setPassword(e.target.value);
	const handleConfirm = e => setConfirm(e.target.value);
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

	// TODO : Check if reset password is valid, then render
	// TODO : display error if invalid

	return (
		<div className="form-centered-container">
			<div className="form-form-wrapper">
				<h1 className='form-title'>Reset Password</h1>
				<div className="form-description form--mb1"><p>Please enter your new password below.</p></div>
				<form onSubmit={handleSubmit} formNoValidate className='form-form'>
					<div className="form-item">
						<label htmlFor="password">New Password</label>
						<div className='form-item-wrapper'>
							<input
								className={`form-item__input ${!!errors.password || !!errors.confirm ? 'form-item__input--err' : ''}`}
								type="password"
								placeholder="Something Secret! (Shhh..)"
								// placeholder="e.g. CaputDraconis420"
								name="password"
								formNoValidate
								onChange={handlePassword} />
							<span className='form-item__input-icon'><i className="fas fa-lock"></i></span>
						</div>
						{!!errors.password ? <span className='form-item__error'>{errors.password}</span> : null}
					</div>
					<div className="form-item">
						<label htmlFor="confirm">Confirm New Password</label>
						<div className='form-item-wrapper'>
							<input
								className={`form-item__input ${!!errors.confirm ? 'form-item__input--err' : ''}`}
								type="password"
								placeholder="Same Secret!"
								name="confirm"
								formNoValidate
								onChange={handleConfirm} />
							<span className='form-item__input-icon'><i className="fas fa-key"></i></span>
						</div>
						{!!errors.confirm ? <span className='form-item__error'>{errors.confirm}</span> : null}
					</div>
					{!!responseError ? <div className="form-item__error">{/* API error */}</div> : null}
					<div className="form-item">
						<input
							className={`btn btn--tertiary form-item__submit ${!!errors.confirm ? 'form-item__input--err' : ''}`}
							type="submit" value="Send Reset Link " />
					</div>
					<div className="form-switch"><p>Know your password? <Link to='/login' className='form-switch-action'>Sign In</Link></p></div>
				</form>
			</div>
		</div>
	)

}


export default PasswordReset;

