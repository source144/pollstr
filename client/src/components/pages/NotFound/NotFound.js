import React, { useEffect } from 'react'
import { setWebTitle } from '../../../utils';

const NotFound = () => {

	useEffect(() => {
		setWebTitle("404 Not Found");
	}, []);

	return <div className="form-centered-container">
		<div className="form-form-wrapper">
			<h1 className='form-title'>404 Not Found</h1>
		</div>
	</div>
};


export default NotFound;

