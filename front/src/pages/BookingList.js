import { useEffect, useState } from "react";
import { api } from "../api";
import Swal from "sweetalert2";
import "../styles/UserRepair.css";

export default function UserRepairStatus() {
  const [bookings, setBookings] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [repairItems, setRepairItems] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchMyBookings();
  }, []);

  // ✅ ดึงข้อมูลเฉพาะของ user ปัจจุบัน
  const fetchMyBookings = async () => {
    try {
      const data = await api("/api/bookings/mine");
      if (data.success) {
        const sorted = data.bookings.sort((a, b) => new Date(b.date) - new Date(a.date));
        setBookings(sorted);
      }
    } catch {
      Swal.fire("❌", "โหลดข้อมูลงานซ่อมไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  };

  const getStatus = (id) => {
    switch (id) {
      case 1:
        return { text: "⏳ รอช่าง", class: "pending" };
      case 2:
        return { text: "🔧 กำลังซ่อม", class: "progress" };
      case 3:
        return { text: "✅ เสร็จแล้ว", class: "done" };
      case 4:
        return { text: "❌ ยกเลิก", class: "cancel" };
      default:
        return { text: "❔ ไม่ทราบ", class: "unknown" };
    }
  };

  // ✅ เปิดรายละเอียดงานซ่อม
  const openPopup = async (booking_id) => {
    setSelectedBooking(booking_id);
    try {
      const data = await api(`/api/repair-items/${booking_id}`);
      if (data.success) setRepairItems(data.items || []);
    } catch {
      Swal.fire("❌", "โหลดข้อมูลอุปกรณ์ไม่สำเร็จ", "error");
    }
  };

  const closePopup = () => {
    setSelectedBooking(null);
    setRepairItems([]);
  };

  // ✅ ยกเลิกงานซ่อม
  const cancelBooking = async (booking_id, status_id) => {
    if (status_id !== 1) {
      return Swal.fire("⚠️", "สามารถยกเลิกได้เฉพาะงานที่ยังรอช่างเท่านั้น", "info");
    }

    const result = await Swal.fire({
      title: "ยืนยันการยกเลิก?",
      text: "การยกเลิกไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "กลับ",
    });
    if (!result.isConfirmed) return;

    try {
      const res = await api(`/api/bookings/${booking_id}`, {
        method: "PUT",
        body: { status_id: 4 },
      });
      if (res.success) {
        Swal.fire("✅", "ยกเลิกสำเร็จ", "success");
        fetchMyBookings();
      }
    } catch {
      Swal.fire("❌", "ไม่สามารถยกเลิกได้", "error");
    }
  };

  const total = repairItems.reduce(
    (sum, i) => sum + Number(i.unit_price) * Number(i.quantity),
    0
  );

  if (loading) return <div className="loading">⏳ กำลังโหลด...</div>;

  return (
    <div className="user-page">
      <h1 className="user-title">🚗 งานซ่อมของฉัน</h1>

      <table className="user-table">
        <thead>
          <tr>
            <th>รหัส</th>
            <th>วันที่</th>
            <th>เวลา</th>
            <th>รถ</th>
            <th>รายละเอียด</th>
            <th>สถานะ</th>
            <th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {bookings.map((b) => {
            const s = getStatus(b.status_id);
            return (
              <tr key={b.booking_id}>
                <td>{b.booking_id}</td>
                <td>
                  {new Date(b.date).toLocaleDateString("th-TH", {
                    year: "numeric",
                    month: "short",
                    day: "numeric",
                  })}
                </td>
                <td>
                  {b.time
                    ? new Date(`1970-01-01T${b.time}`).toLocaleTimeString("th-TH", {
                        hour: "2-digit",
                        minute: "2-digit",
                      }) + " น."
                    : "-"}
                </td>
                <td>
                  {b.license_plate} ({b.model})
                </td>
                <td>{b.description || "-"}</td>
                <td>
                  <span className={`status-badge ${s.class}`}>{s.text}</span>
                </td>
                <td className="action-buttons">
                  <button
                    className="btn btn-detail"
                    onClick={() => openPopup(b.booking_id)}
                  >
                    👁️ ดู
                  </button>
                  {b.status_id === 1 && (
                    <button
                      className="btn btn-cancel"
                      onClick={() => cancelBooking(b.booking_id, b.status_id)}
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

      {selectedBooking && (
        <div className="popup-overlay">
          <div className="popup-card fancy-popup">
            <h4 className="popup-title">
              🔧 รายละเอียดงานซ่อม #{selectedBooking}
            </h4>
            <hr className="divider" />

            <div className="repair-grid">
              {repairItems.length > 0 ? (
                repairItems.map((i) => (
                  <div key={i.part_id} className="repair-card">
                    <div className="repair-name">{i.partname}</div>
                    <div className="repair-info">
                      <span>จำนวน: {i.quantity}</span>
                      <span>
                        ราคา/หน่วย: {Number(i.unit_price).toLocaleString()} ฿
                      </span>
                      <span className="total">
                        รวม: {(i.unit_price * i.quantity).toLocaleString()} ฿
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <p className="no-item">ไม่มีข้อมูลอุปกรณ์</p>
              )}
            </div>

            <div className="total-section">
              💰 รวมทั้งหมด: <b>{total.toLocaleString()} ฿</b>
            </div>

            <button className="btn btn-secondary" onClick={closePopup}>
              ปิด
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
