import { useCallback, useEffect, useRef, useState } from "react";
import useAuth from "./useAuth";
import webSocketService from "../services/webSocketService";

const useWebSocket = () => {
    const { user } = useAuth();
    const [connectionStatus, setConnectionStatus] = useState('disconnected');
    const [messages, setMessages] = useState([]);
    const [activeUsers, setActiveUsers] = useState([]);
    const messageHandlerRef = useRef(null);
    const connectionHandlerRef = useRef(null);
    const [error, setError] = useState(null);

    // WebSocket Server config
    const WS_SERVER_URL = import.meta.env.VITE_WS_SERVER_URL;

    // handle incoming messages
    const handleMessage = useCallback((message) => {
        console.log('Handling message.', message);

        // add the message to messages
        setMessages(prevMessages => [...prevMessages, {
            sender: message.sender,
            content: message.content,
            timestamp: message.timestamp,
            isFromCurrentUser: message.isFromCurrentUser || false
        }]);

        // handle join/leave messages 
        if (message.type === 'system') {
            if (message.content.includes(' has joined the chat')) {
                const username = message.content.split(' has joined the chat')[0];
                setActiveUsers(prevUsers => {
                    if (!prevUsers.includes(username)) {
                        return [...prevUsers, username].sort();
                    }
                    return prevUsers;
                });
            } else if (message.content.includes(' has left the chat')) {
                const username = message.content.split(' has left the chat')[0];
                setActiveUsers(prevUsers => prevUsers.filter(user => user !== username));
            }
        }
    }, []);

    // handle connection changes
    const handleConnectionChange = useCallback((status) => {
        console.log('Connection status changed: ', status);
        setConnectionStatus(status);

        if (status === 'disconnected') {
            // clear active users when disconnecting
            setActiveUsers([]);
        }
    }, []);

    // connect ot WebSocket server
    const connect = useCallback(async () => {
        if (!user || !user.username) {
            console.error('No user data available for WebSocket connection');
            return false;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('No auth token available for WebSocket connection');
            return false;
        }

        try {  
            setConnectionStatus('connecting');
            setError(null);
            await webSocketService.connect(WS_SERVER_URL, user.username, token);
        } catch (error) {
            console.error('Failed to connect to WebSocket: ', error);
            setConnectionStatus('disconnected');
            setError('Unable to connect to chat server.');
            return false;
        }
    }, [user, WS_SERVER_URL]);

    // disconnect from WebSocket server
    const disconnect = useCallback(() => {
        webSocketService.disconnect();
        setConnectionStatus('disconnected');
        setMessages([]);
        setActiveUsers([]);
    }, []);

    // send message
    const sendMessage = useCallback((content) => {
        if (!connect || !content.trim()) {
            return false;
        }

        const success = webSocketService.sendMessage(content.trim());

        if (success && user && user.username) {
            // add own message to the message array immediately
            const userMessage = {
                sender: user.username,
                content: content.trim(),
                timestamp: new Date(),
                isFromCurrentUser: true
            };

            setMessages(prevMessages => [...prevMessages, userMessage]);
        }

        return success;
    }, [user]);

    // clear messages
    const clearMessages = useCallback(() => {
        setMessages([{
            sender: 'System',
            content: 'Message history cleared.',
            timestamp: new Date(),
            isFromCurrentUser: false
        }]);
    }, []);

    // set up message and connection handlers
    useEffect(() => {
        // remove existing handlers if any
        if (messageHandlerRef.current) {
            webSocketService.removeMessageHandler(messageHandlerRef.current);
        }
        if (connectionHandlerRef.current) {
            webSocketService.removeConnectionHandler(connectionHandlerRef.current);
        }

        // add new handlers
        messageHandlerRef.current = handleMessage;
        connectionHandlerRef.current = handleConnectionChange;

        webSocketService.addMessageHandler(messageHandlerRef.current);
        webSocketService.addConnectionHandler(connectionHandlerRef.current);

        return () => {
            if (messageHandlerRef.current) {
                webSocketService.removeMessageHandler(messageHandlerRef.current);
            }
            if (connectionHandlerRef.current) {
                webSocketService.removeConnectionHandler(connectionHandlerRef.current);
            }
        };
    }, [handleMessage, handleConnectionChange]);

    // auto connect when user is available 
    useEffect(() => {
        if (user && user.username && connectionStatus === 'disconnected') {
            console.log('User available, attempting to connect to WebSocket...');
            connect();
        }

        // disconnect when user logs out
        return () => {
            if (!user) {
                disconnect();
            }
        };
    }, [user, connect, disconnect, connectionStatus]);

    return {
        connectionStatus,
        messages,
        activeUsers,
        connect,
        disconnect,
        sendMessage,
        clearMessages,
        isConnected: connectionStatus === 'connected',
        error
    };
};

export default useWebSocket;