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

    const onSubmit = async (values, actions) => {
        setIsSubmitting(true);
        const method = id ? 'PATCH' : 'POST';
        const paletteUrl = id ? `http://localhost:5555/palettes/${id}` : `http://localhost:5555/palettes`;
        const colorAssocUrl = id ? `http://localhost:5555/color_associations/palette/${id}` : `http://localhost:5555/color_associations`;
        const colorUrl = colors.id ? `http://localhost:5555/colors/${colors.id}` : `http://localhost:5555/colors`;

        try {
            let response = await fetch(`${paletteUrl}`, {
                method: method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    user_id: currentUser.id,
                }),
                credentials: 'include',
            });

            const paletteData = await response.json();
            
            for (const hexCode of values.colors) {
                response = await fetch(`${colorUrl}`, {
                    method: colors.id ? 'PATCH' : 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ hex_code: hexCode }),
                });
                const colorData = await response.json();
                console.log(colorData);

                response = await fetch(`${colorAssocUrl}`, {
                    method: method,
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        palette_id: paletteData.id,
                        color_id: colorData.id,
                    }),
                });

            }

            // Clear form and colors upon successful submission
            actions.resetForm();
            onClearColors();
        } catch (error) {
            console.error(error);
        } finally {
            setIsSubmitting(false);
            actions.setSubmitting(false);
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
                <button type="submit">Submit</button>
            {isSubmitting && <div>Saving Palette...</div>}
            </Form>
        </Formik>
    );
}

export default PaletteSubmission;
