import React, { useState, useEffect, useRef } from 'react';
import { Application, Sprite, Container, Assets } from 'pixi.js';

function PaletteRenderer({ palette, id }) {
    const containerRef = useRef(null);
    const appRef = useRef(null);

    const [cloudinaryUrl, setCloudinaryUrl] = useState('');

    useEffect(() => {
        const setupApp = async () => {
            if (!palette || !containerRef.current) return;


            if (!appRef.current) {
                const app = new Application();
                await app.init({ background: '#f9f9f9', width: '370', height: '133' });
                containerRef.current.appendChild(app.canvas);
                appRef.current = app;
            } else {
                appRef.current.stage.removeChildren();
            }

            const squareTexture = await Assets.load('/square.png');

            if (!appRef.current || !containerRef.current) return;

            const container = new Container();
            appRef.current.stage.addChild(container);

            const containerWidth = appRef.current.screen.width;
            
            palette.colors.forEach((hexCode, index) => {
                const square = new Sprite(squareTexture);
                square.tint = parseInt(hexCode.replace(/^#/, ''), 16);
                square.width = square.height = 37;

                const squareSize = 32;
                const spacing = 5;
                const squaresPerRow = Math.floor(containerWidth / (squareSize + spacing));
                const row = Math.floor(index / squaresPerRow);
                const col = index % squaresPerRow;

                square.x = col * (squareSize + spacing);
                square.y = row * (squareSize + spacing);

                container.addChild(square);
            });
        };

        setupApp();

        return () => {
            if (appRef.current) {
                console.log("Cleaning pixi resources");
                appRef.current.destroy(true);
                appRef.current = null;
            }
        };
    }, [palette]);

    //Convert to image and send it to cloudinary for download

    const uploadToCloudinary = (blob) => {
        const formData = new FormData();
        formData.append('file', blob);
        formData.append('upload_preset', 'palette-download');
        formData.append('cloud_name', 'di4vwvyre'); //

        fetch('https://api.cloudinary.com/v1_1/di4vwvyre/image/upload', {
            method: 'POST',
            body: formData,
        })
        .then(response => response.json())
        .then(data => {
            if (data.secure_url) {
                setCloudinaryUrl(data.secure_url);
            }
        })
        .catch(err => console.error('Upload to Cloudinary failed:', err));
    };

    const handleCreateImage = () => {
        const canvas = containerRef.current.querySelector('canvas');
        if (canvas) {
            canvas.toBlob(blob => {
                uploadToCloudinary(blob);
            }, 'image/png');
        }
    };

    return (
        <div>
            {cloudinaryUrl && (
                <div>
                    <h4>Uploaded Image:</h4>
                    <img src={cloudinaryUrl} alt="Uploaded to Cloudinary" style={{ maxWidth: '100%' }} />
                    <p className="palette-link"><a href={cloudinaryUrl} target="_blank" rel="noopener noreferrer">Download</a></p>
                </div>
            )}
            { id ? <button onClick={handleCreateImage}>Convert to Image</button> : ""}
            <div ref={containerRef} />
        </div>
    )
}

export default PaletteRenderer;
