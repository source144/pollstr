import _ from 'lodash';
import { MODAL_CLOSE, MODAL_OPEN } from '../actions/types/modalTypes'

const initState = { isOpen: false };
const modalReducer = (state = initState, action) => {

	switch (action.type) {
		case MODAL_OPEN: return { ...initState, isOpen: true };
		case MODAL_CLOSE: return { ...initState, isOpen: false };
		default: return state;
	}
}

export default modalReducer;