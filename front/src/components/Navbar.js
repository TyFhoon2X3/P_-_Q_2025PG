import "../styles/navbar.css";
import "../styles/common.css";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Bell, Menu, X } from "lucide-react"; // 🔔 ไอคอนแจ้งเตือน & เมนู


export default function Navbar() {
  const nav = useNavigate();
  const location = useLocation();
  const [role, setRole] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false); // ✅ State สำหรับเมนูมือถือ

  // ✅ โหลด role ทุกครั้งที่มีการเปลี่ยนหน้า
  useEffect(() => {
    const updateRole = () => {
      const storedRole = localStorage.getItem("role");
      setRole(storedRole);
    };
    updateRole();
    setMenuOpen(false); // ปิดเมนูเมื่อเปลี่ยนหน้า
  }, [location]);

  // ✅ ดึงข้อมูลอะไหล่ใกล้หมด (เฉพาะ Admin)
  useEffect(() => {
    if (role === "r1") {
      fetchLowStock();
      const interval = setInterval(fetchLowStock, 60000); // ทุก 1 นาที
      return () => clearInterval(interval);
    }
  }, [role]);

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
    setRole(null);
    nav("/login");
  };

  const renderLinks = () => {
    if (role === "r1") {
      return (
        <>
          <NavLink to="/admin-dashboard">แดชบอร์ดผู้ดูแลระบบ</NavLink>
          <NavLink to="/admin/customers">ลูกค้า</NavLink>
          <NavLink to="/admin/vehicles">รถของลูกค้า</NavLink>
          <NavLink to="/admin/bookings">บริการ</NavLink>
          <NavLink to="/admin/parts">อะไหล่</NavLink>
          <NavLink to="/admin/messages">ข้อความ</NavLink>
        </>
      );
    }
    if (role === "r2") {
      return (
        <>
          <NavLink to="/user-dashboard">แดชบอร์ดลูกค้า</NavLink>
          <NavLink to="/my-vehicles">รถของฉัน</NavLink>
          <NavLink to="/book-service">จองบริการ</NavLink>
          <NavLink to="/bookings">ประวัติการจอง</NavLink>
        </>
      );
    }
    return null;
  };

  const handlePartClick = (part) => {
    Swal.fire({
      title: part.name,
      icon: "info",
      html: `
        <p><b>แบรนด์:</b> ${part.marque}</p>
        <p><b>จำนวนคงเหลือ:</b> ${part.quantity}</p>
        <p><b>ราคา:</b> ${part.unit_price} ฿</p>
      `,
      confirmButtonText: "ตกลง",
    });
  };

  return (
    <nav className="nav">
      <div className="nav-inner">
        <div className="nav-header">
          <div className="brand">🚗 P & Q Garage</div>

          {/* 📱 ปุ่มเมนูมือถือ */}
          <button className="mobile-menu-btn" onClick={() => setMenuOpen(!menuOpen)}>
            {menuOpen ? <X size={28} /> : <Menu size={28} />}
          </button>
        </div>

        {/* 🔗 ลิงก์นำทาง (รองรับ Mobile) */}
        <div className={`nav-links ${menuOpen ? "open" : ""}`}>
          <NavLink to="/">หน้าแรก</NavLink>
          <NavLink to="/about-us">เกี่ยวกับเรา</NavLink>
          <NavLink to="/contact">ติดต่อ</NavLink>
          {renderLinks()}

          {/* 📱 ย้ายปุ่ม Login/Logout มาไว้ในเมนูสำหรับมือถือ */}
          <div className="mobile-actions">
            {role ? (
              <button className="btn-outline mobile-btn" onClick={logout}>
                ออกจากระบบ
              </button>
            ) : (
              <>
                <Link className="btn-outline mobile-btn" to="/login">
                  เข้าสู่ระบบ
                </Link>
                <Link className="btn-outline mobile-btn" to="/register">
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="nav-actions">
          {/* 🔔 เฉพาะ Admin (แสดงตลอด) */}
          {role === "r1" && (
            <div className="relative notification-container">
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="notification-btn"
              >
                <Bell size={22} />
                {lowStock.length > 0 && (
                  <span className="badge">{lowStock.length}</span>
                )}
              </button>

              {dropdownOpen && (
                <div className="notification-dropdown">
                  <div className="dropdown-header">
                    <span>การแจ้งเตือน</span>
                    <span className="header-badge">{lowStock.length} ใหม่</span>
                  </div>

                  {lowStock.length === 0 ? (
                    <div className="dropdown-empty">
                      <div className="empty-icon">✅</div>
                      <p>ไม่มีรายการพัสดุที่ต้องเติมสต็อก</p>
                    </div>
                  ) : (
                    <div className="dropdown-list">
                      {lowStock.map((p) => (
                        <div
                          key={p.part_id}
                          onClick={() => handlePartClick(p)}
                          className="dropdown-item"
                        >
                          <div className="item-icon-wrapper">⚠️</div>
                          <div className="item-content">
                            <span className="item-name">{p.name}</span>
                            <span className="item-desc">
                              แบรนด์ {p.marque} • <span className="text-danger">เหลือ {p.quantity} ชิ้น</span>
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  <div className="dropdown-footer">
                    <Link
                      to="/admin/parts"
                      onClick={() => setDropdownOpen(false)}
                      className="view-all-link"
                    >
                      จัดการสต็อกอะไหล่
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 🔘 ปุ่ม Login/Logout (Desktop Only) */}
          <div className="desktop-actions">
            {role ? (
              <button className="btn-outline" onClick={logout}>
                ออกจากระบบ
              </button>
            ) : (
              <>
                <Link className="btn-outline" to="/login">
                  เข้าสู่ระบบ
                </Link>
                <Link className="btn-outline" to="/register">
                  สมัครสมาชิก
                </Link>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
