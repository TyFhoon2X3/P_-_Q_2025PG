import React, { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/navber.css";

function Navbar() {
  const [showDropdown, setShowDropdown] = useState(false);
  const role = localStorage.getItem("role"); // หรือจาก AuthContext

  const toggleDropdown = () => {
    setShowDropdown((prev) => !prev);
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="brand">P & Q Garage Auto Repair</div>

        <div className="nav-links">
          <Link to="/">Home</Link>

          {/* Services Dropdown */}
          <div className="menu">
            <button className="menu-button" onClick={toggleDropdown}>
              Services ▾
            </button>
            {showDropdown && (
              <div className="dropdown">
                {role === "admin" ? (
                  <>
                    <Link to="/admin/customers">จัดการลูกค้า</Link>
                    <Link to="/admin/services">จัดการบริการ</Link>
                  </>
                ) : (
                  <>
                    <Link to="/book-service">ข้อมูลรถ</Link>
                    <Link to="/admin/parts">จัดการอะไหล่</Link>
                  </>
                )}
              </div>
            )}
          </div>

          <Link to="/about-us">About Us</Link>
          <Link to="/contact">Contact</Link>
        </div>

        <div className="nav-actions">
          
        </div>
      </div>
    </nav>
  );
}

export default Navbar;