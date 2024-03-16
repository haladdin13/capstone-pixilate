import React from 'react';
import {Link, useMatch, useResolvedPath} from 'react-router-dom';

//Navbar Component


function Navbar() {
    return(
        <nav className="navbar navbar-expand-lg navbar-light bg-light">
            <Link to='/' className='site-logo'>
                Pixilate
            </Link>
            <ul>
                <CustomLink to='/'>Home</CustomLink>
                <CustomLink to='/palette-creator'>Palette Creator</CustomLink>
            </ul>
        </nav>
    )

    function CustomLink({to, children, ...props}) {
        const resolvedPath = useResolvedPath(to)
        const isMatch = useMatch({ path: resolvedPath.pathname})
        return(
            <li className={isMatch === to ? "active" : ""}>
                <Link to={to} {...props}>
                    {children}
                </Link>
            </li>
        )
    }
}


export default Navbar;