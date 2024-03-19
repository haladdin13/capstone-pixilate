import React, {useState, useEffect } from "react";
import { useUser } from "./UserContext";
import { Link, useParams } from "react-router-dom";

import PaletteRenderer from "./paletteGallery_components/PaletteRenderer";
import { normalizePaletteColors } from "./Utils";


function UserProfile(){
    const { currentUser, setCurrentUser } = useUser();
    const [palettes, setPalettes] = useState([]);

    const { id } = useParams();



    useEffect(() => {
        const fetchPalettes = async () => {
            try {
                // Fetch palettes
                const paletteResponse = await fetch(`http://localhost:5555/palettes/user/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                let palettesData = await paletteResponse.json();

                palettesData = palettesData.map(normalizePaletteColors)
                setPalettes(palettesData)
                
            } catch (error) {
                console.error("Fetching palettes and colors failed:", error);
            }
        };

        fetchPalettes()
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