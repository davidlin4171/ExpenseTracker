import React, {useRef, useEffect, useState} from "react";
import { Button, Col, Container, Form, FormGroup, FormLabel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";

const REGISTER_USER = gql`
    mutation RegisterUser($username: String!, $password: String!) {
        register(username: $username, password: $password) {
            user {
                id
                username
                password
            }
        }
    }
`;

const Signup = () => {

    const navigate = useNavigate();
    const [registerUser, {data, loading, error}] = useMutation(REGISTER_USER);
    const [errorMessage, setErrorMessage] = useState('');

    const usernameRef = useRef(null);
    const passwordRef = useRef(null);

    const submitSignupForm = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        const username = usernameRef.current.value;
        const password = passwordRef.current.value;

        await registerUser({
            variables: {username, password}
        });

    }

    useEffect(() => {
        if (data) {
            console.log('Received data:', data);
            navigate('/'); 
        }
        if (error) {
            console.error('Received GraphQL error:', error);
            setErrorMessage("Username already in use");

        }
    }, [data, error]);

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
                                <input type={'text'} className="form-control" id={'signup-username'} name="username" ref={usernameRef} required />
                            </FormGroup>
                            <FormGroup className="mb-3">
                                <FormLabel htmlFor={'signup-password'}>Password</FormLabel>
                                <input type={'password'} className="form-control" id={'signup-password'} name="password" ref={passwordRef} required />
                            </FormGroup>
                            {/* error if username is already in use */}
                            {errorMessage && (
                                <div className="error-message" style={{ color: 'red' }}>
                                    {errorMessage}
                                </div>
                            )}
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