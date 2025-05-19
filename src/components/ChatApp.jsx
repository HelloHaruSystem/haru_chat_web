import { useEffect, useRef, useState } from "react";
import useAuth from "../hooks/useAuth";
import '../css/ChatApp.css'
import useWebSocket from "../hooks/useWebSocket";

function ChatApp () {
    const [messageInput, setMessageInput] = useState('');
    const [isSidebarExpanded, setIsSideBarExpanded] = useState(true);
    const messageListRef = useRef(null);
    const { user } = useAuth();

    // use webSocket hook
    const {
        connectionStatus,
        messages,
        activeUsers,
        sendMessage,
        clearMessages,
        isConnected,
        error
    } = useWebSocket();

    // auto scroll to bottom when a new message is received
    useEffect(() => {
        if (messageListRef.current) {
            scrollToBottom();
        }
    }, [messages]);

    const scrollToBottom = () => {
        if (messageListRef.current) {
            messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
        }
    };

    const handleSendMessage = (e) => {
        e.preventDefault();
        if (messageInput.trim() === '') return;

        sendMessage(messageInput);
        setMessageInput('');
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            handleSendMessage(e);
        }
    };

    const toggleSideBar = () => {
        setIsSideBarExpanded(!isSidebarExpanded);
    };

    const handleClearChat = () => {
        clearMessages();
    };

    const formatTime = date => {
        return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    };

    if (error) {
        return (
            <div className="chat-error-container">
                <div className="chat-error-message">
                    <p style={{ color: '#ff6b6b', fontSize: '1rem' }}>
                        {error}
                    </p>
                </div>

            </div>
        );
    }

    return (
        <div className="chat-container">
            <TopBar
                clearChat={handleClearChat}
                connectionStatus={connectionStatus}
                isConnected={isConnected}
            />

            <div className="chat-main">
                <UserListSideBar 
                    isSidebarExpanded={isSidebarExpanded}
                    activeUsers={activeUsers}
                    toggleSidebar={toggleSideBar}
                />
                <div className="message-list-container">
                    <MessageList 
                        messages={messages}
                        messageListRef={messageListRef}
                        formatTime={formatTime}
                    />
                    <InputArea
                        handleSendMessage={handleSendMessage}
                        messageInput={messageInput}
                        setMessageInput={setMessageInput}
                        handleKeyPress={handleKeyPress}
                        isConnected={isConnected}
                    />
                </div>
            </div>
        </div>
    );
}

//TODO: move this to a .css file! soon
function TopBar({ clearChat, connectionStatus, isConnected }) {
    const getConnectionStatusColor = () => {
        switch (connectionStatus) {
            case 'connected':
                return '#2ed573'; // Green
            case 'connecting':
                return '#ffa502'; // Orange
            case 'disconnected':
                break;
            case 'error':
                return '#ff4757';
            default:
                return '#636e72'; // Gray
        }
    };

    const getConnectionStatusText = () => {
        switch (connectionStatus) {
            case 'connected':
                return 'Connected';
            case 'connecting':
                return 'Connecting...';
            case 'disconnected':
                return 'Disconnected';
            case 'error':
                return 'Connection Error';
            default:
                return 'Unknown';
        }
    };
    
    return (
        <div className="top-bar">
            <div className="connection-status" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div
                    style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: getConnectionStatusColor()
                    }}
                    >
                </div>
                <span style={{ fontSize: '12px', color: '#e0e0e0' }}>
                    {getConnectionStatusText()}
                </span>
            </div>
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

function UserListSideBar({ isSidebarExpanded, activeUsers, toggleSidebar }) {

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

function MessageList({ messages, messageListRef, formatTime }) {

    return (
        <div className="message-list-container">
            <div className="message-list" ref={messageListRef}>
                {messages.map((message, index) => (
                    <div
                        key={index}
                        className={`message-container ${message.isFromCurrentUser ? 'current-user' : ''}`}
                    >
                        <div className={`message-bubble ${message.isFromCurrentUser ? 'current-user-bubble' : message.sender === 'System' ? 'system-message' : 'other-user-bubble'}`}>
                            {!message.isFromCurrentUser && message.sender !== 'System' && (
                                <div className="sender-name">{message.sender}</div>
                            )}
                            {message.sender === 'System' && (
                                <div className="sender-name">System:</div>
                            )}
                            <div className="sender-content">{message.content}</div>
                            <div className="message-time">{formatTime(message.timestamp)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function InputArea({ handleSendMessage, messageInput, setMessageInput, handleKeyPress, isConnected }) {

    return (
        <form className="input-area" onSubmit={handleSendMessage}>
            <input
                type="text"
                className="message-input"
                placeholder={isConnected ? "Type message here..." : "Connecting..."}
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyPress}
                disabled={!isConnected}
            />
            <button type="submit" className="send-button" disabled={!isConnected || !messageInput.trim()}>
                Send
            </button>
        </form>
    );
}

export default ChatApp;