import React, { useEffect, useState } from "react";
import { Route, Routes, BrowserRouter, useNavigate } from "react-router-dom";
import UserContext from "./UserContext";


import Navbar from "./Navbar";
import UserSignup from "./user_components/UserSignup";
import UserLogin from "./user_components/UserLogin";
import Home from "./Home";
import PaletteCreation from "./PaletteCreation";
import PaletteGallery from "./PaletteGallery";
import UserProfile from "./UserProfile";
import AccountMenu from "./home_components/AccountMenu";
import PaletteDetails from "./paletteGallery_components/PaletteDetails";
import UserSettings from "./user_components/UserSettings";
import Header from "./Header";

function App() {

  const [login, setLogin] = useState([])
  const [logout, setLogout] = useState([])
  const [currentUser, setCurrentUser] = useState({})


  useEffect(() => {
    const storedUser = sessionStorage.getItem('currentUser');
    if (storedUser) {
      const user = JSON.parse(storedUser);
      setCurrentUser(user);
    }
  }, [])



  return(
    <div>
      <UserContext.Provider value={{login, setLogin, logout, setLogout, currentUser, setCurrentUser}}>
        <div className="App">
          <BrowserRouter>
          <Header />
            <Navbar />
            <Routes>
              <Route path="/signup" element={<UserSignup />} />
              <Route path="/login" element={<UserLogin />} />
              <Route path="/" element={<Home />} />
              <Route path="/palette-creator" element={<PaletteCreation />} />
              <Route path="/palette-creator/:id" element={<PaletteCreation />} />
              <Route path="/palettes" element={<PaletteGallery />} />
              <Route path="/palettes/:id" element={<PaletteDetails/>} />
              <Route path="/users/:id" element={<UserProfile />}/>
              <Route path="/logout" element={<AccountMenu />} />
              <Route path="/user-settings" element={<UserSettings />} />
            </Routes>
          </BrowserRouter>
        </div>
      </UserContext.Provider>
    </div>
  )
}

export default App;
