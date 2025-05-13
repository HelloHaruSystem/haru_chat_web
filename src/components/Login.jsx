import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "../hooks/useAuth";

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
            const success = await Login(input.username, input.password);
            
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
        setError("");
        console.log("Registration button has been clicked :)")
        setError("Registration function not yet implemented :)")
    };

    return (
        <form onSubmit={handleLoginSubmit}>
            {error && <div className="error-message">{error}</div>}
            <label className="form-label">
                Username
            </label>
            <input 
                type="text" 
                name="username"
                value={input.username}
                onChange={handleChange}
                placeholder="Enter username here..."
                ></input>
            <label className="form-label">
                Password
            </label>
            <input 
                type="password"
                name="password"
                value={input.password}
                onChange={handleChange}
                placeholder="Enter password here..."
            ></input>
            <button type="submit" className="login-button">
                Login
            </button>
            <button className="registerButton" onClick={handleRegistration}>
                Register
            </button>
        </form>
    );
}

export default Login;