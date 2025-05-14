import Login from "../components/Login";
import { Navigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import '../css/Auth.css'

function Auth() {
    const { user } = useAuth();

    // if the user is already logged in redirect to the chat
    return user ? (
        <Navigate to="/chat" replace /> 
    ) : (
        <div className="auth-container">
            <div className="form-container">
                <Login />
            </div>
        </div>
    ); 

    
}

export default Auth;