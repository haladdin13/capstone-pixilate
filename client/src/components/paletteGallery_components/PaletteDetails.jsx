import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import PaletteRenderer from "./PaletteRenderer";
import { useUser } from "../UserContext";

function PaletteDetails() {
  const { id } = useParams();
  const [palette, setPalette] = useState(null);
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

                const paletteData = await paletteResponse.json();
                console.log(paletteData.user.id)

                // For each palette, fetch its colors
                    const colorAssocResponse = await fetch(`http://localhost:5555/color_associations/palette/${id}`, {
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

                    setPalette({...paletteData, colors});
                
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
