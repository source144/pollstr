import React, { useState, useEffect } from 'react'
import { Redirect, useParams } from 'react-router-dom';
import axios from 'axios';

const Verify = () => {
	const [load, setLoad] = useState(undefined);
	const [redirect, setRedirect] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	// Params
	const { id, token } = useParams();
	console.log(id, token);

	// Perform once
	useEffect(() => {
		setLoading(true);
		axios.post(`/auth/verify/${id}`, { token })
			.then(response => {
				setLoading(false);
				setTimeout(() => {
					setRedirect(true);
				}, 700);
			})
			.catch(error => {
				const errorData = error.response ? error.response.data : {};
				const errorMsg = error.response && error.response.data ? (error.response.data.error ? error.response.data.error : error.response.data.message) : error.message;
				setError(errorMsg);
			});
	}, [load])


	if (redirect)
		return (<Redirect to="/login" />);

	// TODO : spinner while processing
	return (
		<div className="form-centered-container">
			<div className="form-form-wrapper">
				<h1 className='form-title'>User Verification</h1>
				{error ? <div style={{ alignSelf: 'center', fontWeight: 600 }} className="form-item__error">{error}</div> : <h1>{loading ? 'Loading...' : 'Verified!'}</h1>}
				{/* TODO : promt to resend verification to user if there was an error or a specific kind of error */}
			</div>
		</div>
	)

}


export default Verify;

