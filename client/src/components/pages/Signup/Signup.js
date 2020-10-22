import React, { useState } from 'react'
import './Signup.css';


const Signup = () => {


	const [firstName, setFirstName] = useState('');
	const [lastName, setLasttName] = useState('');
	const [email, setEmail] = useState('');
	const [password, setPassword] = useState('');
	const [confirm, setConfirm] = useState('');

	// TODO: novalidate


	const getPayload = () => ({
		firstName,
		lastName,
		email,
		password,
		confirm,
	});

	const handleSubmit = e => {
		e.preventDefault();
		console.log("Handle Submit\n", getPayload());
	}
	const handleFirstName = e => setFirstName(e.target.value);
	const handleLasttName = e => setLasttName(e.target.value);
	const handleEmail = e => setEmail(e.target.value);
	const handlePassword = e => setPassword(e.target.value);
	const handleConfirm = e => setConfirm(e.target.value);


	// TODO: add a span with symbol of field

	return (
		<div className="signup">
			<div className="signup-form-wrapper">
				<h1>Create Account</h1>
				<form onSubmit={handleSubmit} formNoValidate>
					<div className="firstName">
						<label htmlFor="firstName">First Name</label>
						<input
							type="text"
							placeholder="e.g. Serverus"
							name="firstName"
							formNoValidate
							onChange={handleFirstName} />
						<span>{/* ICON GOES HERE */}</span>
					</div>
					<div className="lastName">
						<label htmlFor="lastName">Last Name</label>
						<input
							type="text"
							placeholder="e.g. Snape"
							name="lastName"
							formNoValidate
							onChange={handleLasttName} />
						<span>{/* ICON GOES HERE */}</span>
					</div>
					<div className="email">
						<label htmlFor="email">Email</label>
						<input
							type="email"
							placeholder="e.g. serverus@hogwarts.edu"
							name="email"
							formNoValidate
							onChange={handleEmail} />
						<span>{/* ICON GOES HERE */}</span>
					</div>
					<div className="password">
						<label htmlFor="password">Password</label>
						<input
							type="password"
							placeholder="Something Secret! (Shhh..)"
							name="password"
							formNoValidate
							onChange={handlePassword} />
						<span>{/* ICON GOES HERE */}</span>
					</div>
					<div className="confirm">
						<label htmlFor="confirm">Confirm Password</label>
						<input
							type="password"
							placeholder="Same Secret!"
							name="confirm"
							formNoValidate
							onChange={handleConfirm} />
						<span>{/* ICON GOES HERE */}</span>
					</div>
					<input type="submit" />
				</form>
			</div>
		</div>
	)
}

export default Signup;
