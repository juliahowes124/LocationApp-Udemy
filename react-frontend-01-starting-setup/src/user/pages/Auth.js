import React from 'react';

import Input from '../../shared/components/FormElements/Input';
import Button from '../../shared/components/FormElements/Button';
import Card from '../../shared/components/UIElements/Card';
import {VALIDATOR_EMAIL, VALIDATOR_MINLENGTH} from '../../shared/util/validators';
import { useForm } from '../../shared/hooks/form-hook';
import './Auth.css';

const Auth = () => {
    const [formState, inputHandler] = useForm({
        email: {
            value: '',
            isValid: false
        },
        password: {
            value: '',
            isValid: false
        }
    }, false);

    const authSubmitHandler = event => {
        event.preventDefault();
        console.log(formState.inputs);
    } 

    return (
        <Card className="authentication">
            <h2>Login Required</h2>
            <hr />
            <form onSubmit={authSubmitHandler}>
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
                <Button type="submit" disabled={!formState.isValid}>LOGIN</Button>
            </form>
        </Card>
       
    )
};

export default Auth;

