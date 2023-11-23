import React from "react";
import { Button, Col, Container, Form, FormGroup, FormLabel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";

const Signup = () => {

    const navigate = useNavigate();

    const submitSignupForm = (event) => {
        event.preventDefault();
        setTimeout(() => {
            navigate('/');
        }, 500);
        console.log('aSJKNDASJKDNKJASNDKJASN');
        // create an account with graph ql
    }


    return (
        <React.Fragment>
            <Container className="container d-flex justify-content-center align-items-center">
            <div className="signup-container">
                <h2 className=" m-5">Welcome to the spending tracking</h2>
                <div className="login-form">
                    <Col md={{span: 12}}>
                        <Form id="loginForm" onSubmit={submitSignupForm}>
                            <FormGroup className="mb-3">
                                <FormLabel htmlFor={'signup-username'}>Username</FormLabel>
                                <input type={'text'} className="form-control" id={'signup-username'} name="username" required />
                            </FormGroup>
                            <FormGroup className="mb-3">
                                <FormLabel htmlFor={'signup-password'}>Password</FormLabel>
                                <input type={'password'} className="form-control" id={'signup-password'} name="password" required />
                            </FormGroup>
                           <div className="row justify-content-end">
                            <div className="col-auto">
                                <Button type="submit" className="btn-primary mt-2" id="signup-btn">Signup</Button>
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

export default Signup;