import React, { useState, useEffect, useRef } from 'react';
import { Application, Sprite, Container, Assets } from 'pixi.js';

function PaletteRenderer({ palette, id }) {
    const containerRef = useRef(null);
    const mountedRef = useRef(true);
    const [cloudinaryUrl, setCloudinaryUrl] = useState('');

    console.log(id)

    useEffect(() => {
        
        const app = new Application();

            (async () => {

                console.log(palette.colors)

                if (!palette || !containerRef.current) return;


                await app.init({ 
                    background: '#f9f9f9',
                    width: 370,
                    height: 133
                });

                containerRef.current.appendChild(app.canvas);

                await Assets.load('/square.png').then((squareSprite) => {
                    if (!mountedRef.current) return;
                    containerRef.current.innerHTML = ''
                    containerRef.current.appendChild(app.canvas);

                    const container = new Container();
                    app.stage.addChild(container);
                    
                    const containerWidth = app.screen.width;
                    
                    palette.colors.forEach((hexCode, index) => {
                        const square = new Sprite(squareSprite)
                        square.tint = parseInt(hexCode.replace(/^#/, ''), 16);
                        square.width = square.height = 37
    
                        const squareSize = 32
                        const spacing = 5
                        const squaresPerRow = Math.floor(containerWidth / (squareSize + spacing));
                        const row = Math.floor(index / squaresPerRow)
                        const col = index % squaresPerRow
    
                        square.x = col * (squareSize + spacing);
                        square.y = row * (squareSize + spacing);
    
    
                        container.addChild(square);
                })


                })
                return () => {
                    app.destroy(true, { children: true, texture: true, baseTexture: true })
                }
            })();
            

        
    }, [palette])

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
