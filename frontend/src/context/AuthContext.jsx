import { createContext, useState, useEffect } from 'react';
import axios from 'axios';
import { io } from 'socket.io-client';
import { API_URL } from '../config';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [socket, setSocket] = useState(null);

    // Initialize socket connection
    const initSocket = (userData) => {
        const newSocket = io(API_URL);
        setSocket(newSocket);

        newSocket.on('connect', () => {
            console.log('Connected to socket server');
            if (userData.role === 'driver') {
                newSocket.emit('join_driver_room', userData._id);
            } else if (userData.role === 'user') {
                newSocket.emit('join_user_room', userData._id);
            }
        });
    };

    useEffect(() => {
        const storedUser = localStorage.getItem('user');
        if (storedUser) {
            const parsedUser = JSON.parse(storedUser);
            setUser(parsedUser);
            axios.defaults.headers.common['Authorization'] = `Bearer ${parsedUser.token}`;
            initSocket(parsedUser);
        }
        setLoading(false);

        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    const login = async (email, password) => {
        const res = await axios.post(`${API_URL}/api/auth/login`, { email, password });
        const userData = { ...res.data };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        initSocket(userData);
        return userData;
    };

    const register = async (name, email, password, role, extraData) => {
        const payload = { name, email, password, role, ...extraData };
        const res = await axios.post(`${API_URL}/api/auth/register`, payload);
        const userData = { ...res.data };
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        axios.defaults.headers.common['Authorization'] = `Bearer ${userData.token}`;
        initSocket(userData);
        return userData;
    };

    const logout = () => {
        localStorage.removeItem('user');
        setUser(null);
        delete axios.defaults.headers.common['Authorization'];
        if (socket) {
            socket.disconnect();
            setSocket(null);
        }
    };

    return (
        <AuthContext.Provider value={{ user, loading, login, register, logout, socket }}>
            {children}
        </AuthContext.Provider>
    );
};
