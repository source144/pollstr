import React, { useRef } from 'react'
import CaretPositioning from './util/EditCaretPositioning';
import _ from 'lodash';

import "./HashtagTextArea.css";

const isTag = /^\#(?!_)\w+/
const splitTags = /\B(\#(?!_)\w+\b)(?!#)/

// Other tested regex
// const splitTags = /\B(\#[a-zA-Z0-0_]+\b)(?!#)/ // <- using this one
// const splitTags = /([#|＃][^\s]+)/g


const HashtagTextArea = ({ placeholder, className = "HashtagTextArea", singleline = false, newlines = false, tagClass = 'inputHashtag', onChange }) => {

	const editable = useRef();

	const handlePaste = (e) => {
		e.preventDefault();

		let text = (e.originalEvent || e).clipboardData.getData('text/plain');
		if (!newlines) text = text.replace(/[\r\n]+/g, ' ');

		document.execCommand("insertHTML", false, text);
	}

	const handleEdit = (e) => {

		// Undo and Redo not supported currently.
		if (e.nativeEvent && (e.nativeEvent.inputType === 'historyUndo' || e.nativeEvent.inputType === 'historyRedo'))
			return;

		// Handle Caret position
		// Credit to @Wronski - https://stackoverflow.com/a/55887417/9382757
		let savedCaretPosition = CaretPositioning.saveSelection(editable.current);

		// Split the content into hashtags and non hashtags
		// const content = newlines ? editable.current.innerText : editable.current.textContent.replace(/\s\s+/g, ' ');
		let _content = editable.current.innerText;
		if (!newlines) _content = _content.replace(/[\r\n]+/g, ' ');

		const split = _content.split(splitTags);
		const styled = _.map(split, (segment) => {
			if (segment.match(isTag))
				return `<span class="${tagClass}">${segment}</span>`
			else return segment;
		}).join('');

		// Replace the unstyled content
		editable.current.innerHTML = styled;
		CaretPositioning.restoreSelection(editable.current, savedCaretPosition);

		// Grow text box if needed
		if (!singleline) {
			editable.current.style.height = "1px";
			const _newHeight = Math.max(editable.current.scrollHeight + 4, 70);
			editable.current.style.height = `${_newHeight > 70 ? _newHeight + 4 : _newHeight}px`;
		}

		console.log(_content);
		onChange(editable.current.innerText);
	}

	return (
		<>
			<div
				contentEditable
				suppressContentEditableWarning
				ref={editable}
				onPaste={handlePaste}
				onInput={handleEdit}
				background='red'
				width='200px'
				minHeight='200px'
				className={`__HashtagTextAreaComponent__ __HashtagTextAreaComponent--placeholder__ ${className} ${singleline ? "__HashtagTextAreaComponent-overflow-hidden__" : ""}`}
				placeholder={placeholder}
			>
			</div>
		</>
	)
}

export default HashtagTextArea;