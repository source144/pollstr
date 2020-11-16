import { MODAL_CLOSE, MODAL_OPEN, MODAL_FADE } from './types/modalTypes'

let modalCloseBtnEvnt;
let modalKeyPressEvnt;
let placeholder;
let container;
let closebtn;

export const modalOpen = (ref = undefined) => {
	setTimeout(() => {
		container = document.querySelector('.RMM__container.RMM__container--is-active');
		placeholder = document.querySelector('.RMM__container.RMM__container--is-active .RMM__placeholder');

		if (ref && ref.current) closebtn = ref.current.querySelector('.RMM__container .RMM__close-button');
		else closebtn = document.querySelector('.RMM__container .RMM__close-button');


		// Disable scrolling while modal is open
		const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
		const scrollLeft = window.pageXOffset || document.documentElement.scrollLeft;
		window.onscroll = function () { window.scrollTo(scrollLeft, scrollTop); };

		if (ref && ref.current && placeholder) {
			const rect = ref.current.getBoundingClientRect();
			placeholder.style.top = `${Math.floor(rect.top)}px`;
			placeholder.style.left = `${Math.floor(rect.left)}px`;
		}

		if (closebtn && container) {
			if (modalCloseBtnEvnt) closebtn.removeEventListener('click', modalCloseBtnEvnt);
			modalCloseBtnEvnt = function () {
				if (container)
					container.classList.add("opacity-0");
			}
			modalKeyPressEvnt = function (e) {
				if (container && e.key === "Escape")
					container.classList.add("opacity-0");
			}

			document.body.addEventListener('keydown', modalKeyPressEvnt)
			closebtn.addEventListener('click', modalCloseBtnEvnt);
		}

	}, 1)

	return ({ type: MODAL_OPEN })
}

export const modalClose = (ref = undefined) => {
	placeholder = document.querySelector('.RMM__container.RMM__container--is-active .RMM__placeholder');

	// Enable scrolling
	window.onscroll = function () { };


	if (ref && ref.current && placeholder) {
		const rect = ref.current.getBoundingClientRect();
		placeholder.style.top = `${Math.floor(rect.top)}px`;
		placeholder.style.left = `${Math.floor(rect.left)}px`;
	}

	if (closebtn) {
		closebtn.removeEventListener('click', modalCloseBtnEvnt);
		document.body.removeEventListener('keydown', modalKeyPressEvnt);
		container = closebtn = modalCloseBtnEvnt = modalKeyPressEvnt = undefined;
	}

	return ({ type: MODAL_CLOSE });
}


export const modalStatFade = (ref = undefined) => {
	// Enable scrolling
	window.onscroll = function () { };

	setTimeout(() => {
		if (modalCloseBtnEvnt) modalCloseBtnEvnt()
	}, 50);

	return ({ type: MODAL_FADE });
}