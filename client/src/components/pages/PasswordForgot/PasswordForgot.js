import React, { useState } from 'react'
import { Link, Redirect } from 'react-router-dom';
import axios from 'axios';

const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;


const checkForm = (payload) => {
	if (!payload || typeof payload !== 'object') return;

	const errors = {
		email: ''
	};


	// Trim the payload
	Object.keys(payload).map(function (key, index) { payload[key] = payload[key].trim(); });

	if (!payload.email) errors.email = 'An email is required';
	else if (!emailRegex.test(payload.email)) errors.email = 'Please enter a valid email';

	return errors;
}

const PasswordForgot = () => {
	const [redirect, setRedirect] = useState(undefined);
	const [loading, setLoading] = useState(undefined);
	const [email, setEmail] = useState('');
	const [responseError, setResponseError] = useState('');

	const [errors, setErrors] = useState({
		email: '',
	});

	const getPayload = () => ({
		email
	});

	const handleEmail = e => setEmail(e.target.value);
	const handleSubmit = e => {
		e.preventDefault();


		let valid = true;
		const _errors = checkForm(getPayload());
		Object.keys(_errors).forEach(key => valid = valid && !_errors[key]);


		if (valid) {
			setLoading(true);
			axios.post('/api/auth/password/forgot', { email })
				.then(response => {
					setLoading(false);
					setTimeout(() => {
						setRedirect(true);
					}, 700);
				})
				.catch(error => {
					const errorData = error.response ? error.response.data : {};
					const errorMsg = error.response && error.response.data ? (error.response.data.error ? error.response.data.error : error.response.data.message) : error.message;
	
					setResponseError(errorMsg);
				});
			// Dispatch login request
			// Handle Error
			// or Forward Home
		} else setErrors(_errors);
	}

	if (redirect)
		return (<Redirect to="/login" />);

	return (
		<div className="form-centered-container">
			<div className="form-form-wrapper">
				<h1 className='form-title'>Forgot Password</h1>
				<div className="form-description"><p>To reset your password, please enter identifying information.</p></div>
				<div className="form-description form--mb1"><p>An email would be sent to you with the reset link.</p></div>
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
							<span className='form-item__input-icon'><i className="fas fa-envelope"></i></span>
						</div>
						{!!errors.email ? <span className='form-item__error'>{errors.email}</span> : null}
					</div>
					{!!responseError ? <div className="form-item__error">{responseError}</div> : null}
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


export default PasswordForgot;

