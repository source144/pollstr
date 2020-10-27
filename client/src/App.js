import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css';
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
			<Router>
				<Navbar />
				<Switch>
					<Route path='/signup' component={Signup} exact></Route>
					<Route path='/login' component={Login} exact></Route>
					<Route path='/password/forgot' component={PasswordForgot} exact></Route>
					<Route path='/password/reset/:id-:token' component={PasswordReset}></Route>
					<Route path='/verify/:id-:token' component={Verify}></Route>
					<Route path='/' component={Poll}></Route>
					<Route path='/*' component={NotFound}></Route>
				</Switch>
			</Router>
		</>
	);
}

export default App;
