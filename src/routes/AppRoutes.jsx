import { Navigate, Route, Routes } from "react-router-dom";
import Chat from "../pages/Chat";
import Auth from "../pages/Auth";

function AppRoutes() {

    return (
        <Routes>
            <Route path="/" element={<Auth />} />
            <Route 
                path="/chat"
                element={
                <PrivateRoute>
                    <Chat />
                </PrivateRoute>
                } 
            />
        </Routes>
    );
}

const PrivateRoute = ({ children }) => {
    const user = useAuth();
    if (!user || !user.token) {
        return <Navigate to="/" replace />
    }
    return children;
};

export default AppRoutes;