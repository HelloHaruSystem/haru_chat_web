import { useState } from "react";
import useAuth from "../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import '../css/Login.css';

function Login() {
    const [input, setInput] = useState({
        username: "",
        password: ""
    });
    const [error, setError] = useState("");
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleChange = (e) => {
        const { name, value } = e.target;
        setInput(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if (input.username !== "" && input.password !== "") {
            const success = await login(input.username, input.password);
            
            if (success) {
                navigate("/chat");
            } else {
                setError("Invalid username or password");
            }
        } else {
            setError("Please enter a username or password");
        }
    };

    const handleRegistration = () => {
        console.log("Registration button has been clicked :)")
        setError("Registration function not yet implemented :)")
    };

    return (
        <form onSubmit={handleLoginSubmit} className="login-form">
            {error && <div className="error-message">{error}</div>}
            <label className="form-label">
                Username
            </label>
            <input 
                type="text" 
                name="username"
                className="input-field"
                value={input.username}
                onChange={handleChange}
                placeholder="Enter username here..."
                autoComplete="off"
                ></input>
            <label className="form-label">
                Password
            </label>
            <input 
                type="password"
                name="password"
                className="input-field"
                value={input.password}
                onChange={handleChange}
                placeholder="Enter password here..."
                autoComplete="off"
            ></input>
            <div className="button-container">
                <button type="submit" className="button">
                    Login
                </button>
                <button className="button" type="button" onClick={handleRegistration}>
                    Register
                </button>
            </div>
        </form>
    );
}

export default Login;