import React from "react";
import { useUser } from "./UserContext";

import AccountMenu from './home_components/AccountMenu';

function Home() {

    const {currentUser, setCurrentUser} = useUser();

    const user_name = currentUser.username

    return (
        <div>
            <AccountMenu />
            <h1>Home</h1>
            <h4>{user_name}</h4>
            <p>Welcome to Pixilate {user_name}</p>

        </div>
    )
}

export default Home;