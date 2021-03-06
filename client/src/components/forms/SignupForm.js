import React, { useState } from 'react';
import { Link, Redirect } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authSignup } from '../../store/actions/authActions';
import LoadingOverlay from 'react-loading-overlay';
import { toast } from 'react-toastify'
import { PushSpinner } from 'react-spinners-kit'
import './SignupForm.css';

const emailRegex = /^(([^<>()\[\]\.,;:\s@\"]+(\.[^<>()\[\]\.,;:\s@\"]+)*)|(\".+\"))@(([^<>()[\]\.,;:\s@\"]+\.)+[^<>()[\]\.,;:\s@\"]{2,})$/i;
const lowerRegex = /(?=.*[a-z])/
const upperRegex = /(?=.*[A-Z])/
const numbrRegex = /(?=.*[0-9])/
const PW_MIN_LENGTH = 8;


const checkForm = (payload) => {
	if (!payload || typeof payload !== 'object') return;

	const errors = {
		firstName: '',
		lastName: '',
		email: '',
		password: '',
		confirm: '',
	};
	const pwDetails = [];
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
			errors.password = `Password must ${pwLength ? pwLength : ''}contain ${pwDetails.length == 1 ? pwDetails.pop() : pwDetails.slice(0, -1).join(', ')}${pwDetails.length >= 2 ? ` and ${pwDetails.pop()}` : ''}`;
	}

	if (!errors.password && payload.password !== payload.confirm) errors.confirm = "passwords don't match";

	return errors;
}

const SignUpForm = () => {

	const { signup_complete, signup_loading, signup_error } = useSelector(state => state.auth)
	const dispatch = useDispatch()

	const [firstName, setFirstName] = useState('');
	const [lastName, setLasttName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');

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
		password
	});

	const handleFirstName = e => setFirstName(e.target.value);
	const handleLasttName = e => setLasttName(e.target.value);
	const handleEmail = e => setEmail(e.target.value);
	const handlePassword = e => setPassword(e.target.value);
	const handleConfirm = e => setConfirm(e.target.value);
	const handleSubmit = e => {
		e.preventDefault();

		let valid = true;
		const _auth = getPayload()
		const _errors = checkForm({ ..._auth, confirm: confirm });
		Object.keys(_errors).forEach(key => valid = valid && !_errors[key]);

		if (valid) dispatch(authSignup(_auth));

		setErrors(_errors);
	}

	// TODO : change route to home
	if (signup_complete) return <Redirect to='/' />

	return (

		<LoadingOverlay
			active={signup_loading}
			spinner={<PushSpinner size={80} color={'#55c57a'} />}
			text='Loading stuff'
		>
			<div className="form-form-wrapper">
				<h1 className='form-title'>Create Account</h1>
				<form onSubmit={handleSubmit} formNoValidate className='form-form'>
					<div className="form-item">
						<label htmlFor="firstName">First Name</label>
						<div className='form-item-wrapper'>
							<input
								className={`form-item__input ${!!errors.firstName ? 'form-item__input--err' : ''}`}
								type="text"
								placeholder="e.g. Serverus"
								name="firstName"
								formNoValidate
								onChange={handleFirstName} />
							<span className='form-item__input-icon'><i className="fas fa-user-graduate"></i></span>
						</div>
						{!!errors.firstName ? <span className='form-item__error'>{errors.firstName}</span> : null}

					</div>
					<div className="form-item">
						<label htmlFor="lastName">Last Name</label>
						<div className='form-item-wrapper'>
							<input
								className={`form-item__input ${!!errors.lastName ? 'form-item__input--err' : ''}`}
								type="text"
								placeholder="e.g. Snape"
								name="lastName"
								formNoValidate
								onChange={handleLasttName} />
							<span className='form-item__input-icon'><i className="fas fa-user-tie"></i></span>
						</div>
						{!!errors.lastName ? <span className='form-item__error'>{errors.lastName}</span> : null}
					</div>
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
					<div className="form-item">
						<label htmlFor="password">Password</label>
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
						<label htmlFor="confirm">Confirm Password</label>
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
					{!!signup_error ? <div className="form-item__error">{signup_error}</div> : null}
					<div className="form-item">
						<input
							className={`btn btn--tertiary form-item__submit ${!!errors.confirm ? 'form-item__input--err' : ''}`}
							type="submit" value="Sign Up" />
					</div>
					<div className="form-switch"><p>Already have an account? <Link to='/login' className='form-switch-action'>Sign In</Link></p></div>
				</form>
			</div>
		</LoadingOverlay>
	);
};

export default SignUpForm;