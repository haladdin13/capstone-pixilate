import React, { useState, useEffect, useRef } from "react";
import { useUser } from "./UserContext";
import { Application, Graphics, Container, Assets, Sprite } from "pixi.js";
import { colord } from "colord";
import PaletteRenderer from "./paletteGallery_components/PaletteRenderer";
import PaletteSearchTag from "./paletteGallery_components/PaletteTagSearch";
import AccountMenu from "./home_components/AccountMenu";
import { Link } from "react-router-dom";
import { normalizePaletteColors } from './Utils'
import { Formik, Form, useField, Field } from "formik";
import * as Yup from 'yup';

function PaletteGallery() {
    const { currentUser } = useUser();
    const [palettes, setPalettes] = useState([]);
    const [filteredPalettes, setFilteredPalettes] = useState([]);
    // const [searchTag, setSearchTag] = useState('');



    useEffect(() => {
        const fetchPalettes = async () => {
            try {

                const paletteResponse = await fetch(`http://localhost:5555/palettes`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                let palettesData = await paletteResponse.json();


                setPalettes(palettesData);
                setFilteredPalettes(palettesData);

            } catch (error) {
                console.error("Fetching palettes and colors failed:", error);
            }
        };

        fetchPalettes()
    }, [currentUser.id]);

////////////////////////////////////////////////////////////////
    return(
        <div className="main-content">
            <div className="main-content-h1"><h1>Palette Gallery</h1></div>
            <Formik
            initialValues={{ searchTag: ''}}
            onSubmit={(values) => {
                const filtered = palettes.filter(palette =>
                    palette.tags.toLowerCase().includes(values.searchTag.toLowerCase())
                    )
                    setFilteredPalettes(filtered)
            }}
            >
                <Form>
                    <Field name="searchTag" placeholder="Search by tag..." />
                    <button type="submit">Submit</button>
                </Form>
            </Formik>
            {filteredPalettes.map(palette => (
                <div key={palette.id} className="palette-item">
                    <Link to={`/palettes/${palette.id}`}>
                        <h2>{palette.title}</h2>
                    </Link>
                    <p>{palette.description}</p>
                    <p>Tags: {palette.tags}</p>
                    <PaletteRenderer palette={normalizePaletteColors(palette)} />
                </div>
                 ))}
        </div>
    )
}

export default PaletteGallery;
