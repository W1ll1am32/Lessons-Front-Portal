import React from 'react';
import {Navigate} from 'react-router-dom';

interface ProtectedRouteProps {
    children: React.ReactElement;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
    const token = localStorage.getItem('jwt');

    if (!token) {
        return <Navigate to="/login" replace />; // ???
    }

    return <>{children}</>;
}

export default ProtectedRoute;