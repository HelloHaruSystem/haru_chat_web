import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import '../css/Navbar.css';

function Navbar() {
    const [menuOpen, setMenuOpen] = useState(false);
    const { user, logout } = useAuth();
    const location = useLocation();

    // close menu when route changes
    useEffect(() => {
        setMenuOpen(false);
    }, [location]);

    // close menu when clicking outside the menu
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (menuOpen && !event.target.closest('.navbar')) {
                setMenuOpen(false);
            }
        };

        document.addEventListener('click', handleClickOutside);

        return () => {
            document.removeEventListener('click', handleClickOutside);
        };
    }, [menuOpen]);

    const toggleMenu = () => {
      setMenuOpen(!menuOpen);
    };

    const handleLogout = () => {
        if (logout) {
            logout();
        }
    };

    return (
        <nav className="navbar">
            <div className="navbar-brand">Haru Chat</div>

            {/* Mobile menu toggle button */}
            <button
                className="navbar-toggle"
                onClick={toggleMenu}
                aria-label="Toggle navigation" >
                    {menuOpen ? '✕' : '☰'}
            </button>

            {/* Navigation links */}
            <ul className={menuOpen ? 'open' : ''}>
                <NavElement 
                    value="Home" 
                    href="/" 
                    isActive={location.pathname === '/'} />
                
                <NavElement 
                    value="About" 
                    href="/about" 
                    isActive={location.pathname === '/about'} />
                
                {user ? (
                    <NavElement 
                        value="Logout" 
                        onClick={handleLogout} 
                        className="logout" />
                ) : (
                    <NavElement 
                        value="Login" 
                        href="/" 
                        isActive={location.pathname === '/'} />
                )}
            </ul>
        </nav>
    )
}

function NavElement({ value, href, onClick, isActive, className = ''} ) {
    const classes = `nav-button ${isActive ? 'active' : ''} ${className}`;

    if (onClick) {
        return (
            <li className="nav-li">
                <button className={classes} onClick={onClick}>
                    {value}
                </button>
            </li>
        );
    }

    return (
        <li className="nav-li">
            <Link className={classes} to={href}>
                {value}
            </Link>
        </li>
    );
}

export default Navbar;