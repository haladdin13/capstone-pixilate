import React, { useState, useEffect, useRef } from "react";
import { useUser } from "./UserContext";
import { Application, Graphics, Container, Assets, Sprite } from "pixi.js";
import { colord } from "colord";
import PaletteRenderer from "./paletteGallery_components/PaletteRenderer";
import PaletteSearchTag from "./paletteGallery_components/PaletteTagSearch";
import AccountMenu from "./home_components/AccountMenu";
import { Link } from "react-router-dom";
import { normalizePaletteColors } from './Utils'

function PaletteGallery() {
    const { currentUser } = useUser();
    const [palettes, setPalettes] = useState([]);
    const [filteredPalettes, setFilteredPalettes] = useState([]);
    const [searchTag, setSearchTag] = useState('');



    useEffect(() => {
        const fetchPalettes = async () => {
            try {
                // Fetch palettes
                const paletteResponse = await fetch(`http://localhost:5555/palettes`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                let palettesData = await paletteResponse.json();


                setPalettes(palettesData);

            } catch (error) {
                console.error("Fetching palettes and colors failed:", error);
            }
        };

        fetchPalettes()
    }, [currentUser.id]);

    useEffect(() => {
        if (searchTag) {
            const filtered = palettes.filter(palette =>
                palette.tags.toLowerCase().includes(searchTag.toLowerCase())
            );
            setFilteredPalettes(filtered);
        } else {
            setFilteredPalettes(palettes); // If no search term, display all palettes
        }
    }, [searchTag, palettes]);

        const handleSearchChange = (tag) => {
            setSearchTag(tag)
        }

    if (palettes.length === 0) {
        return <div>Loading...</div>;
    }
    
    return (
        <div>
        <h1>Palette Gallery</h1>
        <PaletteSearchTag onSearchChange={handleSearchChange}/>
        {filteredPalettes.map(palette => {
            const normalizedPalette = normalizePaletteColors(palette);
            console.log(normalizedPalette);
            return (
                <div key={palette.id}>
                    <Link to={`/palettes/${palette.id}`}>
                        <h2>{palette.title}</h2>
                    </Link>
                    <p>{palette.description}</p>
                    <PaletteRenderer palette={normalizedPalette} />
                </div>
            );
        })}
    </div>
    );
}

export default PaletteGallery;
