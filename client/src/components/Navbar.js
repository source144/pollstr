import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from './Button';
import { Dropdown } from './Dropdown';
import './Navbar.css';


// const signUpNav = (
// 	<li className="nav-item">
// 		<Link to='/contact-us' className='nav-link' onClick={closeMobileMenu}>
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
			<Link to='/login' className='nav-link' onClick={closeMobileMenu}>
				Sign In
			</Link>
		</li>
	);
	const profileNav = (
		<li className="nav-item" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
			<Link to='/profile' className='nav-link' onClick={closeMobileMenu}>
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
						<Link to='/' className='nav-link' onClick={closeMobileMenu}>
							Home
						</Link>
					</li>
					<li className="nav-item">
						<Link to='/contact-us' className='nav-link' onClick={closeMobileMenu}>
							Contact Us
						</Link>
					</li>
					<li className="nav-item" onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave}>
						<Link to='/polls' className='nav-link' onClick={closeMobileMenu}>
							Polls <i className='fas fa-caret-down' />
						</Link>
						{dropdown && <Dropdown />}
					</li>
					{AUTH ? profileNav : signInNav}
					<li className="nav-item mobile-only">
						<Link to='/signup' className='nav-link' onClick={closeMobileMenu}>
							Sign Up
						</Link>
					</li>
				</ul>
				<Link to='/signup' className="desktop-only">
					<Button className="btn--primary-outline" onClick={() => console.log("clicked")}>Sign Up</Button>
				</Link>
			</nav>
		</>
	)
}


export default Navbar;