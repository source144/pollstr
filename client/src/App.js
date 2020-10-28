import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import { createStor } from 'redux';
import { Provider } from 'react-redux';
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


function App() {
	return (
		<>
			<Provider store={store}>
				<Router>
					<Navbar />
					<div className="app">
						<Switch>
							<Route path='/signup' component={Signup} exact></Route>
							<Route path='/login' component={Login} exact></Route>
							<Route path='/password/forgot' component={PasswordForgot} exact></Route>
							<Route path='/password/reset/:id-:token' component={PasswordReset}></Route>
							<Route path='/verify/:id-:token' component={Verify}></Route>
							<Route path='/poll/:id' component={Poll}></Route>
							<Route path='/' exact component={Poll}></Route>
							<Route path='/*' component={NotFound}></Route>
						</Switch>
					</div>
				</Router>
			</Provider>
		</>
	);
}

export default App;
