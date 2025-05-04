import React, { useEffect, useState } from 'react';
import { Bell, BellRing, LogOut, UserCircle, Mail, Phone, Code2, Settings2, UserCog } from 'lucide-react';
import axios from 'axios';
import './NavBar.css'; // Using scoped component styles
import EduFlowLogo from './EduFlowLogo.svg';

function NavBar() {
    const [allRead, setAllRead] = useState(true);
    const [showCard, setShowCard] = useState(false); 
    const [userData, setUserData] = useState(null); 
    const userId = localStorage.getItem('userID');

    useEffect(() => {
        const fetchNotifications = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/notifications/${userId}`);
                const unreadNotifications = response.data.some(notification => !notification.read);
                setAllRead(!unreadNotifications);
            } catch (error) {
                console.error('Error fetching notifications:', error);
            }
        };

        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://localhost:8080/user/${userId}`);
                setUserData(response.data);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };

        if (userId) {
            fetchNotifications();
            fetchUserData();
        }
    }, [userId]);


    const getInitials = (name) => {
        return name
            ?.split(' ')
            .map(word => word[0])
            .join('')
            .toUpperCase() || 'U';
    };

    const currentPath = window.location.pathname;

    return (
        <nav className="navbar-component">

<div className="navbar-container">
                <div className="navbar-logo">
                    <img src={EduFlowLogo} alt="EduFlow Logo" className="navbar-logo-img" />
                </div>
                
                <div className="navbar-items">
                    <div className="navbar-icon-container">
                        {allRead ? (
                            <Bell
                                className={`navbar-icon ${currentPath === '/notifications' ? 'active' : ''}`}
                                onClick={() => (window.location.href = '/notifications')}
                                size={24}
                                strokeWidth={1.5}
                            />
                        ) : (
                            <BellRing 
                                className="navbar-icon active"
                                onClick={() => (window.location.href = '/notifications')}
                                size={24}
                                strokeWidth={1.5}
                            />
                        )}
                    </div>
                    
                    <div className="navbar-icon-container">
                        <LogOut
                            className="navbar-icon"
                            onClick={() => {
                                localStorage.removeItem('userID');
                                localStorage.removeItem('userType');
                                window.location.href = '/';
                            }}
                            size={24}
                            strokeWidth={1.5}
                        />
                    </div>
                    
                    <div className="navbar-icon-container">
                        <UserCircle
                            className="navbar-icon"
                            style={{ display: localStorage.getItem('userType') === 'googale' ? 'none' : 'block' }}
                            onClick={() => setShowCard(!showCard)}
                            size={24}
                            strokeWidth={1.5}

                            
                        />
                    </div>
                </div>
            </div>
            
        </nav>
    );
}

export default NavBar;