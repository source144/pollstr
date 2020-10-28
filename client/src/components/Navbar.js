import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { authLogin } from '../store/actions/authActions';
import { Button } from './Button';
import { Dropdown } from './Dropdown';
import { authLogout } from '../store/actions/authActions'
import _ from 'lodash';


import './Navbar.css';


// const signUpNav = (
// 	<li className="nav-item">
// 		<Link to='/contact-us' className='nav-link' onClick={closeMobileMenu}>
// 			Contact Us
// 		</Link>
// 	</li>
// );



function Navbar() {

	const { redirect, setRedirect } = useState(undefined);
	const { auth, global_loading, gloabl_error } = useSelector(state => state.auth);
	const dispatch = useDispatch();
	const hasAuth = !_.isEmpty(auth);

	const [click, setClick] = useState(false);
	const [dropdown, setDropdown] = useState(false);

	// No parent selector (:has() only works with jQuery.. ><')
	// Suggested in https://stackoverflow.com/a/51628934/9382757
	// Using that until a more dynamic/modular implementation is used
	const location = useLocation();
	const activeNavClass = (route) => { return location.pathname === route ? "nav-item--active" : null }

	const handleClick = () => setClick(!click);
	const closeMobileMenu = () => setClick(false);

	const onMouseEnter = () => setDropdown(window.innerWidth > 960);
	const onMouseLeave = () => setDropdown(false);

	const signInNav = (
		<li className={["nav-item", activeNavClass('/login')].join(' ')}>
			<Link to='/login' className='nav-link' onClick={closeMobileMenu}>
				Sign In
			</Link>
		</li>
	);

	const profileNav = (auth) => {
		const DISPLAY_NAME = hasAuth ? (auth.firstName ? auth.firstName : auth.email) : "temp";
		return (
			<>
				<li className={["nav-item", activeNavClass('/profile')].join(' ')} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
					<Link to='/profile' className='nav-link' onClick={closeMobileMenu}>
						{DISPLAY_NAME} <i className='fas fa-caret-down' />
					</Link>
					{/* {dropdown && <Dropdown /> /* TODO: dropdown with item props*/}
				</li>
				<li className="nav-item" onClick={() => !global_loading ? dispatch(authLogout()) : undefined}>
					<Link to='/profile' className='nav-link'>
						Sign Out
				</Link>
				</li>

			</>
		)
	};

	return (
		<>
			<nav className="navbar">
				<Link to="/" className="navbar-logo">
					<span className='navbar-logo-text'>Pollstr</span> <i className="navbar-logo__icon fas fa-volleyball-ball" />
				</Link>
				<div className={click ? "navbar-expand active" : "navbar-expand"} onClick={handleClick}>
					<span className="navbar-expand__icon" />
				</div>
				{/* <div className="menu-icon" onClick={handleClick}>
					<i className={click ? 'fas fa-times' : 'fas fa-bars'} />
				</div> */}
				<ul className={click ? 'nav-menu active' : 'nav-menu'}>
					<li className={["nav-item", activeNavClass('/')].join(' ')}>
						<Link to='/' className='nav-link' onClick={closeMobileMenu}>
							Home
						</Link>
					</li>
					<li className={["nav-item", activeNavClass('/contact-us')].join(' ')}>
						<Link to='/contact-us' className='nav-link' onClick={closeMobileMenu}>
							Contact Us
						</Link>
					</li>
					<li className={["nav-item", activeNavClass('/polls')].join(' ')} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
						<Link to='/polls' className='nav-link' onClick={closeMobileMenu}>
							Polls <i className='fas fa-caret-down' />
						</Link>
						{dropdown && <Dropdown />}
					</li>
					{hasAuth ? profileNav(auth) : signInNav}
					<li className="nav-item mobile-only">
						<Link to={hasAuth ? '/' : '/signup'} className='nav-link' onClick={closeMobileMenu}>
							{hasAuth ? "Create" : "Sign Up"}
						</Link>
					</li>
				</ul>
				<Link to={hasAuth ? '/' : '/signup'} className="desktop-only">
					<Button className="btn--primary-outline">{hasAuth ? "Create" : "Sign Up"}</Button>
				</Link>
			</nav>
		</>
	)
}


export default Navbar;