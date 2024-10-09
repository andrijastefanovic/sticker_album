import React, { useState } from 'react';
import './App.css';
import Sidebar from './pages/Sidebar';
import Login from './pages/Login';
import Book from './pages/Book';
import Player from './pages/Player';
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import OpenPack from './pages/OpenPack';
import Logout from './pages/Logout';
import Register from './pages/Register';
import Duplicates from './pages/Duplicates';
import TradeRequest from './pages/TradeRequest';
import TradeExecution from './pages/TradeExecution';

function App() {
  const [user, setUser] = useState(JSON.parse(localStorage.getItem("korisnik")));

  const updateUser = () => {
    setUser(JSON.parse(localStorage.getItem("korisnik")));
    console.log("BBBB")
  };

  return (
    <div className="App">
      <Router>
        <Sidebar user2={user} />
        <div className="content">
          <Routes>
            <Route
              path="/login"
              exact
              element={<Login updateUser={updateUser} />}
            />
            <Route path="/book" exact element={<Book />} />
            <Route path="/openPack" exact element={<OpenPack />} />
            <Route path='/register' exact element={<Register />} />
            <Route path="/logout" exact element={<Logout />} />
            <Route path='/player' exact element={<Player />} />
            <Route path='/duplicates' exact element={<Duplicates />} />
            <Route path='/tradeRequest' exact element={<TradeRequest />} />
            <Route path='/tradeExecution' exact element={<TradeExecution />} />
          </Routes>
        </div>
      </Router>
    </div>
  );
}

export default App;