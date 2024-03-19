import React from "react";
import { useUser } from "./UserContext";

import AccountMenu from './home_components/AccountMenu';

function Home() {

    const {currentUser, setCurrentUser} = useUser();

    const user_name = currentUser.username

    return (
        <div>
            <h1>Home</h1>

        </div>
    )
}

export default Home;