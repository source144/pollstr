import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { Link, Redirect } from 'react-router-dom';
import LoadingOverlay from 'react-loading-overlay';
import { toast } from 'react-toastify'
import { PushSpinner } from 'react-spinners-kit'
import axios from 'axios';
import { authResendVerification } from '../../../store/actions/authActions';
import { setWebTitle } from '../../../utils';

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
	const [needsVerification, setNeedsVerification] = useState(undefined);
	const { verification_sent, error: auth_error,
		global_loading: auth_loading,
		loading: verification_loading,
	} = useSelector(state => state.auth)
	const dispatch = useDispatch()

	const [errors, setErrors] = useState({
		email: '',
	});

	const getPayload = () => ({
		email
	});

	const handleResendVerification = e => {
		e.preventDefault();

		// Prevent multiple requests
		if (auth_loading || verification_loading)
			return;

		// Shouldn't be called. (Do nothing)
		if (!needsVerification)
			return;

		// Resend Verification Email to User
		dispatch(authResendVerification(needsVerification))
	}

	const handleEmail = e => setEmail(e.target.value);
	const handleSubmit = e => {
		e.preventDefault();


		let valid = true;
		const _errors = checkForm(getPayload());
		Object.keys(_errors).forEach(key => valid = valid && !_errors[key]);


		// TODO : dispatch to a gloabl loader
		if (valid) {
			setNeedsVerification(undefined);
			setLoading(true);
			axios.post('/auth/password/forgot', { email })
				.then(response => {
					setLoading(false);
					toast('Password reset link sent!', { position: "top-center", autoClose: 5000 });
					setRedirect(true);
				})
				.catch(error => {
					setLoading(false);

					const errorData = error.response ? error.response.data : {};
					const errorMsg = error.response && error.response.data ? (error.response.data.message ? error.response.data.message : (typeof error.response.data.error === 'string' ? error.response.data.error : error.message)) : error.message;

					if (error.response && error.response.status === 426 && error.config.data)
						setNeedsVerification(JSON.parse(error.config.data).email);

					setResponseError(errorMsg);
				});
			// Dispatch login request
			// Handle Error
			// or Forward Home
		} else setErrors(_errors);
	}

	useEffect(() => {
		if (verification_sent !== undefined) {
			if (verification_sent === true)
				setNeedsVerification(undefined);
			setResponseError(auth_error)
		}
	}, [verification_sent, auth_error])

	useEffect(() => {
		setWebTitle("Forgot Password");
	}, []);

	if (redirect)
		return (<Redirect to="/login" />);

	return (

		<div className="form-centered-container">
			<LoadingOverlay
				active={loading}
				spinner={<PushSpinner color={'#55c57a'} />}
				classNamePrefix='modal-loader-'
			>
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
						{!!responseError ? <div className="form-item__error">{responseError}{!!needsVerification ? <span>! <a href='#' className='form-switch-action' onClick={handleResendVerification}>Resend Here</a></span> : undefined}</div> : null}
						<div className="form-item">
							<input
								className={`btn btn--tertiary form-item__submit ${!!errors.confirm ? 'form-item__input--err' : ''}`}
								disabled={needsVerification} type="submit" value="Send Reset Link " />
						</div>
						<div className="form-switch"><p>Know your password? <Link to='/login' className='form-switch-action'>Sign In</Link></p></div>
					</form>
				</div>
			</LoadingOverlay >
		</div>
	)

}


export default PasswordForgot;

