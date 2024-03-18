import React, { useState, useEffect, useRef } from "react";
import { useUser } from "./UserContext";
import { Application, Graphics, Container, Assets, Sprite } from "pixi.js";
import { colord } from "colord";
import PaletteRenderer from "./paletteGallery_components/PaletteRenderer";
import PaletteSearchTag from "./paletteGallery_components/PaletteTagSearch";

function PaletteGallery() {
    const { currentUser } = useUser();
    const [palettes, setPalettes] = useState([]);
    const [filteredPalettes, setFilteredPalettes] = useState([]);
    const [searchTag, setSearchTag] = useState('');



    useEffect(() => {
        const fetchPalettesAndColors = async () => {
            try {
                // Fetch palettes
                const paletteResponse = await fetch(`http://localhost:5555/palettes`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                const palettesData = await paletteResponse.json();

                // For each palette, fetch its colors
                const palettesWithColors = await Promise.all(palettesData.map(async (palette) => {
                    const colorAssocResponse = await fetch(`http://localhost:5555/color_associations/palette/${palette.id}`, {
                        method: 'GET',
                        headers: {
                            'Content-Type': 'application/json',
                        },
                        credentials: 'include',
                    });

                    const colorAssocData = await colorAssocResponse.json();

                    const colors = await Promise.all(colorAssocData.map(async ({color_id}) => {
                        const colorResponse = await fetch(`http://localhost:5555/colors/${color_id}`, {
                            method: 'GET',
                            headers: {
                                'Content-Type': 'application/json',
                            },
                            credentials: 'include',
                        });

                        const colorData = await colorResponse.json();
                        console.log(colorData.hex_code)
                        return colorData.hex_code;
                        
                    }))

                    return { ...palette, colors }
                    
                }));
                
                setPalettes(palettesWithColors);
            } catch (error) {
                console.error("Fetching palettes and colors failed:", error);
            }
        };

        fetchPalettesAndColors()
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

    
    return (
        <div>
            <h1>Palette Gallery</h1>
            <PaletteSearchTag onSearchChange={handleSearchChange}/>
            {filteredPalettes.map(palette => (
                <div key={palette.id}>
                    <h2>{palette.title}</h2>
                    <p>{palette.description}</p>
                    <PaletteRenderer palette={palette} />
                </div>
            ))}
        </div>
    );
}

export default PaletteGallery;
