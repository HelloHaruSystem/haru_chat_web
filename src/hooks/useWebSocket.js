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
    const connectionAttemptedRef = useRef(false);
    const [error, setError] = useState(null);
    const sentMessagesRef = useRef(new Map()); // Track sent messages

    // WebSocket Server config
    const WS_SERVER_URL = import.meta.env.VITE_WS_SERVER_URL;

    // Log the WebSocket URL to verify it's correct
    useEffect(() => {
        console.log('WebSocket URL from env:', WS_SERVER_URL);
    }, [WS_SERVER_URL]);

    // Check if a message is a duplicate of one we've sent
    const isDuplicate = useCallback((message) => {
        if (!user || message.sender !== user.username) {
            return false;
        }

        // Create a key for this message
        const messageKey = `${message.content}-${Date.now().toString().slice(0, -4)}`;
        
        // Check if we've recently sent this message
        for (const [key, timestamp] of sentMessagesRef.current.entries()) {
            // If the message content matches and was sent within the last 5 seconds
            if (key.startsWith(message.content) && Date.now() - timestamp < 5000) {
                console.log('Detected duplicate message:', message.content);
                return true;
            }
        }
        
        return false;
    }, [user]);

    // handle incoming messages
    const handleMessage = useCallback((message) => {
        console.log('Handling message:', message);

        // Skip duplicates of messages we've sent
        if (isDuplicate(message)) {
            console.log('Skipping duplicate message');
            return;
        }

        // add the message to messages
        setMessages(prevMessages => [...prevMessages, {
            sender: message.sender,
            content: message.content,
            timestamp: message.timestamp,
            isFromCurrentUser: message.isFromCurrentUser || (user && message.sender === user.username)
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
    }, [user, isDuplicate]);

    // handle connection changes
    const handleConnectionStatus = useCallback((status) => {
        console.log('Connection status changed:', status);
        
        // Update the UI status
        setConnectionStatus(status);

        if (status === 'disconnected') {
            // clear active users when disconnecting
            setActiveUsers([]);
        } else if (status === 'connected') {
            // Clear any errors when successfully connected
            setError(null);
        }
    }, []);

    // connect to WebSocket server
    const connect = useCallback(async () => {
        if (!user || !user.username) {
            console.error('No user data available for WebSocket connection');
            setError('Login required to connect to chat');
            return false;
        }

        const token = localStorage.getItem('authToken');
        if (!token) {
            console.error('No auth token available for WebSocket connection');
            setError('Authentication token not found');
            return false;
        }

        try {  
            console.log(`Attempting to connect to ${WS_SERVER_URL} with user ${user.username}`);
            setConnectionStatus('connecting');
            setError(null);
            
            await webSocketService.connect(WS_SERVER_URL, user.username, token);
            console.log('Connection completed successfully');
            return true;
        } catch (error) {
            console.error('Failed to connect to WebSocket:', error);
            setConnectionStatus('disconnected');
            setError(`Unable to connect to chat server: ${error.message}`);
            return false;
        }
    }, [user, WS_SERVER_URL]);

    // disconnect from WebSocket server
    const disconnect = useCallback(() => {
        console.log('Disconnecting from WebSocket server');
        webSocketService.disconnect();
        setConnectionStatus('disconnected');
        setMessages([]);
        setActiveUsers([]);
    }, []);

    // send message
    const sendMessage = useCallback((content) => {
        if (!content || !content.trim()) { 
            return false;
        }
        
        const trimmedContent = content.trim();
        
        // Check current connection status first
        const currentStatus = webSocketService.getConnectionStatus();
        console.log(`Sending message with connection status: ${currentStatus}`);
        
        if (currentStatus !== 'connected') {
            console.error('Cannot send message - not connected');
            return false;
        }
        
        const success = webSocketService.sendMessage(trimmedContent);
        console.log('Message send result:', success);

        if (success && user && user.username) {
            // Store this message to detect duplicates
            const messageKey = `${trimmedContent}-${Date.now().toString().slice(0, -4)}`;
            sentMessagesRef.current.set(messageKey, Date.now());
            
            // Clean up old entries
            const now = Date.now();
            for (const [key, timestamp] of sentMessagesRef.current.entries()) {
                if (now - timestamp > 10000) { // 10 seconds
                    sentMessagesRef.current.delete(key);
                }
            }
            
            // add own message to the message array immediately
            const userMessage = {
                sender: user.username,
                content: trimmedContent,
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

    // Manual reconnect function for UI
    const reconnect = useCallback(async () => {
        console.log('Manual reconnection requested');
        disconnect();
        connectionAttemptedRef.current = false;
        return await connect();
    }, [connect, disconnect]);

    // set up message and connection handlers
    useEffect(() => {
        console.log('Setting up WebSocket handlers');
        
        // remove existing handlers if any
        if (messageHandlerRef.current) {
            webSocketService.removeMessageHandler(messageHandlerRef.current);
        }
        if (connectionHandlerRef.current) {
            webSocketService.removeConnectionHandler(connectionHandlerRef.current);
        }

        // add new handlers
        messageHandlerRef.current = handleMessage;
        connectionHandlerRef.current = handleConnectionStatus;

        webSocketService.addMessageHandler(messageHandlerRef.current);
        webSocketService.addConnectionHandler(connectionHandlerRef.current);

        // Initial connection status check
        const currentStatus = webSocketService.getConnectionStatus();
        console.log('Current WebSocket status on handler setup:', currentStatus);
        
        // If already connected, update the UI to reflect that
        if (currentStatus === 'connected') {
            handleConnectionStatus('connected');
        }

        return () => {
            console.log('Cleaning up WebSocket handlers');
            if (messageHandlerRef.current) {
                webSocketService.removeMessageHandler(messageHandlerRef.current);
            }
            if (connectionHandlerRef.current) {
                webSocketService.removeConnectionHandler(connectionHandlerRef.current);
            }
        };
    }, [handleMessage, handleConnectionStatus]);

    // auto connect when user is available 
    useEffect(() => {
        if (user && user.username && connectionStatus === 'disconnected' && !connectionAttemptedRef.current) {
            console.log('User available, attempting to connect to WebSocket...');
            connectionAttemptedRef.current = true;
            
            connect().catch(error => {
                console.error('Auto-connect failed:', error);
                // Set connection attempted to false to allow retrying
                setTimeout(() => {
                    connectionAttemptedRef.current = false;
                }, 5000); // Allow retry after 5 seconds
            });
        }

        // Reset connection attempted flag when user logs out
        if (!user) {
            connectionAttemptedRef.current = false;
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
        reconnect,
        sendMessage,
        clearMessages,
        isConnected: connectionStatus === 'connected',
        error
    };
};

export default useWebSocket;