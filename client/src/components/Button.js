import React from 'react';
import './Button.css';
import { Link } from 'react-router-dom';

export function Button() {
	return (
		<Link to='register'>
			<button className='btn'>Sign Up</button>
		</Link>
	);
}

export default Button;