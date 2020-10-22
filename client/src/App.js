import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import Navbar from './components/Navbar';
import './App.css';
import Signup from './components/pages/Signup/Signup';

function App() {
	return (
		<>
			<Router>
				<Navbar />
				<Switch>
					<Route path='/signup' component={Signup}></Route>
				</Switch>
			</Router>
		</>
	);
}

export default App;
