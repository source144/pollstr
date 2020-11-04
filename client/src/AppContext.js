import React, { useState, useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import { authRefresh, authFingerprint } from './store/actions/authActions'
import LoadingOverlay from 'react-loading-overlay';
import { RotateSpinner } from 'react-spinners-kit'



export default ({ children }) => {

	const dispatch = useDispatch();

	const { loading: auth_loading, global_loading, fingerprint } = useSelector(state => state.auth)
	const { loading: poll_loading } = useSelector(state => state.poll)

	// Reduce loading state to a single boolean
	const _loading = !!auth_loading || !!poll_loading || !!global_loading || !fingerprint;

	// On first load only
	useEffect(() => {
		const refresh = localStorage.getItem('refresh');

		// TODO : might need to perferom auth
		// TODO : ONLY AFTER getting fingerprint
		// Get fingerprint
		if (!fingerprint) dispatch(authFingerprint());

		// Refresh auth token
		if (refresh) dispatch(authRefresh(refresh));

	}, [])

	return (
		<>
			<LoadingOverlay
				active={_loading}
				spinner={<RotateSpinner size={80} color={'#55c57a'} />}
				text='Loading stuff'
			>
				{children}
			</LoadingOverlay>
		</>
	);
}