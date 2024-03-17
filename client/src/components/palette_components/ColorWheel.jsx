import React, { useState, useEffect, useRef } from 'react';
import { Application, Graphics, Color } from 'pixi.js';
import { colord } from 'colord';
import CurrentPalette from './CurrentPalette';


const ColorWheel = ({ onColorSelect }) => {

    const containerRef = useRef(null);

    const [saturation, setSaturation] = useState(100)
    const [value, setValue] = useState(100)


    
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

                let hue = angle

                const hsvColors = colord({ h: hue, s: saturation, v: value, a: 1 }).toHex();
                graphics.fill(hsvColors);
                
                // Draw the color wheel outline
                graphics.circle(center.x, center.y, radius - wheelThickness);
                graphics.stroke(wheelThickness, hsvColors, 1);
                
                // Draw the color wheel
                graphics.moveTo(center.x, center.y); // Moves origin to prevent colors stretching to origin (0,0)
                graphics.arc(center.x, center.y, radius, startAngle, endAngle)

                // Re-render colors based on saturation and value slider position


            }

            
            // Color Wheel Interactivity
            
            // Listen for clicks on the color wheel
            graphics.interactive = true;
            graphics.buttonMode = true;
            graphics.on('pointerdown', (event) => {
                
                const { x, y } = event.global;
                
                const dx = x - center.x;
                const dy = y - center.y;
                const angleRadians = Math.atan2(dy, dx);
                const angleDegrees = (angleRadians * (180 / Math.PI) + 360) % 360; // Normalize angle to 0-360 range
                const clickedColorHex = colord({ h: angleDegrees, s: saturation, v: value }).toHex(); // Gets hex value from angle degrees
                // console.log(clickedColorHex);
                onColorSelect(clickedColorHex);
                console.log(angleDegrees);
            

            //Clear Color Wheel on page change
            return () => {
                if(app) {
                    app.destroy(true, { children: true, texture: true, baseTexture: true });
                }
                if(containerRef.current && containerRef.current.contains(app.canvas)) {
                    containerRef.current.removeChild(app.canvas);
                }
            };
            });


        };

        colorWheelLogic();


}, [])

    return (
        <div ref={containerRef}>
            <h4>Current Palette</h4>
            <input type='range' min='0' max='100' value={saturation} onChange={(e) => setSaturation(e.target.value)} />
            <input type='range' min='0' max='100' value={value} onChange={(e) => setValue(e.target.value)} />
        </div>
    )


}

export default ColorWheel;