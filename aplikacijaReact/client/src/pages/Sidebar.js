import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

const Sidebar = ({user2}) => {
    const [user, setUser] = useState(() => {
        const storedUser = JSON.parse(localStorage.getItem("korisnik"));
        return storedUser || null; 
    });

    const handleLogout = () => {
        localStorage.removeItem("korisnik");
        setUser(null); 
    };

    useEffect(() => {
        const storedUser = JSON.parse(localStorage.getItem("korisnik"));
        if (storedUser !== user) {
            setUser(storedUser || null);
        }
       
    }, [user2]);

    return (
        <div className="sidebar">
            <ul>
                <li>
                    <Link to="/">Home</Link>
                </li>
                {user ? (
                    <>
                        <li>
                            <Link to="/book">Book</Link>
                        </li>
                        <li>
                            <Link to="/openPack">Open Pack</Link>
                        </li>
                        <li>
                            <Link to="/duplicates">Duplicates</Link>
                        </li>
                        <li>
                            <Link to="/tradeRequest">Trade Request</Link>
                        </li>
                        <li>
                            <Link to="/" onClick={handleLogout}>Logout</Link>
                        </li>
                    </>
                ) : (
                    <>
                        <li>
                            <Link to="/login">Login</Link>
                        </li>
                        <li>
                            <Link to="/register">Register</Link>
                        </li>
                        
                    </>
                )}
                
            </ul>
        </div>
    );
};

export default Sidebar;
