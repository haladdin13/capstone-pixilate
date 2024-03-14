import React, { useEffect, useState } from "react";
import { Route, Routes, BrowserRouter, useNavigate } from "react-router-dom";
import UserContext from "./UserContext";


import Navbar from "./Navbar";
import UserSignup from "./user_components/UserSignup";
import UserLogin from "./user_components/UserLogin";
import Home from "./Home";

function App() {

  const [login, setLogin] = useState([])
  const [logout, setLogout] = useState([])
  const [currentUser, setCurrentUser] = useState({})




  return(
    <div>
      <UserContext.Provider value={{login, setLogin, logout, setLogout, currentUser, setCurrentUser}}>
        <div className="App">
          <BrowserRouter>
            <Navbar />
            <Routes>
              <Route path="/signup" element={<UserSignup />} />
              <Route path="/login" element={<UserLogin />} />
              <Route path="/" element={<Home />} />
            </Routes>
          </BrowserRouter>
        </div>
      </UserContext.Provider>
    </div>
  )
}

export default App;
