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
			.catch(response => {
				const errorData = error.response ? error.response.data : {};
				const errorMsg = error.response && error.response.data ? error.response.data.error : error.message;

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
				<input
					className={`btn btn--tertiary form-item__submit ${false ? 'form-item__input--err' : ''}`}
					type="submit" value="Loading Modal Here" />
				{error ? <div className="form-item__error">{error}</div> : <h1>{loading ? 'Loading...' : 'Verified!'}</h1>}
			</div>
		</div>
	)

}


export default Verify;

