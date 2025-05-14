// Function to handle viewport height on mobile devices
const setViewportHeight = () => {
  // This helps with the mobile viewport height issues (iOS Safari address bar, etc.)
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
};

// Set the height on initial load
setViewportHeight();

// Update the height on window resize
window.addEventListener('resize', setViewportHeight);

// Update on orientation change (important for mobile)
window.addEventListener('orientationchange', setViewportHeight);

export default setViewportHeight;