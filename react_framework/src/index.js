import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './authentication/Login';
import Auth from './authentication/LoginNavBar';
import App from './App';
import GuardedRoute from './common/GuardedRoute';
import Home from './views/Home';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<BrowserRouter basename={'/'}>
			<Routes>
				<Route path='/auth' element={<Auth />}>
					<Route path='login' element={<Login />} />
				</Route>
				<Route path="/" element={<App />}>
					<Route path='' element={
						<GuardedRoute>
							<Home />
						</GuardedRoute>
					} />
				</Route>
			</Routes>
		</BrowserRouter>
	</React.StrictMode>
);
reportWebVitals();
