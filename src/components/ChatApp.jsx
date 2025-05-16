import { useEffect, useRef, useState } from "react";
import useAuth from "../hooks/useAuth";
import '../css/ChatApp.css'

function ChatApp () {
    const [messages, setMessages] = useState([]);
    const [messageInput, setMessageInput] = useState('');
    const [isSidebarExpanded, setIsSideBarExpanded] = useState(true);
    const [activeUsers, setActiveUsers] = useState([]);
    const messageListRef = useRef(null);
    const { user } = useAuth();

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

        const newMessage = {
            sender: user ? user.username : 'Anonymous',
            content: messageInput,
            timestamp: new Date(),
            isFromCurrentUser: true
        };

        setMessages([...messages, newMessage]);
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

    const clearChat = () => {
        setMessages([{
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
            <TopBar clearChat={clearChat} />

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
                    />
                </div>
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
                            <div className="sender-content">{message.content}</div>
                            <div className="message-time">{formatTime(message.timestamp)}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}

function InputArea({ handleSendMessage, messageInput, setMessageInput, handleKeyPress,}) {

    return (
        <form className="input-area" onSubmit={handleSendMessage}>
            <input
                type="text"
                className="message-input"
                placeholder="Type message here"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                onKeyDown={handleKeyPress}>
            </input>
            <button type="submit" className="send-button">Send</button>
        </form>
    );
}

export default ChatApp;