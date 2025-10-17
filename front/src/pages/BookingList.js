import { useEffect, useState } from "react";
import { api } from "../api";
import Swal from "sweetalert2";
import QRCode from "qrcode";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../font/Sarabun-Regular-normal.js";
import "../styles/UserRepair.css";

export default function UserRepairStatus() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [repairItems, setRepairItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slipFile, setSlipFile] = useState(null);

  // 🔍 ตัวกรอง
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchBookings();
  }, []);

  // ✅ โหลดข้อมูล booking ของผู้ใช้
  const fetchBookings = async () => {
    try {
      const res = await api("/api/bookings/mine");
      if (res.success) {
        const sorted = res.bookings.sort((a, b) => b.booking_id - a.booking_id);
        setBookings(sorted);
        setFiltered(sorted);
      }
    } catch {
      Swal.fire("❌", "โหลดข้อมูลไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ โหลดรายการอะไหล่ของ booking
  const fetchRepairItems = async (bookingId) => {
    try {
      const res = await api(`/api/repair-items/${bookingId}`);
      if (res.success) setRepairItems(res.items || []);
    } catch {
      setRepairItems([]);
    }
  };

  // ✅ ฟังก์ชันเปลี่ยนสถานะ
  const getStatus = (id) => {
    switch (Number(id)) {
      case 1: return { text: "⏳ รอช่าง", class: "pending" };
      case 2: return { text: "🔧 กำลังซ่อม", class: "progress" };
      case 5: return { text: "💰 รอชำระ", class: "waiting" };
      case 3: return { text: "✅ เสร็จแล้ว", class: "done" };
      case 4: return { text: "❌ ยกเลิก", class: "cancel" };
      default: return { text: "-", class: "" };
    }
  };

  // ✅ เปิด popup รายละเอียด
  const openDetail = async (b) => {
    setSelectedBooking(b);
    await fetchRepairItems(b.booking_id);
  };

  const closePopup = () => {
    setSelectedBooking(null);
    setRepairItems([]);
  };

  // ✅ อัปโหลดสลิป
  const uploadSlip = async (bookingId) => {
    if (!slipFile) return Swal.fire("⚠️", "กรุณาเลือกไฟล์ก่อนอัปโหลด", "warning");
    const formData = new FormData();
    formData.append("slip", slipFile);

    try {
      const res = await api(`/api/bookings/${bookingId}/slip`, {
        method: "POST",
        body: formData,
      });
      if (res.success) {
        Swal.fire("✅", "อัปโหลดสลิปสำเร็จ!", "success");
        setSlipFile(null);
        fetchBookings(); // 🔁 โหลดข้อมูลใหม่
        closePopup();
      } else {
        Swal.fire("❌", res.message || "อัปโหลดไม่สำเร็จ", "error");
      }
    } catch {
      Swal.fire("❌", "เกิดข้อผิดพลาดในการอัปโหลด", "error");
    }
  };

  // ✅ ฟิลเตอร์ค้นหา
  useEffect(() => {
    let data = bookings;
    if (searchTerm)
      data = data.filter(
        (b) =>
          b.license_plate?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          b.model?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    if (statusFilter !== "all") data = data.filter((b) => String(b.status_id) === String(statusFilter));
    if (startDate) data = data.filter((b) => new Date(b.date) >= new Date(startDate));
    if (endDate) data = data.filter((b) => new Date(b.date) <= new Date(endDate));
    setFiltered(data);
  }, [searchTerm, statusFilter, startDate, endDate, bookings]);

  if (loading) return <div className="loading">⏳ กำลังโหลด...</div>;

  return (
    <div className="user-page">
      <h2 className="user-title">🔧 ติดตามสถานะงานซ่อม</h2>

      {/* ฟิลเตอร์ */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="ค้นหา (ทะเบียน / รุ่น)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">ทุกสถานะ</option>
          <option value="1">รอช่าง</option>
          <option value="2">กำลังซ่อม</option>
          <option value="5">รอชำระ</option>
          <option value="3">เสร็จแล้ว</option>
          <option value="4">ยกเลิก</option>
        </select>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
      </div>

      {/* ตาราง */}
      <table className="user-table">
        <thead>
          <tr>
            <th>#</th><th>วันที่</th><th>เวลา</th><th>รถ</th><th>สถานะ</th><th>ยอดรวม</th><th>จัดการ</th>
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
                <td>{b.license_plate} ({b.model})</td>
                <td><span className={`status-badge ${s.class}`}>{s.text}</span></td>
                <td>{Number(b.total_price || 0).toLocaleString()} ฿</td>
                <td><button className="btn btn-detail" onClick={() => openDetail(b)}>🔍 ดูรายละเอียด</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Popup รายละเอียด */}
      {selectedBooking && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <header className="popup-header">
              <h3>🧾 รายละเอียดงาน #{selectedBooking.booking_id}</h3>
              <button className="btn-close" onClick={closePopup}>✖</button>
            </header>

            <section className="popup-section info">
              <p><b>รถ:</b> {selectedBooking.model} ({selectedBooking.license_plate})</p>
              <p><b>วันที่:</b> {new Date(selectedBooking.date).toLocaleDateString("th-TH")} {selectedBooking.time}</p>
              <p><b>รายละเอียด:</b> {selectedBooking.description || "-"}</p>
              <p><b>สถานะ:</b> <span className={`status-badge ${getStatus(selectedBooking.status_id).class}`}>{getStatus(selectedBooking.status_id).text}</span></p>
            </section>

            <section className="popup-section parts">
              <h4>🧩 รายการอะไหล่</h4>
              <table className="small-table">
                <thead>
                  <tr><th>ชื่ออะไหล่</th><th>จำนวน</th><th>ราคา/หน่วย</th><th>รวม</th></tr>
                </thead>
                <tbody>
                  {repairItems.length > 0 ? (
                    repairItems.map((i) => (
                      <tr key={i.part_id}>
                        <td>{i.partname}</td>
                        <td>{i.quantity}</td>
                        <td>{Number(i.unit_price).toLocaleString()} ฿</td>
                        <td>{(i.unit_price * i.quantity).toLocaleString()} ฿</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="4">ไม่มีข้อมูลอะไหล่</td></tr>
                  )}
                </tbody>
              </table>
            </section>

            <section className="popup-section cost">
              <h4>💰 ค่าใช้จ่ายรวม</h4>
              <p>รวมทั้งหมด: <b>{Number(selectedBooking.total_price || 0).toLocaleString()} ฿</b></p>
            </section>

            {/* 📸 แสดงสลิป */}
            <section className="popup-section slip">
              <h4>📸 สลิปการชำระเงิน</h4>
              {selectedBooking.slipfilename ? (
                <img
                  src={`http://localhost:3000/uploads/${selectedBooking.slipfilename}`}
                  alt="Slip"
                  className="slip-image"
                />
              ) : (
                <>
                  <p style={{ color: "#888" }}>ยังไม่มีการอัปโหลดสลิป</p>
                  {selectedBooking.status_id === 5 && (
                    <div className="upload-section">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => setSlipFile(e.target.files[0])}
                      />
                      <button
                        className="btn btn-upload"
                        onClick={() => uploadSlip(selectedBooking.booking_id)}
                      >
                        📤 อัปโหลดสลิป
                      </button>
                    </div>
                  )}
                </>
              )}
            </section>

            <footer className="popup-actions">
              <button className="btn btn-secondary" onClick={closePopup}>ปิด</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
