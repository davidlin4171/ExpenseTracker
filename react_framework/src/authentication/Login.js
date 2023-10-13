import React from "react";
import { Button, Col, Container, Form, FormGroup, FormLabel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Login = () => {

    const navigate = useNavigate();

    const submitLoginForm = (event) => {
        event.preventDefault();
        //mock response
        const token = 'mock'
        localStorage.clear();
        localStorage.setItem('user-token', token);
        setTimeout(() => {
            navigate('/');
        }, 500);
    }

    return (
        <React.Fragment>
            <Container className="container d-flex justify-content-center align-items-center">
                <div className="login-container">
                <h2 className=" m-5">Login</h2>
                <div className="login-form">
                    <Col md={{span: 12}}>
                        <Form id="loginForm" onSubmit={submitLoginForm}>
                            <FormGroup className="mb-3">
                                <FormLabel htmlFor={'login-username'}>Username</FormLabel>
                                <input type={'text'} className="form-control" id={'login-username'} name="username" required />
                            </FormGroup>
                            <FormGroup className="mb-3">
                                <FormLabel htmlFor={'login-password'}>Password</FormLabel>
                                <input type={'password'} className="form-control" id={'login-password'} name="password" required />
                            </FormGroup>
                           <div className="row justify-content-end">
                            <div className="col-auto">
                                <Button type="submit" className="btn-primary mt-2" id="login-btn">Login</Button>
                            </div>
                            </div>
                        </Form>
                    </Col>
                </div> 
                </div>
           
            </Container>
        </React.Fragment>
    );
}

export default Login;