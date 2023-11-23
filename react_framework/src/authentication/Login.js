import React, {useRef, useEffect, useState} from "react";
import { Button, Col, Container, Form, FormGroup, FormLabel } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { useMutation, gql } from "@apollo/client";

const LOGIN = gql`
    mutation Login($username: String!, $password: String!) {
        login(username: $username, password: $password) {
            user {
                id
                username
                password
            }
        }
    }
`;

const Login = () => {

    const navigate = useNavigate();
    const [login, {data, loading, error}] = useMutation(LOGIN);
    const [errorMessage, setErrorMessage] = useState('');

    const usernameRef = useRef(null);
    const passwordRef = useRef(null);

    const submitLoginForm = async (event) => {
        event.preventDefault();
        setErrorMessage('');

        const username = usernameRef.current.value;
        const password = passwordRef.current.value;

        //mock response
        await login({
                variables: {username, password}
        });
    }

    useEffect(() => {
        if (data) {
            console.log('Received data:', data);
            const token = data['login']['user']['id'];
            localStorage.clear();
            localStorage.setItem('user-token', token);
            navigate('/'); 
        }
        if (error) {
            console.error('Received GraphQL error:', error);
            setErrorMessage("Username or password is incorrect");

        }
    }, [data, error]);

    const createNewAccount = (event) => {
        event.preventDefault();
        navigate('/auth/signup');
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
                                <input type={'text'} className="form-control" id={'login-username'} name="username" ref={usernameRef} required />
                            </FormGroup>
                            <FormGroup className="mb-3">
                                <FormLabel htmlFor={'login-password'}>Password</FormLabel>
                                <input type={'password'} className="form-control" id={'login-password'} name="password" ref={passwordRef} required />
                            </FormGroup>
                            {/* error if wrong username or password*/}
                            {errorMessage && (
                                <div className="error-message" style={{ color: 'red' }}>
                                    {errorMessage}
                                </div>
                            )}
                           <div className="row justify-content-end">
                            <div className="col-auto">
                                <Button type="submit" className="btn-primary mt-2" id="login-btn">Login</Button>
                            </div>
                            </div>
                        </Form>
                    </Col>
                    <a onClick={createNewAccount} className="btn-primary">
                        {'Don\'t have an account'}
                    </a>
                </div> 
                </div>
           
            </Container>
        </React.Fragment>
    );
}

export default Login;