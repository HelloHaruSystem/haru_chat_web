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
                        throw error;
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
}