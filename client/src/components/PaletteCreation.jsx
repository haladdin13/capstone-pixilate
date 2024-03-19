import React, { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { Application } from 'pixi.js';
import { useParams } from 'react-router-dom';

import ColorWheel from './palette_components/ColorWheel';
import CurrentPalette from './palette_components/CurrentPalette';
import PaletteSubmission from './palette_components/PaletteSubmission';
import AccountMenu from './home_components/AccountMenu';


function PaletteCreation() {

    const [selectedColors, setSelectedColors] = useState('')
    const [colors, setColors] = useState([])
    const [description, setDescription] = useState('')
    const [title, setTitle] = useState('')
    const [tags, setTags] = useState('')
    const { id } = useParams();

    useEffect(() => {
        const fetchPaletteDetails = async () => {
            if (!id) return;

            try {
                const paletteRes = await fetch(`http://localhost:5555/palettes/${id}`);
                const paletteData = await paletteRes.json();
                setTitle(paletteData.title);
                setDescription(paletteData.description);
                setTags(paletteData.tags);

                const assocRes = await fetch(`http://localhost:5555/color_associations/palette/${id}`);
                const assocData = await assocRes.json();

                const colorsData = await Promise.all(
                    assocData.map(async (assoc) => {
                        const colorRes = await fetch(`http://localhost:5555/colors/${assoc.color_id}`);
                        return colorRes.json();
                    })
                );

                const colorHexCodes = colorsData.map(color => color.hex_code);
                setColors(colorHexCodes);
            } catch (error) {
                console.error("Failed to fetch palette details:", error);
            }
        };

        fetchPaletteDetails();
    }, [id]);

    const handleColorSelect = (colorHex) => {
        console.log(colorHex);
        setSelectedColors(colorHex);
        addColor(colorHex)
    }

    const {currentUser, setCurrentUser} = useUser();

    const user_name = currentUser.username

    const addColor = (colorHex) => {
        setColors((prevColors) => [...new Set([...prevColors, colorHex])]);
    };

    const removeColor = (colorHex) => {
        setColors((prevColors) => prevColors.filter(color => color !== colorHex));
    };

    const clearColors = () => {
        setColors([]);
    };


    return (
        <div>
            <h1>Palette Creation</h1>
            <CurrentPalette colors={colors} onAddColor={addColor} onRemoveColor={removeColor} onClearColors={clearColors} />
            <PaletteSubmission colors={colors} description={description} title={title} tags={tags} id={id} onClearColors={clearColors}/>
            <ColorWheel onColorSelect={handleColorSelect}/>
            
        </div>
    )
}

export default PaletteCreation;