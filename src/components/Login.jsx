import { useState } from "react";

function Login() {
    const [input, setInput] = useState({
        username: "",
        password: ""
    });

    const handleLoginSubmit = (e) => {
        e.preventDefault();
        if (input.username !== "" && input.password !== "") {
            // call service method to login
        } else {
            alert("Please enter a username and password");
        }
    }

    const handleRegistration = () => {

    };

    return (
        <form onSubmit={handleLoginSubmit}>
            <label className="form-label">
                Username
            </label>
            <input type="text" placeholder="Enter username here"></input>
            <label className="form-label">
                Password
            </label>
            <input type="password" placeholder="Enter password here"></input>
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