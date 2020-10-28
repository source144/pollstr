import React, { useState, useEffect } from 'react'
import { useDispatch } from 'react-redux';
import { authRefresh } from './store/actions/authActions'


export default ({ children }) => {

	const [load, setLoad] = useState(undefined);
	const dispatch = useDispatch();

	// On first load only
	useEffect(() => {
		const refresh = localStorage.getItem('refresh');
		if (refresh) dispatch(authRefresh(refresh))

	}, [load])

	return (
		<>{children}</>
	);
}