import React, { useState, useEffect } from "react";
import { useUser } from "../UserContext";
import { Formik, Form, useField } from "formik";
import { useNavigate } from "react-router-dom";
import * as Yup from 'yup';




function UserSettings() {

    const navigate = useNavigate()

    const {currentUser, setCurrentUser} = useUser();

    const UserSettingTextInput = ({ label, ...props}) => {
        const [field, meta] = useField(props)
        return (
            <div className="form-group">
                <label htmlFor={props.id || props.name}>{label}</label>
                <input className='text-input' {...field} {...props} />
                {meta.touched && meta.error? (
                    <div className="error">{meta.error}</div>
                ) : null}
            </div>
        )
    }

    const onSubmit = async (values, { setSubmitting, resetForm }) => {

        let userDetails = {
            username: values.username,
            email: values.email,
            password: values.password,
        }

        await fetch(`http://localhost:5555/user/${currentUser.id}`, {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(userDetails),
            credentials: 'include',
        })
        .then(res => res.json())
        .then(values => {
            console.log(values)
            setCurrentUser(values)
            // navigate('/')

        })

        setSubmitting(false);
        resetForm();

    }

    return (
        <Formik
            enableReinitialize
            initialValues={{
                username: currentUser.username,
                email: currentUser.email,
            }}
            validationSchema={Yup.object({
                username: Yup.string().required('Username is required'),
                email: Yup.string().required('Email is required'),
            })}
            onSubmit={onSubmit}
            
        >

            <Form>
                <UserSettingTextInput name="username" type="text" placeholder="Username" />
                <UserSettingTextInput name="email" type="email" placeholder="Email" />
                <button type="submit">Submit</button>
            </Form>

        </Formik>
    )


}

export default UserSettings;