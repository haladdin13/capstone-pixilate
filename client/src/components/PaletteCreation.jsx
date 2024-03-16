import React from 'react';
import { useUser } from './UserContext';
import { Application } from 'pixi.js';

import ColorWheel from './palette_components/ColorWheel';


function PaletteCreation() {


    // // Asynchronous IIFE
    // (async () =>
    // {
    //     // Create a PixiJS application.
    //     const app = new Application();

    //     // Intialize the application.
    //     await app.init({ background: '#1099bb', resizeTo: window });

    //     // Then adding the application's canvas to the DOM body.
    //     document.body.appendChild(app.canvas);
    // })();

    const {currentUser, setCurrentUser} = useUser();

    const user_name = currentUser.username




    return (
        <div>
            <h1>Palette Creation</h1>
            <h4>{user_name}</h4>
            <ColorWheel onSelectColor={(event) => console.log('Color selected', event)} />

            
        </div>
    )
}

export default PaletteCreation;