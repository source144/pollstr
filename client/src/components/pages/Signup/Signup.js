import React, { useEffect } from 'react'
import { setWebTitle } from '../../../utils';
import SignUpForm from '../../forms/SignupForm';
import './Signup.css';

const Signup = () => {

	useEffect(() => {
		setWebTitle("Sign Up");
	}, []);

	return (
		<div className="form-centered-container">
			<SignUpForm />
		</div>
	)
}

export default Signup;
