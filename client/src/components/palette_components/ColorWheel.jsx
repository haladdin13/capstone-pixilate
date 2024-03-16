import React, { useEffect, useRef } from 'react';
import { Application, Graphics, Color } from 'pixi.js';
import { colord } from 'colord';


const ColorWheel = () => {

    const containerRef = useRef(null);


    
    useEffect(() => {

        
        const colorWheelLogic = async () => {
            // Create a PixiJS application.
            const app = new Application();
            // Intialize the application.
            await app.init({ background: '#FFFFFF', resizeTo: window });

            if(containerRef.current) {
                containerRef.current.appendChild(app.canvas);
            }

            const graphics = new Graphics();
            app.stage.addChild(graphics);

            // Rendering color wheel
            const radius = 250
            const center = { 
                x: app.screen.width / 2,
                y: app.screen.height / 2
            }
            const wheelThickness = 1

            for (let angle = 0; angle < 360; angle += 1) {
                
                //calculate angles
                const startAngle = angle * (Math.PI / 180)
                const endAngle = (angle + 2) * (Math.PI / 180)
                
                
                
                // Calculate HSV angle values
                const hsvColors = colord({ h: angle % 360, s: 100, v: 100, a: 1 }).toHex();
                graphics.fill(hsvColors);
                
                // Draw the color wheel outline
                graphics.circle(center.x, center.y, radius - wheelThickness);
                graphics.stroke(wheelThickness, hsvColors, 1);
                
                // Draw the color wheel
                graphics.moveTo(center.x, center.y);
                graphics.arc(center.x, center.y, radius, startAngle, endAngle)
            }

            return () => {
                if(app) {
                    app.destroy(true, { children: true, texture: true, baseTexture: true });
                }
                if(containerRef.current && containerRef.current.contains(app.canvas)) {
                    containerRef.current.removeChild(app.canvas);
                }
            };
        };

        colorWheelLogic();


}, [])

    return (
        <div ref={containerRef} />
    )


}

export default ColorWheel;