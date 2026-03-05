import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const ProtectedRoute = ({ children }) => {
    const { token, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div>Loading...</div>;

    if (!token) {
        return <Navigate to="/login" state={{ from: location }} replace />;
    }

    return children;
};

export const AdminRoute = ({ children }) => {
    const { user, token, loading } = useAuth();
    const location = useLocation();

    if (loading) return <div>Loading...</div>;

    if (!token || user?.role !== 'admin') {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};
