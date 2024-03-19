import React, { useState, useEffect } from "react";
import { useUser } from "./UserContext";
import PaletteRenderer from "./paletteGallery_components/PaletteRenderer";
import { Link } from "react-router-dom";
import { normalizePaletteColors, normalizeRecommendedPalettes } from "./Utils";

import AccountMenu from './home_components/AccountMenu';

function Home() {

    const {currentUser, setCurrentUser} = useUser();
    const [recentPalettes, setRecentPalettes] = useState([]);
    const [recommendedPalettes, setRecommendedPalettes] = useState([]);

    const user_name = currentUser.username

    // Fetch the 5 most recently made palettes by filtering

    useEffect(() => {
        const fetchMostRecentPalettes = async () => {
            try {
                const paletteResponse = await fetch(`http://localhost:5555/palettes`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                let palettesData = await paletteResponse.json();

                palettesData.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
                
                palettesData = palettesData.slice(0, 5);

                palettesData = palettesData.map(normalizePaletteColors)

                setRecentPalettes(palettesData);

                
            } catch (error) {
                console.error("Fetching palettes and colors failed:", error);
            }
        };

        fetchMostRecentPalettes()
    }, [currentUser.id]);


    //Fetch recommended palettes by fetching color_associations w/combined scores

    useEffect(() => {

        const fetchRecommendedPalettes = async () => {
            try {
                
                const recommendedPalettesResponse = await fetch(`http://localhost:5555/recommended_palettes`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });
    
                let recommendedData = await recommendedPalettesResponse.json();

                console.log(recommendedData);

                recommendedData = recommendedData.palettes.map(normalizeRecommendedPalettes);

                setRecommendedPalettes(recommendedData);
    

            } catch (error) {
                console.error("Fetching palettes and colors failed:", error);
            }
        };
    
        fetchRecommendedPalettes();
    }, []);
    



    return (
        <div>
            <h1>Home</h1>
            <h2>Recent Palettes</h2>
            {recentPalettes.map(palette => (
                <div key={palette.id}>
                    <Link to={`/palettes/${palette.id}`}>
                        <h2>{palette.title}</h2>
                    </Link>
                    <p>{palette.description}</p>
                    <PaletteRenderer palette={palette} />
                </div>
            ))}
            <h2>Recommended Palettes</h2>
            {recommendedPalettes.map(palette => (
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

export default Home;