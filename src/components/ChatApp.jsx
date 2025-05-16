import { useState } from "react";

function ChatApp () {
    const [isSidebarExpanded, setIsSideBarExpanded] = useState(true);
    const [activeUsers, setActiveUsers] = useState([]);

    const toggleSideBar = () => {
        setIsSideBarExpanded(!isSidebarExpanded);
    };

    const clearChat = () => {
        setMessage([{
            sender: 'System',
            content: 'Message history cleared.',
            timestamp: new Date(),
            isFromCurrentUser: false
        }]);
    };

    const formatTime = date => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    return (
        <div className="chat-container">
            <TopBar onClick={clearChat} />

            <div className="chat-main">

            </div>
        </div>
    );
}

function TopBar({ clearChat }) {
    
    return (
        <div className="top-bar">
          <div className="spacer"></div>
            <div className="button-box">
                <button className="top-bar-button">Server Select</button>
                <button className="top-bar-button" onClick={clearChat}>Clear Chat</button>
                <button className="top-bar-button">Private Message</button>
                <button className="top-bar-button">Help</button>
            </div>
        </div>
    );
}

function userListSideBar({ isSidebarExpanded, activeUsers, toggleSidebar }) {

    return (
        <div className={`user-list-sidebar ${isSidebarExpanded ? 'expanded' : 'collapsed'}`}>
            <div className="sidebar-content">
                <div className="user-list-header">
                    Active Users ({activeUsers.length})
                </div>
                <ul className="user-list">
                    {activeUsers.map((user, index) => (
                        <li key={index} className="user-list-item">
                            <div className="online-indicator"></div>
                            <span className="username-label">{user}</span>
                        </li>
                    ))}
                </ul>
            </div>
            <button
                className="toggle-button"
                onClick={toggleSidebar}
                aria-label={isSidebarExpanded ? "Collapse sidebar" : "Expand sidebar"}
                >
                    {isSidebarExpanded ? '◀' : '▶'}
                </button>
        </div>
    );
}

export default ChatApp;