import React from 'react';
import {Formik, Form, useField} from 'formik';
import * as Yup from 'yup';
import { useNavigate } from 'react-router-dom';

//Formik setup for Login Form
function UserLogin(){

    const navigate = useNavigate()
    
    const SignupTextInput = ({ lable, ...props }) => {
        const [field, meta] = useField(props)
        return (
            <div className="form-group">
                <lable htmlFor={props.id || props.name}>{lable}</lable>
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
                        navigate('/')
                    })
                    .then( setSubmitting(false), resetForm() );


                }}
            
            >
                <Form className='LoginForm'>
                    <SignupTextInput type="text" name="username" lable="Username" />
                    <SignupTextInput type="password" name="password" lable="Password" />
                    <button type="submit">Login</button>
                </Form>
            </Formik>
        </div>
    )

}

export default UserLogin;