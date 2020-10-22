import React, { useState } from 'react'
import { Link } from 'react-router-dom';
import SignUpForm from '../../forms/SignupForm';
import './Signup.css';

const Signup = () => {

	return (
		<div className="signup">
			<SignUpForm />
		</div>
	)
}

export default Signup;
