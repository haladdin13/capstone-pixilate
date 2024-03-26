import React from 'react'
import AccountMenu from './home_components/AccountMenu'
import { Link } from 'react-router-dom'
import styles from './App.css'




function Header(){

    return (
        <div>
            <div className="header">
                <div className="header-left">
                    <Link to="/">
                        <img src="logo.png" alt="logo" />
                    </Link>
                </div>
                <div className="header-center">
                    <h1>Pixilate</h1>
                </div>
                <div className="header-right">
                    <AccountMenu />
                </div>
            </div>
        </div>
    )

}

export default Header