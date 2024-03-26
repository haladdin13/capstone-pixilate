import React, { useEffect, useRef } from 'react';
import { Application, Sprite, Container, Assets } from 'pixi.js';

function PaletteRenderer({ palette }) {
    const containerRef = useRef(null);
    const mountedRef = useRef(true);

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

    return <div ref={containerRef} />;
}

export default PaletteRenderer;
