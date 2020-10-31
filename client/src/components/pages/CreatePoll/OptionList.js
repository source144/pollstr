import React from 'react'
import { Draggable } from 'react-beautiful-dnd';
import Option from './Option';


export default ({ options, onChange }) =>
	options.map((option, index) =>
		<Draggable
			draggableId={`option-${option.id}`}
			key={`option-${option.id}`}
			index={index}>
			{(provided) =>
				<div ref={provided.innerRef}
					{...provided.dragHandleProps}
					{...provided.dragHandleProps}
				>
					<Option
						id={option.id}
						key={`option-${option.id}`}
						index={index}
						value={option.value}
						onChange={onChange}
						hasError={option.error}
						deleteable={options.length > 2}
					/>
					{provided.placeholder}
				</div>
			}
		</Draggable>
	);