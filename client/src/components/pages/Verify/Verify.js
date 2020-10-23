import React, { useState } from 'react'
import { Link, useParams, useLocation } from 'react-router-dom';

const Verify = () => {
	const [responseError, setResponseError] = useState('');

	// Params
	const { id, token } = useParams();
	console.log(id, token);

	// TODO : send to api to verify verification id and token
	// TODO : spinner while processing
	// TODO : display error if fails
	// TODO : forward to login if succeeds

	return (
		<div className="form-centered-container">
			<div className="form-form-wrapper">
				<h1 className='form-title'>User Verification</h1>
				<input
					className={`btn btn--tertiary form-item__submit ${false ? 'form-item__input--err' : ''}`}
					type="submit" value="Loading Modal Here" />
				<div className="form-description"><p>Will verify {id}, {token}</p></div>
			</div>
		</div>
	)

}


export default Verify;

