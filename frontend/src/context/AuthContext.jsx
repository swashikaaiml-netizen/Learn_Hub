import React, { createContext, useState, useEffect, useContext } from 'react';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('token'));
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (token) {
            const storedUser = JSON.parse(localStorage.getItem('user'));
            if (storedUser) {
                setUser(storedUser);
            }
        }
        setLoading(false);
    }, [token]);

    const apiCall = async (endpoint, options = {}) => {
        const url = `http://localhost:5000${endpoint}`;
        const headers = {
            'Content-Type': 'application/json',
            ...(token ? { 'x-auth-token': token } : {}),
            ...options.headers
        };
        const response = await fetch(url, { ...options, headers });
        if (!response.ok) {
            const error = await response.json();
            throw new Error(error.msg || 'Something went wrong');
        }
        return response.json();
    };

    const login = async (email, password) => {
        const data = await apiCall('/api/auth/login', {
            method: 'POST',
            body: JSON.stringify({ email, password })
        });
        const { token, user } = data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        return user;
    };

    const register = async (name, email, password) => {
        const data = await apiCall('/api/auth/register', {
            method: 'POST',
            body: JSON.stringify({ name, email, password })
        });
        const { token, user } = data;
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setToken(token);
        setUser(user);
        return user;
    };

    const logout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout, apiCall }}>
            {children}
        </AuthContext.Provider>
    );
};
