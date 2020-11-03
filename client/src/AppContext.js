import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { authRefresh } from './store/actions/authActions'
import LoadingOverlay from 'react-loading-overlay';
import { RotateSpinner } from 'react-spinners-kit'


export default ({ children }) => {

	// TODO : loading msg
	const global_loading = useSelector(state => state.auth.global_loading)
	const auth_loading = useSelector(state => state.auth.loading)
	const poll_loading = useSelector(state => state.poll.loading)

	const [load, setLoad] = useState(undefined);
	const dispatch = useDispatch();

	const loading = !!auth_loading || !!poll_loading || !!global_loading;

	// On first load only
	useEffect(() => {
		const refresh = localStorage.getItem('refresh');
		if (refresh) dispatch(authRefresh(refresh))

	}, [load])

	return (
		<>
			<LoadingOverlay
				active={loading}
				spinner={<RotateSpinner size={80} color={'#55c57a'} />}
				text='Loading stuff'
			>
				{children}
			</LoadingOverlay>
		</>
	);
}