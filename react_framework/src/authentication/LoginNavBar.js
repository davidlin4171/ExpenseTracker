import React from "react";
import { Outlet } from "react-router-dom";
import Container from 'react-bootstrap/Container';
import Navbar from 'react-bootstrap/Navbar';


const LoginNavBar = () => {
    return (
        <React.Fragment>
              <Navbar bg="primary" expand="lg" className="navbar-dark">
                <Container>
                    <Navbar.Brand>Spending Tracker</Navbar.Brand>
                </Container>
            </Navbar>
            <Outlet />
        </React.Fragment>
    );
}

export default LoginNavBar;