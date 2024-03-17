import React, { useState, useEffect, useRef } from 'react';
import { useUser } from '../UserContext';
import { Application, Graphics, Container, Assets, Sprite } from 'pixi.js';
import { colord } from 'colord';



function CurrentPalette({ colors, onAddColor, onRemoveColor, onClearColors}) {
    const { currentUser, setCurrentUser } = useUser();
    const [paletteTitle, setPaletteTitle] = useState('');
    const [paletteDescription, setPaletteDescription] = useState('');

    const containerRef = useRef(null);


    useEffect(() => {

        (async () => {
            
            const app = new Application();
            await app.init({ 
                background: '#FFFFFF',
                width: 370,
                height: 100
            });

            if(containerRef.current) {
                containerRef.current.innerHTML = '' // Removes previous color array elements from rendering
                containerRef.current.appendChild(app.canvas);
            }

            //Load asset, create container
            const squareSprite = await Assets.load('/square.png');
            const container = new Container();
            app.stage.addChild(container);

            const containerWidth = app.screen.width;

            //Create square sprite
            colors.forEach((colorHex, index) => {
                const square = new Sprite(squareSprite)
                square.tint = parseInt(colorHex.replace(/^#/, ''), 16)
                
                // Calculate spacing between squares
                const squareSize = 32
                const spacing = 5
                const squaresPerRow = Math.floor(containerWidth / (squareSize + spacing));
                const row = Math.floor(index / squaresPerRow)
                const col = index % squaresPerRow

                square.x = col * (squareSize + spacing);
                square.y = row * (squareSize + spacing);
                
                
                //Remove individual squares from palette on click
                square.interactive = true
                square.buttonMode = true
    
                square.on('pointerdown', () => onRemoveColor(colorHex))
                
                // Add square to container
                container.addChild(square)

                const totalRows = Math.ceil(colors.length / squaresPerRow)
                const scalingHeight = totalRows * (squareSize + spacing) + spacing
                app.renderer.resize(containerWidth, scalingHeight)
                
                

            

            })

            return () => {
                app.destroy(true, { children: true, texture: true, baseTexture: true })
            }
            

        })();

    }, [colors])

    return <div ref={containerRef} style={{ width: '100%', height: 'auto', overflow: 'auto', maxWidth: '800px' }}>
    </div>

}

export default CurrentPalette;