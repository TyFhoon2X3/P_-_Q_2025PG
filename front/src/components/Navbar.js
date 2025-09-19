// src/components/Navbar.js
import "../styles/navbar.css";
import "../styles/common.css";

import { Link, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const nav = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    setRole(localStorage.getItem("role"));
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    nav("/login");
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="brand">🚗 P & Q Garage</div>

        <div className="nav-links">
          <Link to="/">หน้าแรก</Link>
          <Link to="/about-us">เกี่ยวกับเรา</Link>
          <Link to="/contact">ติดต่อ</Link>

          {role === "r1" && (
            <>
              <Link to="/admin/customers">ลูกค้า</Link>
              <Link to="/admin/services">บริการ</Link>
              <Link to="/admin/parts">อะไหล่</Link>
            </>
          )}

          {role === "r2" && (
            <>
              <Link to="/my-vehicles">รถของฉัน</Link>
              <Link to="/book-service">จองบริการ</Link>
            </>
          )}
        </div>

        <div className="nav-actions">
          {role ? (
            <button className="btn-outline" onClick={logout}>ออกจากระบบ</button>
          ) : (
            <>
              <Link className="btn-outline" to="/login">เข้าสู่ระบบ</Link>
              <Link className="btn-outline" to="/register">สมัครสมาชิก</Link>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
