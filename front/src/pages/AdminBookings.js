import { useEffect, useState } from "react";
import { api } from "../api";
import Swal from "sweetalert2";
import "../styles/TableForBook.css";

export default function AdminRepairManager() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [parts, setParts] = useState([]);
  const [repairItems, setRepairItems] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [currentStatus, setCurrentStatus] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchBookings();
    fetchParts();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await api("/api/bookings");
      if (data.success) {
        setBookings(data.bookings || []);
        setFiltered(data.bookings || []);
      }
    } catch {
      Swal.fire("❌", "โหลดข้อมูลการจองไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchParts = async () => {
    try {
      const data = await api("/api/parts");
      if (data.success) setParts(data.parts || []);
    } catch {
      Swal.fire("❌", "โหลดข้อมูลอะไหล่ไม่สำเร็จ", "error");
    }
  };

  const getStatus = (id) => {
    switch (id) {
      case 1: return { text: "⏳ รอช่าง", class: "pending" };
      case 2: return { text: "🔧 กำลังซ่อม", class: "progress" };
      case 3: return { text: "✅ เสร็จแล้ว", class: "done" };
      case 4: return { text: "❌ ยกเลิก", class: "cancel" };
      default: return { text: "❔ ไม่ทราบ", class: "unknown" };
    }
  };

  useEffect(() => {
    let filteredData = bookings;

    if (searchTerm) {
      filteredData = filteredData.filter(
        (b) =>
          b.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.model?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.owner_name?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filteredData = filteredData.filter(
        (b) => String(b.status_id) === String(statusFilter)
      );
    }

    if (startDate && endDate) {
      filteredData = filteredData.filter((b) => {
        const d = new Date(b.date);
        return d >= new Date(startDate) && d <= new Date(endDate);
      });
    }

    setFiltered(filteredData);
  }, [searchTerm, statusFilter, startDate, endDate, bookings]);

  // ✅ เปิด popup
  const openPopup = async (booking_id, status_id) => {
    setSelectedBooking(booking_id);
    setCurrentStatus(status_id);
    try {
      const [repairRes, detailRes] = await Promise.all([
        api(`/api/repair-items/${booking_id}`),
        api(`/api/bookings/${booking_id}`)
      ]);
      if (repairRes.success) setRepairItems(repairRes.items || []);
      if (detailRes.success) setBookingDetail(detailRes.booking);
    } catch {
      Swal.fire("❌", "โหลดข้อมูลรายละเอียดไม่สำเร็จ", "error");
    }
  };

  const closePopup = () => {
    setSelectedBooking(null);
    setRepairItems([]);
    setBookingDetail(null);
  };

  // ✅ เปลี่ยนสถานะ
  const updateStatus = async (e) => {
    const newStatus = Number(e.target.value);
    try {
      const res = await api(`/api/bookings/${selectedBooking}`, {
        method: "PUT",
        body: { status_id: newStatus },
      });
      if (res.success) {
        setCurrentStatus(newStatus);
        Swal.fire("✅", "อัปเดตสถานะสำเร็จ", "success");
        fetchBookings();
      }
    } catch {
      Swal.fire("❌", "ไม่สามารถเปลี่ยนสถานะได้", "error");
    }
  };

  // ✅ เพิ่มอะไหล่
  const addRepairItem = async (e) => {
    e.preventDefault();
    if (currentStatus === 3 || currentStatus === 4) {
      Swal.fire("⚠️", "ไม่สามารถเพิ่มอุปกรณ์ในงานที่เสร็จสิ้นหรือยกเลิกได้", "warning");
      return;
    }
    const form = e.target;
    const part_id = form.part_id.value;
    const quantity = Number(form.quantity.value);
    const part = parts.find((p) => p.part_id === part_id);

    if (!part) return Swal.fire("❌", "ไม่พบอะไหล่ที่เลือก", "error");

    try {
      const res = await api("/api/repair-items", {
        method: "POST",
        body: {
          booking_id: selectedBooking,
          part_id,
          quantity,
          unit_price: Number(part.unit_price),
        },
      });

      if (res.success) {
        Swal.fire("✅", "เพิ่มอุปกรณ์สำเร็จ", "success");
        form.reset();
        openPopup(selectedBooking, currentStatus);
      } else {
        Swal.fire("❌", res.message || "เพิ่มไม่สำเร็จ", "error");
      }
    } catch {
      Swal.fire("❌", "เกิดข้อผิดพลาด", "error");
    }
  };

  // ✅ ลบอะไหล่
  const deleteItem = async (part_id) => {
    if (currentStatus === 3 || currentStatus === 4) {
      Swal.fire("⚠️", "ไม่สามารถลบในสถานะนี้ได้", "warning");
      return;
    }

    const result = await Swal.fire({
      title: "ยืนยันการลบ?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
    });
    if (!result.isConfirmed) return;

    await api(`/api/repair-items/${selectedBooking}/${part_id}`, { method: "DELETE" });
    Swal.fire("✅", "ลบสำเร็จ", "success");
    openPopup(selectedBooking, currentStatus);
  };

  // ✅ แก้ไขค่า service / freight
  const updateCost = async () => {
    if (currentStatus === 3 || currentStatus === 4)
      return Swal.fire("⚠️", "ไม่สามารถแก้ไขในสถานะนี้ได้", "warning");

    try {
      const res = await api(`/api/bookings/${selectedBooking}`, {
        method: "PUT",
        body: {
          service: Number(bookingDetail.service),
          freight: Number(bookingDetail.freight),
        },
      });
      if (res.success) {
        Swal.fire("✅", "อัปเดตค่าใช้จ่ายสำเร็จ", "success");
        fetchBookings();
      }
    } catch {
      Swal.fire("❌", "ไม่สามารถบันทึกค่าใช้จ่ายได้", "error");
    }
  };

  const totalParts = repairItems.reduce(
    (sum, i) => sum + Number(i.unit_price) * Number(i.quantity),
    0
  );

  const service = Number(bookingDetail?.service || 0);
  const freight = Number(bookingDetail?.freight || 0);
  const grandTotal = totalParts + service + freight;

  if (loading) return <div className="loading">⏳ กำลังโหลด...</div>;

  return (
    <div className="page-container">
      <h1 className="page-title">🧰 ระบบจัดการงานซ่อม (Admin)</h1>

      {/* ตาราง + popup */}
      <div className="table-container wide">
        <table className="table big-table">
          <thead>
            <tr>
              <th>รหัส</th>
              <th>วันที่</th>
              <th>เวลา</th>
              <th>เจ้าของรถ</th>
              <th>รถ</th>
              <th>รายละเอียด</th>
              <th>สถานะ</th>
              <th>จัดการ</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((b) => {
              const s = getStatus(b.status_id);
              return (
                <tr key={b.booking_id}>
                  <td>{b.booking_id}</td>
                  <td>{new Date(b.date).toLocaleDateString("th-TH")}</td>
                  <td>{b.time}</td>
                  <td>{b.owner_name || "—"}</td>
                  <td>{b.license_plate} ({b.model})</td>
                  <td>{b.description || "-"}</td>
                  <td><span className={`badge ${s.class}`}>{s.text}</span></td>
                  <td>
                    <button
                      className="btn btn-detail"
                      onClick={() => openPopup(b.booking_id, b.status_id)}
                    >
                      🧾 รายละเอียด
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ Popup */}
      {selectedBooking && (
        <div className="popup-overlay">
          <div className="popup-card fancy-popup">
            <h4 className="popup-title">🧾 รายละเอียดงานซ่อม #{selectedBooking}</h4>
            <hr className="divider" />

            {bookingDetail && (
              <div className="booking-info">
                <p><b>🚗 รถ:</b> {bookingDetail.model} ({bookingDetail.license_plate})</p>
                <p><b>👤 เจ้าของ:</b> {bookingDetail.owner_name || "ไม่ระบุ"}</p>
                <p><b>📅 วันที่:</b> {new Date(bookingDetail.date).toLocaleDateString("th-TH")}</p>
                <p><b>🕓 เวลา:</b> {bookingDetail.time}</p>
                <p><b>💬 รายละเอียด:</b> {bookingDetail.description || "-"}</p>
              </div>
            )}

            <div className="status-change">
              <label>สถานะ: </label>
              <select value={currentStatus} onChange={updateStatus}>
                <option value={1}>⏳ รอช่าง</option>
                <option value={2}>🔧 กำลังซ่อม</option>
                <option value={3}>✅ เสร็จแล้ว</option>
                <option value={4}>❌ ยกเลิก</option>
              </select>
            </div>

            {/* ✅ ตารางอะไหล่ */}
            <table className="table small">
              <thead>
                <tr>
                  <th>ชื่ออุปกรณ์</th>
                  <th>จำนวน</th>
                  <th>ราคา/หน่วย</th>
                  <th>รวม</th>
                  <th>ลบ</th>
                </tr>
              </thead>
              <tbody>
                {repairItems.map((i) => (
                  <tr key={i.part_id}>
                    <td>{i.partname}</td>
                    <td>{i.quantity}</td>
                    <td>{Number(i.unit_price).toLocaleString()} ฿</td>
                    <td>{(i.unit_price * i.quantity).toLocaleString()} ฿</td>
                    <td>
                      <button className="btn btn-cancel" onClick={() => deleteItem(i.part_id)}>
                        ❌
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* ✅ ฟอร์มเพิ่มอุปกรณ์ใหม่ */}
            {currentStatus !== 3 && currentStatus !== 4 ? (
              <form onSubmit={addRepairItem} className="add-form">
                <h5>➕ เพิ่มอุปกรณ์ซ่อม</h5>
                <div className="add-row">
                  <select name="part_id" required>
                    <option value="">เลือกอุปกรณ์</option>
                    {parts.map((p) => (
                      <option key={p.part_id} value={p.part_id}>
                        {p.name} ({p.marque}) — {p.unit_price}฿
                      </option>
                    ))}
                  </select>
                  <input type="number" name="quantity" min="1" placeholder="จำนวน" required />
                  <button className="btn btn-primary">➕ เพิ่ม</button>
                </div>
              </form>
            ) : (
              <p className="notice-disabled">⚠️ ไม่สามารถเพิ่มอุปกรณ์ในสถานะนี้ได้</p>
            )}

            {/* ✅ ช่องแก้ไขค่าใช้จ่าย */}
            <div className="cost-edit">
              <div>
                <label>🧰 ค่าแรง (Service): </label>
                <input
                  type="number"
                  value={bookingDetail?.service || 0}
                  onChange={(e) =>
                    setBookingDetail({ ...bookingDetail, service: e.target.value })
                  }
                />
              </div>
              <div>
                <label>🚗 ค่าส่งรถ (Freight): </label>
                <input
                  type="number"
                  value={bookingDetail?.freight || 0}
                  onChange={(e) =>
                    setBookingDetail({ ...bookingDetail, freight: e.target.value })
                  }
                />
              </div>
              <button className="btn btn-primary" onClick={updateCost}>
                💾 บันทึกค่าใช้จ่าย
              </button>
            </div>

            {/* ✅ รวมราคา */}
            <div className="total-section">
              <p>🔩 ค่าอะไหล่: {totalParts.toLocaleString()} ฿</p>
              <p>🧰 ค่าแรง: {service.toLocaleString()} ฿</p>
              <p>🚗 ค่าส่งรถ: {freight.toLocaleString()} ฿</p>
              <hr />
              <p><b>💰 รวมทั้งหมด: {grandTotal.toLocaleString()} ฿</b></p>
            </div>

            <button className="btn btn-secondary" onClick={closePopup}>ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
}
