import "../styles/navbar.css";
import "../styles/common.css";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import {
  Bell, Menu, X, ChevronDown, User, LogOut,
  LayoutDashboard, Users, Car, Wrench, Package, MessageSquare, Settings
} from "lucide-react";

export default function Navbar() {
  const nav = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(null);
  const [userName, setUserName] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [notifOpen, setNotifOpen] = useState(false);
  const [manageOpen, setManageOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const updateAuth = () => {
      setRole(localStorage.getItem("role"));
      setUserName(localStorage.getItem("name"));
    };
    updateAuth();
    setMenuOpen(false);
  }, [location]);

  useEffect(() => {
    if (role === "r1") {
      fetchLowStock();
      const interval = setInterval(fetchLowStock, 60000);
      return () => clearInterval(interval);
    }
  }, [role]);

  // ✅ Click outside to close dropdowns
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (!e.target.closest(".nav-dropdown-container")) {
        setNotifOpen(false);
        setManageOpen(false);
        setUserOpen(false);
      }
    };
    window.addEventListener("click", handleClickOutside);
    return () => window.removeEventListener("click", handleClickOutside);
  }, []);

  const fetchLowStock = async () => {
    const token = localStorage.getItem("token");
    try {
      const res = await axios.get("http://localhost:3000/api/parts", {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.data.success) {
        const low = res.data.parts.filter((p) => Number(p.quantity) <= 5);
        setLowStock(low);
      }
    } catch (err) {
      console.error("❌ โหลดข้อมูลอะไหล่ไม่สำเร็จ");
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("name");
    setRole(null);
    setUserName(null);
    nav("/login");
  };

  const manageLinks = [
    { to: "/admin-dashboard", label: "แผงควบคุม", icon: <LayoutDashboard size={16} /> },
    { to: "/admin/customers", label: "ข้อมูลลูกค้า", icon: <Users size={16} /> },
    { to: "/admin/vehicles", label: "รถของลูกค้า", icon: <Car size={16} /> },
    { to: "/admin/bookings", label: "จัดการบริการ", icon: <Wrench size={16} /> },
    { to: "/admin/parts", label: "คลังอะไหล่", icon: <Package size={16} /> },
    { to: "/admin/messages", label: "กล่องข้อความ", icon: <MessageSquare size={16} /> },
    { to: "/admin/reviews", label: "รีวิวจากลูกค้า", icon: <Settings size={16} /> },
  ];

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-header">
          <Link to="/" className="brand">🚗 P & Q Garage</Link>
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        <ul className={`nav-links ${menuOpen ? "open" : ""}`}>
          <li><NavLink to="/">หน้าแรก</NavLink></li>
          <li><NavLink to="/about-us">เกี่ยวกับเรา</NavLink></li>
          <li><NavLink to="/contact">ติดต่อ</NavLink></li>

          {role === "r1" && (
            <li className="nav-dropdown-container">
              <button
                className={`nav-dropdown-trigger ${manageOpen ? "active" : ""}`}
                onClick={(e) => { e.stopPropagation(); setManageOpen(!manageOpen); setNotifOpen(false); setUserOpen(false); }}
              >
                จัดการระบบ <ChevronDown size={14} className={manageOpen ? "rotate" : ""} />
              </button>
              {manageOpen && (
                <div className="nav-dropdown">
                  {manageLinks.map((link) => (
                    <NavLink key={link.to} to={link.to} onClick={() => setManageOpen(false)}>
                      {link.icon} {link.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </li>
          )}

          {role === "r2" && (
            <>
              <li><NavLink to="/user-dashboard">แดชบอร์ด</NavLink></li>
              <li><NavLink to="/my-vehicles">รถของฉัน</NavLink></li>
              <li><NavLink to="/book-service">จองบริการ</NavLink></li>
              <li><NavLink to="/bookings">การจอง</NavLink></li>
            </>
          )}

          <li className="mobile-only">
            {role ? (
              <button className="logout-btn-mobile" onClick={logout}>ออกจากระบบ</button>
            ) : (
              <div className="mobile-auth-btns">
                <Link to="/login" className="btn-primary">เข้าสู่ระบบ</Link>
                <Link to="/register" className="btn-outline">สมัครสมาชิก</Link>
              </div>
            )}
          </li>
        </ul>

        <div className="nav-actions">
          {role === "r1" && (
            <div className="nav-dropdown-container">
              <button className="notification-btn" onClick={(e) => { e.stopPropagation(); setNotifOpen(!notifOpen); setManageOpen(false); setUserOpen(false); }}>
                <Bell size={20} />
                {lowStock.length > 0 && <span className="badge">{lowStock.length}</span>}
              </button>
              {notifOpen && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">การแจ้งเตือน <span>{lowStock.length}</span></div>
                  <div className="dropdown-list">
                    {lowStock.length === 0 ? (
                      <p className="p-4 text-center text-muted">ไม่มีแจ้งเตือนสต็อก</p>
                    ) : (
                      lowStock.map(p => (
                        <div key={p.part_id} className="dropdown-item" onClick={() => { setNotifOpen(false); nav("/admin/parts"); }}>
                          <span className="text-accent">⚠️ {p.name}</span>
                          <span className="text-xs text-muted">เหลือเพียง {p.quantity} ชิ้น</span>
                        </div>
                      ))
                    )}
                  </div>
                  <Link to="/admin/parts" className="dropdown-footer" onClick={() => setNotifOpen(false)}>ดูสต็อกอะไหล่</Link>
                </div>
              )}
            </div>
          )}

          <div className="desktop-auth nav-dropdown-container">
            {role ? (
              <>
                <button className="user-profile-btn" onClick={(e) => { e.stopPropagation(); setUserOpen(!userOpen); setNotifOpen(false); setManageOpen(false); }}>
                  <div className="avatar">
                    <User size={20} />
                  </div>
                  <span>{userName || (role === "r1" ? "ผู้ดูแลระบบ" : "ลูกค้า")}</span>
                  <ChevronDown size={14} className={userOpen ? "rotate" : ""} />
                </button>
                {userOpen && (
                  <div className="user-dropdown">
                    <button className="dropdown-item" onClick={() => { nav("/profile"); setUserOpen(false); }}>
                      <Settings size={16} /> ตั้งค่าบัญชี
                    </button>
                    <button className="logout-item" onClick={logout}>
                      <LogOut size={16} /> ออกจากระบบ
                    </button>
                  </div>
                )}
              </>
            ) : (
              <div className="auth-btns">
                <Link to="/login" className="btn-link">เข้าสู่ระบบ</Link>
                <Link to="/register" className="btn-primary">เริ่มต้นใช้งาน</Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
