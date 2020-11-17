import React, { useState, useEffect } from 'react'
import { Redirect, useParams } from 'react-router-dom';
import LoadingOverlay from 'react-loading-overlay';
import { toast } from 'react-toastify'
import { PushSpinner } from 'react-spinners-kit'
import axios from 'axios';
import { setWebTitle } from '../../../utils';

const Verify = () => {
	const [redirect, setRedirect] = useState(false);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState('');

	// Params
	const { id, token } = useParams();

	// TODO : dispatch to a gloabl loader
	// Perform once
	useEffect(() => {
		setWebTitle("Verifying Account (Loading...)")
		setLoading(true);
		axios.post(`/auth/verify/${id}`, { token })
			.then(response => {
				setWebTitle("Verifying Account (Success)")
				setLoading(false);
				toast('Account Verified!', { position: "top-center", autoClose: 5000 });
				setLoading(false);
				setRedirect(true);
			})
			.catch(error => {
				setWebTitle("Verifying Account (Error)")
				setLoading(false);

				const errorData = error.response ? error.response.data : {};
				const errorMsg = error.response && error.response.data ? (error.response.data.message ? error.response.data.message : (typeof error.response.data.error === 'string' ? error.response.data.error : error.message)) : error.message;
				setError(errorMsg);
			});
	}, [])


	if (redirect)
		return (<Redirect to="/login" />);

	// TODO : spinner while processing
	return (

		<LoadingOverlay
			active={loading}
			spinner={<PushSpinner size={80} color={'#55c57a'} />}
			text='Loading stuff'
		>
			<div className="form-centered-container">
				<div className="form-form-wrapper">
					<h1 className='form-title'>User Verification</h1>
					{/* TODO : dispatch to a gloabl loader */}
					{error ? <div style={{ alignSelf: 'center', fontWeight: 600 }} className="form-item__error">{error}</div> : <h1>{loading ? 'Loading...' : 'Verified!'}</h1>}
					{/* TODO : promt to resend verification to user if there was an error or a specific kind of error */}
				</div>
			</div>
		</LoadingOverlay>
	)

}


export default Verify;

