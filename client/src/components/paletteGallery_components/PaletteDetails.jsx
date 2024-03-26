import React, { useState, useEffect } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import PaletteRenderer from "./PaletteRenderer";
import { useUser } from "../UserContext";
import { normalizePaletteColors } from "../Utils";
import UserProfile from "../UserProfile";

function PaletteDetails() {
  const { id } = useParams();
  const [palette, setPalette] = useState(null);
  const [owner, setOwner] = useState(null);
  const navigate = useNavigate();
  const { currentUser, setCurrentUser } = useUser();

    useEffect(() => {
        const fetchPalettesAndColors = async () => {
            try {
                // Fetch palettes
                const paletteResponse = await fetch(`http://localhost:5555/palettes/${id}`, {
                    method: 'GET',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    credentials: 'include',
                });

                let paletteData = await paletteResponse.json();
                console.log(paletteData.color_associations)
                
                
                console.log(paletteData.user.id)
                paletteData = normalizePaletteColors(paletteData)
                setPalette(paletteData);
                setOwner(paletteData.user);
                
            } catch (error) {
                console.error("Fetching palettes and colors failed:", error);
            }
        };

        fetchPalettesAndColors()
    }, [id]);


        const handleDelete = async () => {
        try {
        await fetch(`http://localhost:5555/palettes/${id}`, {
            method: 'DELETE',
            credentials: 'include',
        });
        navigate(`/users/${currentUser.id}`)
        } catch (error) {
        console.error("Deleting palette failed:", error);
        }
    };

  if (!palette) return <div>Loading...</div>;

  return (
    <div>
        <h1>{palette.title}</h1>
        <Link to={`/users/${owner.id}`} >
            <h3>Creator: {owner.username}</h3>
        </Link>
        <p>{palette.description}</p>
        <PaletteRenderer palette={palette} />
        {palette.user.id === currentUser.id && (
            <>
                <button onClick={() => navigate(`/palette-creator/${id}`)}>Edit Palette</button>
                <button onClick={handleDelete}>Delete Palette</button>
            </>
        )}
    </div>
  );
}

export default PaletteDetails;
