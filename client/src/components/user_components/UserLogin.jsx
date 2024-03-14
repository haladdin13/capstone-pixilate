import React from 'react';
import {Formik, Form, useField} from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';
import { useUser } from '../UserContext';

//Formik setup for Login Form
function UserLogin(){

    const navigate = useNavigate()
    const {currentUser, setCurrentUser} = useUser();
    
    const SignupTextInput = ({ label, ...props }) => {
        const [field, meta] = useField(props)
        return (
            <div className="form-group">
                <label htmlFor={props.id || props.name}>{label}</label>
                <input className='text-input' {...field} {...props} />
                {meta.touched && meta.error ? (
                    <div className="error">{meta.error}</div>
                ) : null}
            </div>
        )
    }

    return(
        <div>
            <Formik
                initialValues={{
                    username: '',
                    password: ''
                }}
                validationSchema={Yup.object({
                    username: Yup.string()
                    .required('Username is required'),
                    password: Yup.string()
                    .required('<PASSWORD>')
                })}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                    
                    fetch(`http://localhost:5555/login`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(values)
                    })
                    .then(res => res.json())
                    .then(values => {
                        console.log(values)
                        setCurrentUser(values)
                        navigate('/')
                    })
                    .then( setSubmitting(false), resetForm() );


                }}
            
            >
                <Form className='LoginForm'>
                    <SignupTextInput type="text" name="username" label="Username" />
                    <SignupTextInput type="password" name="password" label="Password" />
                    <button type="submit">Login</button>
                </Form>
            </Formik>
        </div>
    )

}

export default UserLogin;