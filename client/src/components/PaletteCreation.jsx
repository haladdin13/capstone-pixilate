import React from 'react';
import { useUser } from './UserContext';


function PaletteCreation() {
    const {currentUser, setCurrentUser} = useUser();

    const user_name = currentUser.username

    return (
        <div>
            <h1>Palette Creation</h1>
            <h4>{user_name}</h4>
            
        </div>
    )
}