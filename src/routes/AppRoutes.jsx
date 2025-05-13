import { Route, Routes } from "react-router-dom";
import Chat from "../pages/Chat";
import Auth from "../pages/Auth";

function AppRoutes() {

    return (
        <Routes>
            <Route path="/" element={<Auth />} />
            <Route path="/chat" element={<Chat />} />
        </Routes>
    );
}

export default AppRoutes;