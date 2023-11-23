import React from 'react';
import ReactDOM from 'react-dom/client';
import 'bootstrap/dist/css/bootstrap.min.css';
import './index.css';
import { PrimeReactProvider } from 'primereact/api';
import 'primereact/resources/themes/lara-light-indigo/theme.css';   // theme
import 'primeflex/primeflex.css';                                   // css utility
import 'primeicons/primeicons.css';
import 'primereact/resources/primereact.css';                       // core css
import reportWebVitals from './reportWebVitals';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Login from './authentication/Login';
import Signup from './authentication/Signup';
import Auth from './authentication/LoginNavBar';
import App from './App';
import GuardedRoute from './common/GuardedRoute';
import Home from './views/Home';

import { ApolloClient, InMemoryCache, ApolloProvider } from "@apollo/client";

const client = new ApolloClient({
    uri: 'http://127.0.0.1:5000/graphql',
    cache: new InMemoryCache(),
});

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
	<React.StrictMode>
		<ApolloProvider client={client}>
			<BrowserRouter basename={'/'}>
				<Routes>
					<Route path='/auth' element={<Auth />}>
						<Route path='login' element={<Login />} />
						<Route path='signup' element={<Signup />} />
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
		</ApolloProvider>
	</React.StrictMode>
);
reportWebVitals();
