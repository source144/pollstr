import React from 'react';
import { Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authLogout } from '../../../store/actions/authActions';
import _ from 'lodash';

import "./Landing.css"

const Landing = () => {
	const { auth, global_loading } = useSelector(state => state.auth)

	const dispatch = useDispatch();
	const hasAuth = !_.isEmpty(auth);

	const userOptions = <>
		<li onClick={global_loading ? undefined : () => dispatch(authLogout())}>
			<Link to="/">Logout</Link>
		</li>
	</>
	const guestOptions = <>
		<li><Link to="/login">Sign In</Link></li>
		<li><Link to="/signup">Sign Up</Link></li>
	</>
	const authButtons = hasAuth ? userOptions : guestOptions;

	return (
		<div className="landing-centered-container">
			<div className="landing-header">
				<div className="landing-header--primary landing-header--primary-animated">
					Pollstr
				</div>
				<div className="landing-header--secondary">
					Polling Intuitively
				</div>
			</div>
			<div className="form-form-wrapper landing-menu">
				<ul>
					<li>
						<Link to="/polls/create">
							Create
						</Link>
					</li>
					<li>
						<Link to="/polls">
							Manage
						</Link>
					</li>
					{authButtons}
				</ul>
			</div>
		</div>
	);
};

export default Landing;