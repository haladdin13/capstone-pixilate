import React from 'react';
import {Formik, Form, useField} from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

//Formik setup for Signup Form
function UserSignup(){

    const navigate = useNavigate()
    
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
                    email: '',
                    password: ''
                }}
                validationSchema={Yup.object({
                    username: Yup.string()
                    .required('Username is required'),
                    email: Yup.string()
                    .required('Email is required'),
                    password: Yup.string()
                    .required('<PASSWORD>')
                })}
                onSubmit={(values, { setSubmitting, resetForm }) => {
                    
                    fetch(`http://localhost:5555/signup`, {
                        method: 'POST',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(values)
                    })
                    .then(res => res.json())
                    .then(values => {
                        console.log(values)
                        navigate('/login')
                    })
                    .then( setSubmitting(false), resetForm() );


                }}
            
            >
                <Form className='SubmitForm'>
                    <SignupTextInput type="text" name="username" label="Username" />
                    <SignupTextInput type="email" name="email" label="Email" />
                    <SignupTextInput type="password" name="password" label="Password" />
                    <button type="submit">Submit</button>
                </Form>
            </Formik>
        </div>
    )

}

export default UserSignup;