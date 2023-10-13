import React, { useEffect, useState } from "react";
import {  useNavigate } from "react-router-dom";

const GuardedRoute = (props) => {

    const navigate = useNavigate();

    const [isValidLogin, userIsLoggedIn] = useState(false);

    //uses auth token to check if user is logged in (this guarded route function does this)(need graph ql to actually implement auth login)
    const checkUserToken = () => {
        const userToken = localStorage.getItem('user-token');
        if (!userToken || userToken === 'undefined') {
            userIsLoggedIn(false);
            return navigate('/auth/login');
        }
        userIsLoggedIn(true);
    }
    //checks if it is logged in
    useEffect(() => {
        checkUserToken();
    }, [isValidLogin]);

    return (
        <React.Fragment>
            {
                isValidLogin ? props.children : null
            }
        </React.Fragment>
    );
}

export default GuardedRoute;