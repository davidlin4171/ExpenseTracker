import React, {useRef} from "react";
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

    const usernameRef = useRef(null);
    const passwordRef = useRef(null);

    const submitLoginForm = (event) => {
        event.preventDefault();

        const username = usernameRef.current.value;
        const password = passwordRef.current.value;

        //mock response
        try {
            const {data} = login({
                variables: {username, password}
            });
        } catch (error) {
            console.error('Wrong username or password', error);
        };
        
        const token = data['id'];
        console.log(token);
        localStorage.clear();
        localStorage.setItem('user-token', token);
        setTimeout(() => {
            navigate('/');
        }, 500);
    }
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