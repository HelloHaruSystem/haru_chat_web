import Login from "../components/Login";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

function Auth() {
    const { user } = useAuth();

    // if the user is already logged in redirect to the chat
    return user ? (
        <Navigate to="/chat" replace /> 
    ) : (
        <div className="auth-container">
            <Login />
        </div>
    ); 

    
}

export default Auth;