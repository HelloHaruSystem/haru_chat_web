const API_BASE_URL = import.meta.env.VITE_AUTH_BASE_URL || "http://localhost:3000/api/auth";;

class authService {
    static async login(username, password) {
        try {
            const response = await fetch(API_BASE_URL, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    username: username,
                    password: password
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({ message: "Unknown error"}));
                console.error(`Login failed with status: ${response.status}`, errorData);
                
                return null
            }
            const data = await response.json();
            console.log("Login successful");
            
            return data;
        } catch (error) {
            console.error("Error during login: ", error);
            return null;
        }
    }
};

export default authService;