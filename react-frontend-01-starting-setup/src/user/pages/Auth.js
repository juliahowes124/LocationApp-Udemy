import React, { useState, useContext } from 'react';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import ErrorModal from '../../shared/components/UIElements/ErrorModal';
import LoadingSpinner from '../../shared/components/UIElements/LoadingSpinner';
import {VALIDATOR_EMAIL, VALIDATOR_MINLENGTH, VALIDATOR_REQUIRE} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import { AuthContext } from '../../shared/context/auth-context';
import './Auth.css';

const Auth = () => {
    const auth = useContext(AuthContext);
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setisLoading] = useState(false);
    const [error, setError] = useState();
    const [formState, inputHandler, setFormData] = useForm({
        email: {
            value: '',
            isValid: false
        },
        password: {
            value: '',
            isValid: false
        }
    }, false);

    const switchModeHandler = () => {
        if (!isLogin) {
            setFormData({
                ...formState.inputs,
                name: undefined
            }, formState.inputs.email.isValid && formState.inputs.password.isValid)
        } else {
            setFormData({
                ...formState.inputs,
                name: {
                    value: '',
                    isValid: false 
                }
            }, false);
        }
        setIsLogin(prevMode => !prevMode);
    }

    const authSubmitHandler = async event => {
        event.preventDefault();
        setisLoading(true);
        

        if (isLogin) {
            try {
                const response = await fetch('http://localhost:5000/api/users/login', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value
                    })
                });
                const responseData = await response.json();
                if (!response.ok) {
                    throw new Error(responseData.message);
                }
                auth.login();
            } catch(err) {
                console.log(err);
                setError(err.message || 'Something went wrong, please try again.');
            }

            setisLoading(false);

        } else {
            try {
                const response = await fetch('http://localhost:5000/api/users/signup', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        name: formState.inputs.name.value,
                        email: formState.inputs.email.value,
                        password: formState.inputs.password.value
                    })
                });
                const responseData = await response.json();
                if (!response.ok) {
                    throw new Error(responseData.message);
                }
                console.log(responseData);
                setisLoading(false);
                auth.login();
            } catch(err) {
                console.log(err);
                setError(err.message || 'Something went wrong, please try again.');
            }

            setisLoading(false);
        }
    };

    const errorHandler = () => {
        setError(null);
    };

    return (
        <React.Fragment>
            <ErrorModal error={error} onClear={errorHandler}></ErrorModal>
            <Card className="authentication">
            {isLoading && <LoadingSpinner asOverlay/>}
            <h2>Login Required</h2>
            <hr />
            <form onSubmit={authSubmitHandler}>
                {!isLogin && (
                <Input
                    element="input"
                    id="name"
                    type="text"
                    label="Your Name"
                    validators={[VALIDATOR_REQUIRE()]}
                    errorText="Please enter a name"
                    onInput={inputHandler}
                />
                )}
                <Input
                    id="email"
                    element="input"
                    type="email"
                    label="E-mail"
                    validators={[VALIDATOR_EMAIL()]}
                    errorText="Please enter a valid email address"
                    onInput={inputHandler}
                />
                <Input
                    id="password"
                    element="input"
                    type="password"
                    label="Password"
                    validators={[VALIDATOR_MINLENGTH(3)]}
                    errorText="Password must be at lease 3 characters long."
                    onInput={inputHandler}
                />
                <Button type="submit" disabled={!formState.isValid}>{isLogin ? 'LOGIN' : 'SIGNUP'}</Button>
            </form>
            <Button inverse onClick={switchModeHandler}>SWITCH TO {isLogin ? 'SIGNUP' : 'LOGIN'}</Button>
        </Card>

        </React.Fragment>
        
       
    )
};

export default Auth;

