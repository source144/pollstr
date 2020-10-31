import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { createStor } from 'redux';
import { Provider, useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import './App.css';

import store from './store/store';

import Navbar from './components/Navbar';
import Signup from './components/pages/Signup/Signup';
import Login from './components/pages/Login/Login';
import PasswordForgot from './components/pages/PasswordForgot/PasswordForgot';
import PasswordReset from './components/pages/PasswordReset/PasswordReset';
import Verify from './components/pages/Verify/Verify';
import NotFound from './components/pages/NotFound/NotFound';
import Poll from './components/pages/Poll/Poll';
import CreatePoll from './components/pages/CreatePoll/CreatePoll';
import AppContext from './AppContext';

axios.defaults.baseURL = 'https://pollstr-app.herokuapp.com/api/';
// axios.defaults.baseURL = 'https://pollstr.app/api/';
// axios.defaults.baseURL = 'http://localhost:5000/api/';

function App() {

	// const { token } = useSelector(state => state.auth.auth)

	// useEffect(() => {
	// 	const authInterceptor = axios.interceptors.response.use(
	// 		response => response,
	// 		error => {

	// 		}
	// 	);
	// 	// Dispose interceptor
	// 	return () => { axios.interceptors.response.eject(authInterceptor); }
	// }, [token])

	return (
		<>
			<Provider store={store}>
				<AppContext>
					<Router>
						<Navbar />
						<div className="app">
							<Switch>
								<Route path='/signup' component={Signup} exact></Route>
								<Route path='/login' component={Login} exact></Route>
								<Route path='/password/forgot' component={PasswordForgot} exact></Route>
								<Route path='/password/reset/:id-:token' component={PasswordReset}></Route>
								<Route path='/verify/:id-:token' component={Verify}></Route>
								<Route path='/polls/create' exact component={CreatePoll}></Route>
								<Route path='/poll/:id' component={Poll}></Route>
								<Route path='/' exact component={Poll}></Route>
								<Route path='/*' component={NotFound}></Route>
							</Switch>
						</div>
					</Router>
				</AppContext>
			</Provider>
		</>
	);
}

export default App;
