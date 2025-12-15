import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext.jsx';
import ProtectedRoute from "./ProtectedRoute.jsx";

const PublicOnlyRoute = ({children}) => {
    const {isAuthenticated, loading} = useAuth();
    if(loading) {
        return <div>Loading...</div>;
    }
    if(isAuthenticated) {
        return <Navigate to="/" replace/>;
    }
    return children;
}

export default PublicOnlyRoute;