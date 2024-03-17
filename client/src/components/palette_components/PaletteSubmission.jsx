import React from 'react';
import { Formik, Form, useField } from 'formik';
import * as Yup from 'yup';
import { useUser } from '../UserContext';
import { ColorMask } from 'pixi.js';


// Formik setup for Palette Submission


function PaletteSubmission({ colors, onClearColors }) {

    const { currentUser, setCurrentUser } = useUser();

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
        try {
            let response = await fetch(`http://localhost:5555/palettes`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...values,
                    user_id: currentUser.id,
                }),
                credentials: 'include',
            });

            const paletteData = await response.json();
            
            for (const colorHex of colors) {
                response = await fetch(`http://localhost:5555/colors`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ hex_code: colorHex }),
                });
                const colorData = await response.json();

                response = await fetch(`http://localhost:5555/color_associations`, {
                    method: 'POST',
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
            actions.setSubmitting(false);
        }
    };

    return (
        <Formik
            initialValues={{
                title: '',
                description: '',
                tags: '',
                public: true,
                likes: 0,
                user_id: currentUser.id
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
            </Form>
        </Formik>
    );
}

export default PaletteSubmission;
