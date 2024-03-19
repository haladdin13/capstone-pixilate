import React, { useState } from 'react';
import { Formik, Form, useField } from 'formik';
import * as Yup from 'yup';
import { useUser } from '../UserContext';
import { ColorMask } from 'pixi.js';
import { useParams } from 'react-router-dom';


// Formik setup for Palette Submission


function PaletteSubmission({ colors, title, description, tags, id, onClearColors }) {

    const { currentUser, setCurrentUser } = useUser();
    const [isSubmitting, setIsSubmitting] = useState(false);

    const PaletteSubTextInput = ({ label, ...props}) => {
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
        setIsSubmitting(true);
    
        // Prepare palette details, excluding colors for now.
        let paletteDetails = {
            title: values.title,
            description: values.description,
            tags: values.tags,
            public: values.public,
            likes: values.likes,
            user_id: currentUser.id,
        };
    
        const method = id ? 'PATCH' : 'POST';
        const paletteUrl = id ? `http://localhost:5555/palettes/${id}` : `http://localhost:5555/palettes`;
    
        try {

            let response = await fetch(paletteUrl, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(paletteDetails),
                credentials: 'include',
            });
    
            let paletteData = await response.json();

            if (id) {
                await fetch(`http://localhost:5555/color_associations/palette/${paletteData.id}`, {
                    method: 'DELETE',
                    headers: { 'Content-Type': 'application/json' },
                    credentials: 'include',
                })
            }
    
            await Promise.all(colors.map(async (colorHex) => {
                let colorResponse = await fetch(`http://localhost:5555/colors`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ hex_code: colorHex }),
                    credentials: 'include',
                });
                let colorData = await colorResponse.json();
                
                await fetch(`http://localhost:5555/color_associations`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        palette_id: paletteData.id,
                        color_id: colorData.id,
                    }),
                    credentials: 'include',
                });
                
            }));
    
    
            // Clear form and colors upon successful submission
            resetForm();
            onClearColors();
        } catch (error) {
            console.error("Submitting palette failed:", error);
        } finally {
            setIsSubmitting(false);
            setSubmitting(false);
        }
    };
    



    return (
        <Formik
            enableReinitialize
            initialValues={{
                title: title,
                description: description,
                tags: tags,
                public: true,
                likes: 0,
                user_id: currentUser.id,
                colors: colors
            }}
            validationSchema={Yup.object({
                title: Yup.string().required('Title is required'),
                description: Yup.string().required('Description is required'),
                tags: Yup.string().required('Tags are required'),
            })}
            onSubmit={onSubmit}
        >
            <Form>
                <PaletteSubTextInput name="title" type="text" placeholder="Title" />
                <PaletteSubTextInput name="description" type="text" placeholder="Description" />
                <PaletteSubTextInput name="tags" type="text" placeholder="Tags" />
                <label>
                    <input type="checkbox" name="public" />
                    Public
                </label>
                <button type="submit">Submit</button>
            {isSubmitting && <div>Saving Palette...</div>}
            </Form>
        </Formik>
    );
}

export default PaletteSubmission;
