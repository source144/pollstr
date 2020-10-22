import React from 'react';

export function Button({
	children,
	type,
	onClick,
	className,
	onMouseEnter,
	onMouseLeave
}) {

	let _className;
	if (Array.isArray(className)) _className = `btn ${className.join(' ')}`.trim();
	else if (typeof className === 'string') _className = `btn ${className}`.trim();
	else _className = 'btn';

	return (
		<button
			type={type}
			className={_className}
			onMouseEnter={onMouseEnter}
			onMouseLeave={onMouseLeave}
			onClick={onClick}
		>
			{children}
		</button>
	);
}

export default Button;