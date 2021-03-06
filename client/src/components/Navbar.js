import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
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

// TODO : Modular Nav items
/*
const guestNav = [
	{
		text: "Home",
		path: "/",
		onClick: undefined,
		style: "normal",
		dropdown: undefined,
	},
	{
		text: "Contact Us",
		path: "/contact-us",
		onClick: undefined,
		style: "normal",
		dropdown: undefined,
	},
	{
		text: "Polls",
		path: "/polls",
		onClick: undefined,
		style: "normal",
		dropdown: [
			{
				text: "hot",
				path: "/polls/hot",
				onClick: undefined,
				style: "normal"
			},
			{
				text: "manage",
				path: "/polls/manage",
				onClick: undefined,
				style: "normal"
			},
			{
				text: "hot",
				path: "/polls/create",
				onClick: undefined,
				style: "normal"
			}
		],
	},
	{
		text: "Sign In",
		path: "/login",
		onClick: undefined,
		style: "normal",
		dropdown: undefined,
	}
]

const userNav = [
	{
		text: "Home",
		path: "/",
		onClick: undefined,
		style: "normal",
		dropdown: undefined,
	},
	{
		text: "Contact Us",
		path: "/contact-us",
		onClick: undefined,
		style: "normal",
		dropdown: undefined,
	},
	{
		text: "Polls",
		path: "/polls",
		onClick: undefined,
		style: "normal",
		dropdown: [
			{
				text: "hot",
				path: "/polls/hot",
				onClick: undefined,
				style: "normal"
			},
			{
				text: "manage",
				path: "/polls/manage",
				onClick: undefined,
				style: "normal"
			},
			{
				text: "hot",
				path: "/polls/create",
				onClick: undefined,
				style: "normal"
			}
		],
	}
]

const userDropdown = [
	{
		text: "Inbox", // TODO : have a badge with number of messages
		path: "/user/inbox",
		onClick: undefined,
		style: "normal"
	},
	{
		text: "Groups",
		path: "/user/groups",
		onClick: undefined,
		style: "normal"
	},
	{
		text: "Polls",
		path: "/polls/manage",
		onClick: undefined,
		style: "normal"
	},
	{
		text: "Profile",
		path: "/user/profile",
		onClick: undefined,
		style: "normal"
	},
	{
		text: "Settings",
		path: "/user/settings",
		onClick: undefined,
		style: "normal"
	},
	{
		text: "logout",
		path: undefined,
		onClick: undefined, // TODO : logout
		style: "normal"
	}
]
*/

function Navbar() {

	const { auth, global_loading } = useSelector(state => state.auth);
	const { isOpen } = useSelector(state => state.modal);
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
	const DISPLAY_NAME = hasAuth ? (auth.firstName ? auth.firstName : auth.email) : "temp";

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
		return (
			<>
				<li className={["nav-item", activeNavClass('/profile')].join(' ')}>
					{/* <Link to='/profile' className='nav-link' onClick={closeMobileMenu}> */}
					<Link className='nav-link' onClick={closeMobileMenu}>
						{DISPLAY_NAME} <i className='fas fa-caret-down' />
					</Link>
					{/* {dropdown && <Dropdown /> /* TODO: dropdown with item props*/}
				</li>
				<li className="nav-item" onClick={() => !global_loading ? dispatch(authLogout()) : undefined}>
					<Link className='nav-link'>
						Sign Out
					</Link>
				</li>
			</>
		)
	};

	return (
		<>
			<nav className="navbar" style={isOpen ? { zIndex: 4 } : null}>
				<Link to="/" className="navbar-logo">
					<span className='navbar-logo-text navbar-logo-text--gradient'>Pollstr</span> <i className="navbar-logo__icon navbar-logo__icon--gradient fas fa-volleyball-ball" />
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
					{/* <li className={["nav-item", activeNavClass('/contact-us')].join(' ')}>
						<Link to='/contact-us' className='nav-link' onClick={closeMobileMenu}>
							Contact Us
						</Link>
					</li> */}
					{/* <li className={["nav-item", activeNavClass('/polls')].join(' ')} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}> */}
					{/* <Link to='/polls' className='nav-link' onClick={closeMobileMenu}> */}
					<li className={["nav-item", activeNavClass('/polls')].join(' ')}>
						<Link to='/polls' className='nav-link' onClick={closeMobileMenu}>
							My Polls
							{/* {hasAuth ? `${DISPLAY_NAME}'s` : "My"} Polls */}
							{/* My Polls <i className='fas fa-caret-down' /> */}
						</Link>
						{dropdown && <Dropdown />}
					</li>
					<li className={[`nav-item ${hasAuth ? 'mobile-only' : ''}`, activeNavClass('/polls/create')].join(' ')}>
						<Link to='/polls/create' className='nav-link' onClick={closeMobileMenu}>
							Create
						</Link>
					</li>
					{!hasAuth ? <li className={["nav-item mobile-only", activeNavClass('/signup')].join(' ')}>
						<Link to='/signup' className='nav-link' onClick={closeMobileMenu}>
							Sign Up
						</Link>
					</li> : undefined}
					{hasAuth ? profileNav(auth) : signInNav}
				</ul>
				<Link to={hasAuth ? '/polls/create' : '/signup'} className="desktop-only">
					<Button className="btn--primary-outline">{hasAuth ? "Create" : "Sign Up"}</Button>
				</Link>
			</nav>
		</>
	)
}


export default Navbar;