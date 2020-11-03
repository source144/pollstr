import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Switch, Route, Redirect } from 'react-router-dom';
import { createStor } from 'redux';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { ToastContainer } from 'react-toastify';
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

import useWindowDimension from './components/util/useWindowDimension'

// React-Widgets Styling
import 'react-widgets/dist/css/react-widgets.css';

// React-Toastify Styling
import 'react-toastify/dist/ReactToastify.css';

// React-Morphing-Modal Styling
import 'react-morphing-modal/dist/ReactMorphingModal.css';
import useWindowDimensions from './components/util/useWindowDimension';

axios.defaults.baseURL = 'https://pollstr-app.herokuapp.com/api/';
// axios.defaults.baseURL = 'https://pollstr.app/api/';
// axios.defaults.baseURL = 'http://localhost:5000/api/';

function App() {
	const { height, width } = useWindowDimension();
	const isMobile = width <= 960;

	return (
		<>
			<Provider store={store}>
				<AppContext>
					<Router>
						<Navbar />
						<div className="app">
							<Switch>
								<Route path='/' exact><Redirect to='/poll/5f94abf7c82e940a918f7b3c' /></Route>
								<Route path='/signup' component={Signup} exact></Route>
								<Route path='/login' component={Login} exact></Route>
								<Route path='/password/forgot' component={PasswordForgot} exact></Route>
								<Route path='/password/reset/:id-:token' component={PasswordReset}></Route>
								<Route path='/verify/:id-:token' component={Verify}></Route>
								<Route path='/polls' exact><Redirect to='/polls/create/' /></Route>
								<Route path='/polls/create' exact component={CreatePoll}></Route>
								<Route path='/poll/:id' component={Poll}></Route>
								<Route path='/*' component={NotFound}></Route>
							</Switch>
						</div>
					</Router>
				</AppContext>
			</Provider>
			<ToastContainer
				position="bottom-left"
				autoClose={5000}
				hideProgressBar={false}
				newestOnTop={true}
				closeOnClick
				rtl={false}
				pauseOnFocusLoss
				draggable
				pauseOnHover
				limit={!isMobile ? 5 : 2}
			/>
		</>
	);
}

export default App;
