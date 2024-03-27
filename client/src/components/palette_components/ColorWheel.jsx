import React, { useState, useEffect, useRef } from 'react';
import { Application, Graphics, Color } from 'pixi.js';
import { colord } from 'colord';
import CurrentPalette from './CurrentPalette';


const ColorWheel = ({ onColorSelect }) => {

    const containerRef = useRef(null);

    const [saturation, setSaturation] = useState(100)
    const [value, setValue] = useState(100)
    const [app, setApp] = useState(null)


    
    useEffect(() => {

        
        const colorWheelLogic = async () => {
            // Create a PixiJS application.
            const newApp = new Application();
            // Intialize the application.
            await newApp.init({ background: '#f9f9f9', width: '800', height: '550' });

            setApp(newApp);

            if(containerRef.current && newApp.canvas) {
                containerRef.current.innerHTML = ''
                containerRef.current.appendChild(newApp.canvas);
            }

            newApp.stage.removeChildren();
            const graphics = new Graphics();
            newApp.stage.addChild(graphics);

            // Rendering color wheel
            const radius = 250
            const center = {
                x: newApp.screen.width / 2,
                y: newApp.screen.height / 2
            }
            const wheelThickness = 1

            for (let angle = 0; angle < 360; angle += 1) {
                
                //calculate angles
                const startAngle = angle * (Math.PI / 180)
                const endAngle = (angle + 2) * (Math.PI / 180)
                
                
                
                // Calculate HSV angle values

                let hue = angle

                const hsvColors = colord({ h: hue, s: saturation, v: value }).toHex();
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
            

            });
            
            return () => {
                    console.log("Cleaning color wheel")
                    newApp.destroy(true, { children: true, texture: true, baseTexture: true });
            };
            
        };
        
        const cleanUp = colorWheelLogic();

        return () => {
            cleanUp.then((cleanup) => cleanup && cleanup())
        }


}, [saturation, value])

    const handleSaturationChange = (e) => {
        e.preventDefault();
        const newSaturation = parseInt(e.target.value, 10);
        if (!isNaN(newSaturation) && newSaturation >= 0 && newSaturation <= 100) {
            setSaturation(newSaturation);
        }
    };

    const handleValueChange = (e) => {
        e.preventDefault();
        const newValue = parseInt(e.target.value, 10);
        if (!isNaN(newValue) && newValue >= 0 && newValue <= 100) {
            setValue(newValue);
        }
    };

    return (
        <div className="color-wheel-controls">
        <div>
            <label>
                Saturation (%):
                <input type="number" value={saturation} onChange={handleSaturationChange} min="0" max="1" />
            </label>
        </div>
        <div>
            <label>
                Value (%):
                <input type="number" value={value} onChange={handleValueChange} min="0" max="1" />
            </label>
        </div>
        <div ref={containerRef} />
    </div>
    );
};


export default ColorWheel;