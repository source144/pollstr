import { MODAL_CLOSE, MODAL_OPEN } from './types/modalTypes'

let modalCloseBtnEvnt;
let modalKeyPressEvnt;
let placeholder;
let closebtn;
export const modalOpen = () => {
	setTimeout(() => {
		placeholder = document.querySelector('.RMM__container.RMM__container--is-active');
		closebtn = document.querySelector('.RMM__container .RMM__close-button')

		if (closebtn && placeholder) {
			console.log(closebtn)
			if (modalCloseBtnEvnt) closebtn.removeEventListener('click', modalCloseBtnEvnt);
			modalCloseBtnEvnt = function () {
				if (placeholder)
					placeholder.classList.add("opacity-0");
			}
			modalKeyPressEvnt = function (e) {
				if (placeholder && e.key === "Escape")
					placeholder.classList.add("opacity-0");
			}

			document.body.addEventListener('keydown', modalKeyPressEvnt)
			closebtn.addEventListener('click', modalCloseBtnEvnt);
		}

		console.log(placeholder)
		console.log(closebtn)
	}, 1)

	return ({ type: MODAL_OPEN })
}

export const modalClose = () => {
	console.log(closebtn)
	console.log(placeholder)

	if (closebtn) {
		closebtn.removeEventListener('click', modalCloseBtnEvnt);
		document.body.removeEventListener('keydown', modalKeyPressEvnt);
		placeholder = closebtn = modalCloseBtnEvnt = modalKeyPressEvnt = undefined;
	}

	return ({ type: MODAL_CLOSE });
}
