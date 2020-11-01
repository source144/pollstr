import React from 'react';

export default ({ id, index, value, onChange, onDelete, placeholder = "Enter an option value", deleteable = false, hasError = undefined }) => {
	return (
		<div className="form-item">
			<div className='form-item-wrapper p-rel'>
				<div className="dragbar"><i className="fas fa-bars"></i></div>
				<input
					className={`form-item__input ${!!hasError ? 'form-item__input--err' : ''}`}
					type="text"
					placeholder={placeholder}
					name={`option-${id}`}
					formNoValidate
					onChange={(e) => onChange(index, e.target.value)}
					value={value}>
				</input>
				{deleteable ?
					<span className='form-item__input-remove' onClick={() => onDelete(index)}>
						<i className="fas fa-minus-circle"></i>
					</span>
					: undefined}
			</div>
			{ !!hasError ? <span className='form-item__error'>{hasError}</span> : null}
		</div >
	)
}