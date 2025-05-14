
import { useState, useEffect, createContext } from "react";
import authService from "../services/authService";

// create context used for authentication
export const AuthContext = createContext(null);

// provider component????
const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem("authToken");
        const storedUser = localStorage.getItem("user");
        
        // check if the user is already authenticated by looking for token in localstorage
        //TODO: http only cookies
        if (token && storedUser) {
            setUser(JSON.parse(storedUser));
        }

        setLoading(false);
        // empty array here you can set an element if that element changes run this function
    }, [])

    // login function
    const login = async (username, password) => {
        setLoading(true);
        const response = await authService.login(username, password);

        if (response && response.token) {
            // use local storage change to http only tokens later
            localStorage.setItem("authToken", response.token);
            localStorage.setItem("user", JSON.stringify(response.user));
            setUser(response.user);
            setLoading(false);
            return true;
        }
        setLoading(false);
        return false;
    };

    // logout function
    //TODO: remove token on auth server as well by sending a rest request
    const logout = () => {
        localStorage.removeItem("authToken");
        localStorage.removeItem("user");
        setUser(null);
    };

    const value = {
        user,
        login,
        logout,
        loading
    };

   return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export default AuthProvider;