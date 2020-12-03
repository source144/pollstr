import React, { useEffect } from 'react';
import { Link, useHistory } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authLogout } from '../../../store/actions/authActions';
import _ from 'lodash';

import "./Landing.css"
import { setWebTitle } from '../../../utils';

const Landing = () => {
	const { auth, global_loading } = useSelector(state => state.auth)
	let history = useHistory();

	const dispatch = useDispatch();
	const hasAuth = !_.isEmpty(auth);

	const userOptions = <>
		<li onClick={global_loading ? undefined : () => dispatch(authLogout())}>
			<Link to="/">Logout</Link>
		</li>
	</>
	const guestOptions = <>
		<li onClick={() => history.push("/login")}><Link>Sign In</Link></li>
		<li onClick={() => history.push("/signup")}><Link>Sign Up</Link></li>
	</>
	const authButtons = hasAuth ? userOptions : guestOptions;

	useEffect(() => { setWebTitle(); }, []);

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
					<li onClick={() => history.push("/polls/create")}>
						<Link>
							Create
						</Link>
					</li>
					<li onClick={() => history.push("/polls")}>
						<Link>
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