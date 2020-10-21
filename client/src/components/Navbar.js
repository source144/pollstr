import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { Dropdown } from './Dropdown';
import './Navbar.css';


// const signUpNav = (
// 	<li className="nav-item">
// 		<Link to='/contact-us' className='nav-links' onClick={closeMobileMenu}>
// 			Contact Us
// 		</Link>
// 	</li>
// );

function Navbar() {
	const [click, setClick] = useState(false);
	const [dropdown, setDropdown] = useState(false);

	let AUTH = false;

	const handleClick = () => setClick(!click);
	const closeMobileMenu = () => setClick(false);

	const onMouseEnter = () => setDropdown(window.innerWidth >= 960);
	const onMouseLeave = () => setDropdown(false);

	const signInNav = (
		<li className="nav-item">
			<Link to='/login' className='nav-links' onClick={closeMobileMenu}>
				Sign In
			</Link>
		</li>
	);
	const profileNav = (
		<li className="nav-item" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
			<Link to='/profile' className='nav-links' onClick={closeMobileMenu}>
				Polls <i className='fas fa-caret-down' />
			</Link>
			{dropdown && <Dropdown /> /* TODO: dropdown with item props*/}
		</li>
	);

	return (
		<>
			<nav className="navbar">
				<Link to="/" className="navbar-logo">
					Pollstr <i className="navbar-logo__icon fas fa-volleyball-ball" />
				</Link>
				<div className={click ? "navbar-expand active" : "navbar-expand"} onClick={handleClick}>
					<span className="navbar-expand__icon" />
				</div>
				{/* <div className="menu-icon" onClick={handleClick}>
					<i className={click ? 'fas fa-times' : 'fas fa-bars'} />
				</div> */}
				<ul className={click ? 'nav-menu active' : 'nav-menu'}>
					<li className="nav-item">
						<Link to='/' className='nav-links' onClick={closeMobileMenu}>
							Home
						</Link>
					</li>
					<li className="nav-item">
						<Link to='/contact-us' className='nav-links' onClick={closeMobileMenu}>
							Contact Us
						</Link>
					</li>
					<li className="nav-item" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
						<Link to='/polls' className='nav-links' onClick={closeMobileMenu}>
							Polls <i className='fas fa-caret-down' />
						</Link>
						{dropdown && <Dropdown />}
					</li>
					{AUTH ? profileNav : signInNav}
					<li>
						<Link to='/register' className='nav-links-mobile' onClick={closeMobileMenu}>
							Sign Up
						</Link>
					</li>
				</ul>
				<div className="navbar__btn"><Button /></div>
			</nav>
		</>
	)
}


export default Navbar;