import { useState } from "react";

function Navbar() {
    const [visible, setVisible] = useState(true);

    return (
       (visible && 
       <nav className="navbar">
            <ul>
                <NavElement value="Home" />
                <NavElement value="About" />
                <NavElement value="Logout" />
            </ul>
        </nav>)
    );
}

function NavElement( {value, href} ) {

    return (
        <li className="nav-li">
            <a className="nav-button" href={href}>
                {value}
            </a>
        </li>
    );
}

export default Navbar;