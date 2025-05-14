// theme.js - Color theme constants for your React chat app

const theme = {
  colors: {
    // Main backgrounds
    primaryBackground: '#1a1a2e',    // Dark blue background for entire app
    secondaryBackground: '#16213e',  // Darker blue for containers, sidebar
    inputBackground: '#0f3460',      // Dark blue for input fields
    
    // Accents
    accent: '#e94560',               // Pink/red for buttons, highlights
    accentHover: '#ff6b81',          // Lighter accent for hover states
    border: '#0f3460',               // Border color
    
    // Text colors
    textPrimary: '#ffffff',          // White for main text
    textSecondary: '#e0e0e0',        // Light grey for secondary text
    textMuted: 'rgba(255, 255, 255, 0.6)', // For timestamps, etc.
    
    // Message bubbles
    userBubble: '#e94560',           // User message bubble background
    otherBubble: '#0f3460',          // Other users message bubble
    systemBubble: '#333e52',         // System message bubble
    
    // Status indicators
    online: '#2ed573',               // Online indicator
    error: '#ff4757',                // Error messages
    success: '#2ed573',              // Success messages
    
    // Disabled state
    disabled: '#888888',             // For disabled elements
  },
  
  // add more theme variables here
  borderRadius: {
    small: '5px',
    medium: '15px',
    large: '18px',
    round: '50%',
  },
  
  shadows: {
    messageBubble: '0 1px 3px rgba(0,0,0,0.2)',
    container: '0 5px 10px rgba(0,0,0,0.3)',
  }
};

export default theme;