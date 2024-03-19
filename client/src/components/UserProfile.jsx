import React, {useState, useEffect } from "react";
import { useUser } from "./UserContext";
import { Link, useParams } from "react-router-dom";

import PaletteRenderer from "./paletteGallery_components/PaletteRenderer";


function UserProfile(){
    const { currentUser, setCurrentUser } = useUser();
    const [palettes, setPalettes] = useState([]);

    const { id } = useParams();



    useEffect(() => {
        const fetchPalettesAndColors = async () => {
            try {
                // Fetch palettes
                const paletteResponse = await fetch(`http://localhost:5555/palettes/user/${id}`, {
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
    }, [id]);

    if (palettes.length === 0) {
        return <div>Loading...</div>;
    }

    return (
        <div>
            <h1>User Profile</h1>
            {palettes.map(palette => (
                <div key={palette.id}>
                    <Link to={`/palettes/${palette.id}`}>
                        <h2>{palette.title}</h2>
                    </Link>
                    <p>{palette.description}</p>
                    <PaletteRenderer palette={palette} />
                </div>
            ))}
        </div>
    )
}

export default UserProfile;