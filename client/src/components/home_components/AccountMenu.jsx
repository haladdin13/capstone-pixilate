import React, {useState, useEffect} from "react";
import { useUser } from "../UserContext";
import { useNavigate } from "react-router-dom";
import { Link } from "react-router-dom"


function AccountMenu() {

    const {currentUser, setCurrentUser} = useUser();
    const [isOpen, setIsOpen] = useState(false);

    const navigate = useNavigate();

    const toggleMenu = () => setIsOpen(!isOpen);

    //Logout the current user
    const loggingOut = () => {

        fetch(`http://localhost:5555/logout`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            credentials: 'include',
        })
        .then(res => res.json())
        .then(data => {
             console.log(data)
             sessionStorage.removeItem('currentUser')
             setCurrentUser({})
             navigate('/')
        }, [])
    }

    
    // Check if logged in, show logout. If not logged in show signup and login, 
    //and link to login or signup page
    
    function isLoggedIn() {
        if (currentUser.username) {
            return (
                <div className="dropdown-menu">
                    <button onClick={loggingOut}>
                        <Link to="/logout">Logout</Link>
                    </button>
                    <button>
                        <Link to={`/users/${currentUser.id}`}>User Profile</Link>
                    </button>
                    <button>
                        <Link to="/user-settings">User Settings</Link>
                    </button>
                </div>
            )
        } else {
            return (
                <div className="dropdown-menu">
                    <button>
                        <Link to="/login">Login</Link>
                    </button>
                    <button>
                        <Link to="/signup">Sign Up</Link>
                    </button>
                </div>
            )
        }
    }



    return (
        <div>
            <button onClick={toggleMenu} className="avatar-button" style={{ border: 'none', background: 'none' }}>
                <img src={currentUser?.avatarUrl || '/default-avatar.png'} alt="User Avatar" className="user-avatar" />
            </button>

            {isOpen && (
                <div className="dropdown-menu">
                    <div className="dropdown-menu-header">
                        <div className="dropdown-menu-header-title">
                            <h3 className="user-text">{currentUser.username}</h3>
                        </div>
                        <div className="dropdown-menu-header-close" onClick={toggleMenu}>
                            <i className="fas fa-times"></i>
                        </div>
                    </div>
                    <div className="dropdown-menu-body">
                        {isLoggedIn()}
                    </div>
                </div>
            )}
        </div>
    )
}

export default AccountMenu;