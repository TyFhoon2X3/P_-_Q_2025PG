import { useEffect, useState } from "react";
import { api } from "../api";
import { Link, useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/TableForBook.css";

export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  // ฟังก์ชันแปลงสถานะ
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

  // โหลด booking
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
      } else {
        setBookings(data.bookings || []);
      }
    } catch (err) {
      console.error("Error loading bookings:", err);
      setError("เกิดข้อผิดพลาดในการโหลดข้อมูลการจอง");
    } finally {
      setIsLoading(false);
    }
  };

  // ยกเลิก booking
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
        confirmButtonText: "ตกลง",
      });

      fetchBookings();
    } catch (err) {
      Swal.fire({
        title: "❌ ไม่สำเร็จ",
        text: err.message || "เกิดข้อผิดพลาด",
        icon: "error",
        confirmButtonText: "ตกลง",
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
      <h1 className="page-title" role="heading" aria-level="1">
        📋 การจองของฉัน
      </h1>

      {error && (
        <p className="error" role="alert">
          {error}
        </p>
      )}

      {bookings.length === 0 ? (
        <p className="no-data">คุณยังไม่มีการจอง</p>
      ) : (
        <div className="table-container">
          <table className="table big-table" aria-label="ตารางการจองของฉัน">
            <thead>
              <tr>
                <th scope="col">วันที่</th>
                <th scope="col">เวลา</th>
                <th scope="col">รถ</th>
                <th scope="col">รายละเอียด</th>
                <th scope="col">สถานะ</th>
                <th scope="col">ค่าใช้จ่ายรวม</th>
                <th scope="col">การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {bookings.map((booking) => {
                const status = getStatus(booking.status_id);
                return (
                  <tr key={booking.booking_id}>
                    <td>
                      {new Date(booking.date).toLocaleDateString("th-TH")}
                    </td>
                    <td>{booking.time}</td>
                    <td>
                      <span className="badge-car">
                        {booking.license_plate} ({booking.model})
                      </span>
                    </td>
                    <td>{booking.description || "-"}</td>
                    <td>
                      <span
                        className={`status-badge ${status.className}`}
                        aria-label={`สถานะ: ${status.label}`}
                      >
                        {status.label}
                      </span>
                    </td>
                    <td>
                      <span className="price">
                        {Number(booking.total_price || 0).toLocaleString()} ฿
                      </span>
                    </td>
                    <td className="action-buttons">
                      <Link
                        to={`/bookings/${booking.booking_id}`}
                        className="btn btn-detail"
                        aria-label="ดูรายละเอียดการจอง"
                      >
                        🔍 รายละเอียด
                      </Link>
                      {booking.status_id === 1 && (
                        <button
                          onClick={() => cancelBooking(booking.booking_id)}
                          className="btn btn-cancel"
                          aria-label="ยกเลิกการจอง"
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
