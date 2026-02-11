import { Navigate, Outlet } from 'react-router-dom';

const ProtectedRoute = ({ allowedRoles = [] }) => {
    const token = localStorage.getItem('token');
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    if (!token) {
        return <Navigate to="/login" replace />;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.rol)) {
        // Redirect to dashboard if user has no permission but is logged in
        return <Navigate to="/" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;
