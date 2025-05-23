import { Navigate, Route, Routes } from "react-router-dom";
import Chat from "../pages/Chat";
import Auth from "../pages/Auth";
import About from "../pages/About";
import useAuth from "../hooks/useAuth";


function AppRoutes() {

    return (
        <Routes>
            <Route 
                path="/" 
                element={<Auth />} />
            <Route 
                path="/chat"
                element={
                <PrivateRoute>
                    <Chat />
                </PrivateRoute>
                } />
            <Route 
                path="/about"
                element={<About />}
            />
        </Routes>
    );
}

// TODO: move to components
const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading....</div>;
    }

    // redirect to login if not authenticated
    // replace to replace the historic of the private route
    if (!user) {
        return <Navigate to="/" replace />
    }
    return children;
};

export default AppRoutes;