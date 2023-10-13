import React, { useEffect, useState } from "react";
import { Outlet } from "react-router-dom";
import NavbarHeader from "./views/NavbarHeader";

function App() {

	const [isLoggedIn, setIsLoggedIn] = useState(false);

    const checkUserToken = () => {
        if (localStorage.getItem('user-token')) {
            setIsLoggedIn(false);
        } 
            setIsLoggedIn(true);
    }

    useEffect(() => {
        checkUserToken();
    }, [isLoggedIn]);
	
	return (
		<React.Fragment>
			{isLoggedIn && <NavbarHeader />}
			<Outlet />
		</React.Fragment>
	);
}

export default App;
