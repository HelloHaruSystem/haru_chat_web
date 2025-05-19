class WebSocketService {
    constructor() {
        this._socket = null;
        this._messageHandlers = [];
        this._connectionHandlers = [];
        this._reconnectAttempts = 0;
        this._maxReconnectAttempts = 5;
        this._reconnectDelay = 1000; // milliseconds therefore 1 second
        this._isConnected = false;
    }

    // connect method to the webSocket chat server
    connect(serverUrl, username, token) {
        if (this._socket && this._socket.readyState === WebSocket.OPEN) {
            console.log('Already connected');
            return Promise.resolve();
        }

        if (this._isConnected) {
            console.log('Connection already in progress');
            return Promise.reject(new Error('Connection already in progress'));
        }

        this._isConnected = true;

        return new Promise((resolve, reject) => {
            try {
                // create the WebSocket connection
                this._socket = new WebSocket(serverUrl);

                // open connection
                this._socket.onopen = () => {
                    console.log('WebSocket connected');
                    this._isConnected = false;
                    this._reconnectAttempts = 0;

                    // send the authentication immediately after connection
                    this.authenticate(username, token);

                    this.notifyConnectionHandlers('connected');
                    resolve();
                };

                // listen for messages
                this._socket.onmessage = (event) => {
                    try {
                        const message = this.parseMessage(event.data);
                        this.notifyConnectionHandlers(message);
                    } catch (error) {
                        console.error('Error parsing message;', error);
                    }
                };

                // close connection
                this._socket.onclose = (event) => {
                    console.log('WebSocket disconnected:', event.code, event.reason);
                    this._isConnected = false;
                    this.notifyConnectionHandlers('disconnected');

                    // attempt reconnect if no intentionally closed by user
                    if (event.code !== 1000 && this._reconnectAttempts < this._maxReconnectAttempts) {
                        this.attemptReconnect(serverUrl, username, token);
                    }
                };

                // connection error
                this._socket.onerror = (error) => {
                    console.error('WebSocket error:', error);
                    this._isConnected = false;
                    this.notifyConnectionHandlers('error');
                    reject(error);
                }
            } catch (error) {
                console.error('Failed to create WebSocket connection:', error);
                this._isConnected = false;
                reject(error);
            }
        });
    }
    // authenticate with the server
    authenticate(username, token) {
        const authMessage = `${username},${token}`;
        console.log('Sending authentication: ', `${username},token...`);
        this._socket.send(authMessage);
    }

    // send a chat message
    sendMessage(content) {
        if (this._socket && this._socket.readyState === WebSocket.OPEN) {
            this._socket.send(content);
            return true;
        } else {
            console.error('Websocket is not connected');
            return false;
        }
    }

    disconnect() {
        if (this._socket) {
            console.log('Disconnecting WebSocket...');
            this._socket.close(1000, 'User disconnected');
            this._socket = null;
        }
    }

    // parse incoming messages
    parseMessage(rawMessage) {
        console.log('Received message: ', rawMessage);

        // handle authentication messages
        if (rawMessage.includes('Authentication Authentication successful')) {
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
}