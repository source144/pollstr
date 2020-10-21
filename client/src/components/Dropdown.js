import React, { useState } from 'react';
import { MenuItems } from './MenuItems';
import { Link } from 'react-router-dom';
import './Dropdown.css';

export function Dropdown() {
	const [click, setClick] = useState(false);

	const handleClick = () => setClick(!click);

	return (
		<>
			<ul onClick={handleClick} className={click ? 'dropdown-menu clicked' : 'dropdown-menu'}>
				{MenuItems.map((item, index) => (
					<li className={item.li_cName} key={index} >
						<Link to={item.path}
							className={item.link_cName}
							onClick={() => setClick(false)}>
							{item.title}
						</Link>
					</li>
				))}
			</ul>
		</>
	);
}

export default Dropdown;