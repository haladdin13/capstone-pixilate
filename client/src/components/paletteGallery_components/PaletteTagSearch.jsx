import React, { useState, useEffect } from 'react';



function PaletteSearchTag({ onSearchChange }) {
    

    return (
        <div>
            <div className="search-bar">
                <input 
                    type="text"
                    placeholder="Search by tags"
                    onChange={(e) => onSearchChange(e.target.value)}
                />
            </div>
        </div>
    );
}


export default PaletteSearchTag;