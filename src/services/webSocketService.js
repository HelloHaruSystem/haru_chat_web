class WebSocketService {
    constructor() {
        this._socket = null;
        this._messageHandlers = [];
        this._connectionHandlers = [];
        this._reconnectAttempts = 0;
        this._maxReconnectAttempts = 5;
        this._reconnectDelay = 1000; // milliseconds therefore 1 second
        this._isConnecting = false; // flag for connection in progress
        this._connectionStatus = 'disconnected';
    }

    // connect method to the webSocket chat server
    connect(serverUrl, username, token) {
        if (this._socket && this._socket.readyState === WebSocket.OPEN) {
            console.log('Already connected');
            this._setConnectionStatus('connected');
            return Promise.resolve();
        }

        if (this._isConnecting) {
            console.log('Connection already in progress');
            return Promise.reject(new Error('Connection already in progress'));
        }

        this._isConnecting = true;
        this._setConnectionStatus('connecting');

        return new Promise((resolve, reject) => {
            try {
                console.log(`Connecting to ${serverUrl}...`);
                
                // create the WebSocket connection
                this._socket = new WebSocket(serverUrl);

                // Set a connection timeout
                const connectionTimeout = setTimeout(() => {
                    if (this._isConnecting) {
                        console.error('WebSocket connection timeout');
                        this._isConnecting = false;
                        this._setConnectionStatus('error');
                        reject(new Error('Connection timeout'));
                    }
                }, 10000); // 10 second timeout

                // open connection
                this._socket.onopen = () => {
                    console.log('WebSocket connected');
                    clearTimeout(connectionTimeout);
                    this._isConnecting = false;
                    this._reconnectAttempts = 0;

                    // send the authentication after connection
                    this.authenticate(username, token);

                    // Wait for auth to be processed
                    setTimeout(() => {
                        this._setConnectionStatus('connected');
                        resolve();
                    }, 300);
                };

                // listen for messages
                this._socket.onmessage = (event) => {
                    try {
                        console.log('Raw message received:', event.data);
                        
                        // Check for authentication success messages
                        if (event.data.includes('Authentication successful') || 
                            event.data.includes('Welcome to the chat')) {
                            console.log('Authentication confirmed successful');
                            this._setConnectionStatus('connected');
                        }
                        
                        const message = this.parseMessage(event.data);
                        this.notifyMessageHandlers(message);
                    } catch (error) {
                        console.error('Error parsing message:', error);
                    }
                };

                // close connection
                this._socket.onclose = (event) => {
                    console.log('WebSocket disconnected:', event.code, event.reason);
                    clearTimeout(connectionTimeout);
                    this._isConnecting = false;
                    this._setConnectionStatus('disconnected');

                    // attempt reconnect if not intentionally closed by user
                    if (event.code !== 1000 && this._reconnectAttempts < this._maxReconnectAttempts) {
                        this.attemptReconnect(serverUrl, username, token);
                    }
                };

                // connection error
                this._socket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    clearTimeout(connectionTimeout);
                    this._isConnecting = false;
                    this._setConnectionStatus('error');
                    reject(error);
                };
            } catch (error) {
                console.error('Failed to create WebSocket connection:', error);
                this._isConnecting = false;
                this._setConnectionStatus('error');
                reject(error);
            }
        });
    }

    // Set connection status and notify handlers
    _setConnectionStatus(status) {
        if (this._connectionStatus !== status) {
            console.log(`Changing connection status: ${this._connectionStatus} -> ${status}`);
            this._connectionStatus = status;
            this.notifyConnectionHandlers(status);
        }
    }

    // authenticate with the server
    authenticate(username, token) {
        const authMessage = `${username},${token}`;
        console.log(`Sending authentication: ${username},***`);
        this._socket.send(authMessage);
    }

    // send a chat message
    sendMessage(content) {
        if (this._socket && this._socket.readyState === WebSocket.OPEN) {
            console.log('Sending message:', content);
            this._socket.send(content);
            return true;
        } else {
            console.error('WebSocket is not connected. Status:', this._connectionStatus);
            return false;
        }
    }

    disconnect() {
        if (this._socket) {
            console.log('Disconnecting WebSocket...');
            this._socket.close(1000, 'User disconnected');
            this._socket = null;
            this._setConnectionStatus('disconnected');
        }
    }

    // parse incoming messages
    parseMessage(rawMessage) {
        console.log('Parsing message:', rawMessage);

        // handle authentication messages
        if (rawMessage.includes('Authentication successful') || 
            rawMessage.includes('Welcome to the chat')) {
            return {
                type: 'system',
                content: rawMessage,
                sender: 'System',
                timestamp: new Date()
            };
        }

        // handle join/leave messages
        if (rawMessage.includes(' has joined the chat') || rawMessage.includes(' has left the chat')) {
            return {
                type: 'system',
                content: rawMessage,
                sender: 'System',
                timestamp: new Date()
            };
        }

        // handle regular chat messages format: username: message
        const colonIndex = rawMessage.indexOf(': ');
        if (colonIndex > 0) {
            const sender = rawMessage.substring(0, colonIndex);
            const content = rawMessage.substring(colonIndex + 2);

            return {
                type: 'chat',
                content: content,
                sender: sender,
                timestamp: new Date(),
                isFromCurrentUser: false
            };
        }

        // handle system or other message formats
        return {
            type: 'system',
            content: rawMessage,
            sender: 'System',
            timestamp: new Date()
        };
    }

    attemptReconnect(serverUrl, username, token) {
        this._reconnectAttempts++;
        console.log(`Attempting to reconnect... (${this._reconnectAttempts}/${this._maxReconnectAttempts})`);

        setTimeout(() => {
            this.connect(serverUrl, username, token).catch((error) => {
                console.error('Reconnection failed:', error);
            });
        }, this._reconnectDelay * this._reconnectAttempts);
    }

    // add message handler
    addMessageHandler(handler) {
        this._messageHandlers.push(handler);
    }

    // remove message handler
    removeMessageHandler(handler) {
        const index = this._messageHandlers.indexOf(handler);
        if (index > -1) {
            this._messageHandlers.splice(index, 1);
        }
    }

    // add connection handler
    addConnectionHandler(handler) {
        this._connectionHandlers.push(handler);

        // Immediately notify the new handler of current status
        if (handler) {
            try {
                handler(this._connectionStatus);
            } catch (error) {
                console.error('Error notifying new handler:', error);
            }
        }
    }

    // remove connection handler
    removeConnectionHandler(handler) {
        const index = this._connectionHandlers.indexOf(handler);
        if (index > -1) {
            this._connectionHandlers.splice(index, 1);
        }
    }

    // notify all message handlers
    notifyMessageHandlers(message) {
        this._messageHandlers.forEach(handler => {
            try {
                handler(message);
            } catch (error) {
                console.error('Error in message handler:', error);
            }
        });
    }

    // notify all connection handlers
    notifyConnectionHandlers(status) {
        console.log(`Notifying ${this._connectionHandlers.length} handlers of status: ${status}`);
        this._connectionHandlers.forEach(handler => {
            try {
                handler(status);
            } catch (error) {
                console.error('Error in connection handler:', error);
            }
        });
    }

    // get connection status 
    getConnectionStatus() {
        return this._connectionStatus;
    }

    // check if connected
    isConnected() {
        return this._connectionStatus === 'connected';
    }
}

// export the WebSocketService as a singleton
export default new WebSocketService();