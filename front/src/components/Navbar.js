import "../styles/navbar.css";
import "../styles/common.css";
import { Link, NavLink, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const nav = useNavigate();
  const [role, setRole] = useState(null);

  useEffect(() => {
    const updateRole = () => setRole(localStorage.getItem("role"));
    updateRole();
    window.addEventListener("storage", updateRole);
    return () => window.removeEventListener("storage", updateRole);
  }, []);

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    nav("/login");
  };

  const renderLinks = () => {
    if (role === "r1") {
      return (
        <>
          <NavLink to="/admin-dashboard">แดชบอร์ดผู้ดูแลระบบ</NavLink>
          <NavLink to="/admin/customers">ลูกค้า</NavLink>
          <NavLink to="/admin/services">บริการ</NavLink>
          <NavLink to="/admin/parts">อะไหล่</NavLink>
        </>
      );
    }
    if (role === "r2") {
      return (
        <>
          <NavLink to="/user-dashboard">แดชบอร์ด</NavLink>
          <NavLink to="/my-vehicles">รถของฉัน</NavLink>
          <NavLink to="/book-service">จองบริการ</NavLink>
          <NavLink to="/bookings">การจอง</NavLink>
        </>
      );
    }
    return null;
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="brand">🚗 P & Q Garage</div>
        <div className="nav-links">
          <NavLink to="/">หน้าแรก</NavLink>
          <NavLink to="/about-us">เกี่ยวกับเรา</NavLink>
          <NavLink to="/contact">ติดต่อ</NavLink>
          {renderLinks()}
        </div>
        <div className="nav-actions">
          {role ? (
            <button className="btn-outline" onClick={logout}>
              ออกจากระบบ
            </button>
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
