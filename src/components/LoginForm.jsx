function LoginForm() {

    const handleRegistration = () => {

    };

    return (
        <form>
            <label className="form-label">
                Username
            </label>
            <input type="text" placeholder="Enter username here"></input>
            <label className="form-label">
                Password
            </label>
            <input type="password" placeholder="Enter password here"></input>
            <button type="submit" classname="login-button">
                Login
            </button>
            <button className="registerButton" onClick={handleRegistration}>
                Register
            </button>
        </form>
    );
}

export default LoginForm;