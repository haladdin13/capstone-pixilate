import React, { useState, useEffect } from 'react';
import { useUser } from './UserContext';
import { Application } from 'pixi.js';

import ColorWheel from './palette_components/ColorWheel';
import CurrentPalette from './palette_components/CurrentPalette';
import PaletteSubmission from './palette_components/PaletteSubmission';


function PaletteCreation() {

    const [selectedColors, setSelectedColors] = useState('')
    const [colors, setColors] = useState([])

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
            <h4>{user_name}</h4>
            <CurrentPalette colors={colors} onAddColor={addColor} onRemoveColor={removeColor} onClearColors={clearColors} />
            <PaletteSubmission colors={colors} onClearColors={clearColors}/>
            <ColorWheel onColorSelect={handleColorSelect}/>
            
        </div>
    )
}

export default PaletteCreation;