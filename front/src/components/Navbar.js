import "../styles/navbar.css";
import "../styles/common.css";
import { Link, NavLink, useNavigate, useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import { Bell } from "lucide-react"; // 🔔 ไอคอนแจ้งเตือน

export default function Navbar() {
  const nav = useNavigate();
  const location = useLocation(); // ✅ ใช้ตรวจจับการเปลี่ยนหน้า
  const [role, setRole] = useState(null);
  const [lowStock, setLowStock] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  // ✅ โหลด role ทุกครั้งที่มีการเปลี่ยนหน้า
  useEffect(() => {
    const updateRole = () => {
      const storedRole = localStorage.getItem("role");
      setRole(storedRole);
    };
    updateRole();
  }, [location]); // 👈 ทุกครั้งที่ route เปลี่ยน

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
        <div className="brand">🚗 P & Q Garage</div>

        <div className="nav-links">
          <NavLink to="/">หน้าแรก</NavLink>
          <NavLink to="/about-us">เกี่ยวกับเรา</NavLink>
          <NavLink to="/contact">ติดต่อ</NavLink>
          {renderLinks()}
        </div>

        <div className="nav-actions">
          {/* 🔔 เฉพาะ Admin */}
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
                  <div className="dropdown-header">⚠️ อะไหล่ใกล้หมด</div>
                  {lowStock.length === 0 ? (
                    <div className="dropdown-empty">
                      ✅ ไม่มีอะไหล่ใกล้หมด
                    </div>
                  ) : (
                    <ul>
                      {lowStock.map((p) => (
                        <li
                          key={p.part_id}
                          onClick={() => handlePartClick(p)}
                          className="dropdown-item"
                        >
                          <span>{p.name}</span>
                          <span className="qty">{p.quantity} ชิ้น</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  <div className="dropdown-footer">
                    <Link
                      to="/admin/parts"
                      onClick={() => setDropdownOpen(false)}
                    >
                      ดูทั้งหมด →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 🔘 ปุ่ม Login/Logout */}
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
    </nav>
  );
}
