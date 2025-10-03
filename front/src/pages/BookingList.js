import { useEffect, useState } from "react";
import { api } from "../api";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/TableForBook.css";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [filteredBookings, setFilteredBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const navigate = useNavigate();

  const getStatus = (status_id) => {
    switch (status_id) {
      case 1:
        return { label: "⏳ รอดำเนินการ", className: "status-pending" };
      case 2:
        return { label: "🔧 กำลังซ่อม", className: "status-progress" };
      case 3:
        return { label: "✅ เสร็จสิ้น", className: "status-done" };
      case 4:
        return { label: "❌ ยกเลิก", className: "status-cancel" };
      default:
        return { label: "ไม่ทราบสถานะ", className: "status-unknown" };
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({
        title: "กรุณาเข้าสู่ระบบ",
        icon: "warning",
        confirmButtonText: "ตกลง",
      });
      navigate("/login");
      return;
    }
    fetchBookings();
  }, [navigate]);

  const fetchBookings = async () => {
    try {
      const data = await api("/api/bookings/mine");
      if (!data || data.success === false) {
        setError(data?.message || "ไม่สามารถโหลดข้อมูลการจองได้");
        setBookings([]);
        setFilteredBookings([]);
      } else {
        setBookings(data.bookings || []);
        setFilteredBookings(data.bookings || []);
      }
    } catch (err) {
      console.error("Error loading bookings:", err);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูลการจอง");
    } finally {
      setIsLoading(false);
    }
  };

  // กรองการจอง
  useEffect(() => {
    let filtered = bookings;

    if (searchTerm) {
      filtered = filtered.filter(
        (b) =>
          b.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.description?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter(
        (b) => String(b.status_id) === String(statusFilter)
      );
    }

    setFilteredBookings(filtered);
  }, [searchTerm, statusFilter, bookings]);

  const cancelBooking = async (id) => {
    const result = await Swal.fire({
      title: "ยืนยันการยกเลิก?",
      text: "การยกเลิกนี้ไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ใช่, ยกเลิกเลย",
      cancelButtonText: "ไม่",
    });

    if (!result.isConfirmed) return;

    try {
      await api(`/api/bookings/${id}`, {
        method: "PUT",
        body: { status_id: 4 },
      });
      Swal.fire({
        title: "สำเร็จ ✅",
        text: "ยกเลิกการจองเรียบร้อยแล้ว",
        icon: "success",
      });
      fetchBookings();
    } catch (err) {
      Swal.fire({
        title: "❌ ไม่สำเร็จ",
        text: err.message || "เกิดข้อผิดพลาด",
        icon: "error",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="loading" role="status">
        ⏳ กำลังโหลดข้อมูลการจอง...
      </div>
    );
  }

  return (
    <div className="page-container">
      <h1 className="page-title">📋 การจองของฉัน</h1>

      {error && <p className="error">{error}</p>}

      {/* Search + Filter */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="🔍 ค้นหารถ / รุ่น / รายละเอียด..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />

        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">📌 ทุกสถานะ</option>
          <option value="1">⏳ รอดำเนินการ</option>
          <option value="2">🔧 กำลังซ่อม</option>
          <option value="3">✅ เสร็จสิ้น</option>
          <option value="4">❌ ยกเลิก</option>
        </select>
      </div>

      {filteredBookings.length === 0 ? (
        <p className="no-data">ไม่พบการจองที่ตรงกับเงื่อนไข</p>
      ) : (
        <div className="table-container wide">
          <table className="table big-table">
            <thead>
              <tr>
                <th>วันที่</th>
                <th>เวลา</th>
                <th>รถ</th>
                <th>รายละเอียด</th>
                <th>สถานะ</th>
                <th>ค่าใช้จ่ายรวม</th>
                <th>รายละเอียด</th>
                <th>ยกเลิก</th>
              </tr>
            </thead>
            <tbody>
              {filteredBookings.map((booking) => {
                const status = getStatus(booking.status_id);
                return (
                  <tr key={booking.booking_id}>
                    <td>{new Date(booking.date).toLocaleDateString("th-TH")}</td>
                    <td>{booking.time}</td>
                    <td>
                      <span className="badge-car">
                        {booking.license_plate} ({booking.model})
                      </span>
                    </td>
                    <td>{booking.description || "-"}</td>
                    <td>
                      <span className={`status-badge ${status.className}`}>
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <span className="price">
                        {Number(booking.total_price || 0).toLocaleString()} ฿
                      </span>
                    </td>
                    {/* ปุ่มรายละเอียด */}
                    <td>
                      <Link to={`/bookings/${booking.booking_id}`} className="btn btn-detail">
                        🔍 รายละเอียด
                      </Link>
                    </td>
                    {/* ปุ่มยกเลิก */}
                    <td>
                      {booking.status_id === 1 && (
                        <button
                          onClick={() => cancelBooking(booking.booking_id)}
                          className="btn btn-cancel"
                        >
                          ❌ ยกเลิก
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
