import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

const ProtectedRoute = ({ children, requireAuth = true }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-zinc-100 mx-auto mb-4"></div>
                    <p className="text-zinc-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (requireAuth && !user) {
        return <Navigate to="/login" replace />;
    }

    if (!requireAuth && user) {
        return <Navigate to="/dashboard" replace />;
    }

    return children;
};

export default ProtectedRoute;
