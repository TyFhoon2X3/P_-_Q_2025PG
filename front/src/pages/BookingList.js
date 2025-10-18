import { useEffect, useState } from "react";
import { api } from "../api";
import Swal from "sweetalert2";
import QRCode from "qrcode";
import "../styles/UserRepair.css";

export default function UserRepairStatus() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [bookingDetail, setBookingDetail] = useState(null);
  const [repairItems, setRepairItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slipFile, setSlipFile] = useState(null);

  // 🔍 ฟิลเตอร์
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");

  useEffect(() => {
    fetchMyBookings();
  }, []);

  // ✅ โหลดงานซ่อมของผู้ใช้
  const fetchMyBookings = async () => {
    try {
      const data = await api("/api/bookings/mine");
      if (data.success) {
        const sorted = data.bookings.sort((a, b) => new Date(b.date) - new Date(a.date));
        setBookings(sorted);
        setFiltered(sorted);
      }
    } catch {
      Swal.fire("❌", "โหลดข้อมูลงานซ่อมไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ ยกเลิกงานซ่อม
  const cancelBooking = async () => {
    const confirm = await Swal.fire({
      title: "❌ ยืนยันการยกเลิกงานซ่อม?",
      text: "หากยกเลิกแล้วจะไม่สามารถเรียกคืนได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "กลับ",
    });

    if (!confirm.isConfirmed) return;

    try {
      const res = await api(`/api/bookings/${selectedBooking}/status`, {
        method: "PUT",
        body: { status_id: 4 },
      });
      if (res.success) {
        Swal.fire("✅", "ยกเลิกงานซ่อมเรียบร้อยแล้ว", "success");
        fetchMyBookings();
        closePopup();
      } else {
        Swal.fire("❌", res.message || "ยกเลิกไม่สำเร็จ", "error");
      }
    } catch {
      Swal.fire("❌", "เกิดข้อผิดพลาดระหว่างการยกเลิก", "error");
    }
  };

  // ✅ ฟิลเตอร์การค้นหา
  useEffect(() => {
    let data = bookings;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      data = data.filter(
        (b) =>
          b.license_plate?.toLowerCase().includes(term) ||
          b.model?.toLowerCase().includes(term) ||
          b.description?.toLowerCase().includes(term)
      );
    }
    if (statusFilter !== "all") data = data.filter((b) => String(b.status_id) === String(statusFilter));
    if (startDate && endDate) {
      data = data.filter((b) => {
        const d = new Date(b.date);
        return d >= new Date(startDate) && d <= new Date(endDate);
      });
    }
    setFiltered(data);
  }, [searchTerm, statusFilter, startDate, endDate, bookings]);

  const resetFilters = () => {
    setSearchTerm("");
    setStatusFilter("all");
    setStartDate("");
    setEndDate("");
    setFiltered(bookings);
  };

  // ✅ สถานะ
  const getStatus = (id) => {
    switch (id) {
      case 1: return { text: "⏳ รอช่าง", class: "pending" };
      case 2: return { text: "🔧 กำลังซ่อม", class: "progress" };
      case 3: return { text: "✅ เสร็จแล้ว", class: "done" };
      case 4: return { text: "❌ ยกเลิกการจอง", class: "cancel" };
      case 5: return { text: "💰 รอชำระเงิน", class: "waiting" };
      default: return { text: "❔ ไม่ทราบ", class: "unknown" };
    }
  };

  // ✅ เปิดรายละเอียด
  const openPopup = async (booking_id) => {
    setSelectedBooking(booking_id);
    try {
      const [repairRes, detailRes] = await Promise.all([
        api(`/api/repair-items/${booking_id}`),
        api(`/api/bookings/${booking_id}`)
      ]);
      if (repairRes.success) setRepairItems(repairRes.items || []);
      if (detailRes.success) setBookingDetail(detailRes.booking);
    } catch {
      Swal.fire("❌", "โหลดรายละเอียดไม่สำเร็จ", "error");
    }
  };

  const closePopup = () => {
    setSelectedBooking(null);
    setRepairItems([]);
    setBookingDetail(null);
    setSlipFile(null);
  };

  // ✅ QR PromptPay
  const generatePromptPayPayload = (mobileNumber, amount) => {
    const cleanNumber = mobileNumber.replace(/[^0-9]/g, "");
    const mobile = "66" + cleanNumber.substring(1);
    const idPayloadFormat = "00";
    const idPOI = "01";
    const idMerchantInfo = "29";
    const idTransactionCurrency = "53";
    const idTransactionAmount = "54";
    const idCountryCode = "58";
    const idCRC = "63";

    let payload =
      idPayloadFormat + "02" + "01" +
      idPOI + "02" + "11" +
      idMerchantInfo + "37" +
      "0016A000000677010111011300" + mobile +
      idTransactionCurrency + "03" + "764";

    const amt = amount.toFixed(2);
    const len = amt.length.toString().padStart(2, "0");
    payload += idTransactionAmount + len + amt;
    payload += idCountryCode + "02TH";
    payload += idCRC + "04";

    const crc = computeCRC16(payload);
    return payload + crc;
  };

  const computeCRC16 = (payload) => {
    let crc = 0xFFFF;
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = (crc & 0x8000) ? (crc << 1) ^ 0x1021 : crc << 1;
        crc &= 0xFFFF;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  };

  const showQRCode = async () => {
    try {
      const phoneNumber = "0612163450";
      const totalAmount =
        Number(bookingDetail.cost || 0) +
        Number(bookingDetail.service || 0) +
        Number(bookingDetail.freight || 0);

      const payload = generatePromptPayPayload(phoneNumber, totalAmount);
      const qrImage = await QRCode.toDataURL(payload, { width: 250 });

      Swal.fire({
        title: "📱 สแกนเพื่อชำระเงิน",
        html: `
          <p>ยอดชำระทั้งหมด <b>${totalAmount.toLocaleString()} บาท</b></p>
          <img src="${qrImage}" alt="QR Payment" style="width:230px; border-radius:10px; margin-top:10px;" />
          <p style="margin-top:10px; font-weight:bold;">ชื่อบัญชี: ร้าน P&Q Garage Auto Repair</p>
          <p>พร้อมเพย์: ${phoneNumber}</p>
        `,
        confirmButtonText: "ปิด",
      });
    } catch {
      Swal.fire("❌", "สร้าง QR Code ไม่สำเร็จ", "error");
    }
  };

  // ✅ Upload Slip
  const uploadSlip = async (e) => {
    e.preventDefault();
    if (!slipFile) return Swal.fire("⚠️", "กรุณาเลือกไฟล์ก่อน", "info");

    const formData = new FormData();
    formData.append("slip", slipFile);

    try {
      const res = await fetch(`http://localhost:3000/api/bookings/${selectedBooking}/slip`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
        body: formData,
      });
      const data = await res.json();
      if (data.success) {
        Swal.fire("✅", "อัปโหลดสลิปสำเร็จ", "success");
        fetchMyBookings();
        openPopup(selectedBooking);
      } else {
        Swal.fire("❌", data.message || "อัปโหลดไม่สำเร็จ", "error");
      }
    } catch {
      Swal.fire("❌", "ไม่สามารถอัปโหลดไฟล์ได้", "error");
    }
  };

  if (loading) return <div className="loading">⏳ กำลังโหลด...</div>;

  return (
    <div className="user-page">
      <h1 className="user-title">🚗 งานซ่อมของฉัน</h1>

      {/* 🔍 Filter */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="🔍 ค้นหา (ทะเบียน / รุ่น / รายละเอียด)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">ทั้งหมด</option>
          <option value="1">⏳ รอช่าง</option>
          <option value="2">🔧 กำลังซ่อม</option>
          <option value="3">✅ เสร็จแล้ว</option>
          <option value="4">❌ ยกเลิก</option>
        </select>
        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button className="btn btn-secondary" onClick={resetFilters}>รีเซ็ต</button>
      </div>

      {/* ตารางงาน */}
      <table className="user-table">
        <thead>
          <tr><th>รหัส</th><th>วันที่</th><th>เวลา</th><th>รถ</th><th>รายละเอียด</th><th>สถานะ</th><th>จัดการ</th></tr>
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
                <td>{b.description || "-"}</td>
                <td><span className={`status-badge ${s.class}`}>{s.text}</span></td>
                <td><button className="btn btn-detail" onClick={() => openPopup(b.booking_id)}>🧾 จัดการ</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Popup รายละเอียด */}
      {selectedBooking && bookingDetail && (
        <div className="popup-overlay">
          <div className="popup-card compact">
            <h4 className="popup-title">🧾 งานซ่อม #{selectedBooking}</h4>

            <div className="info-grid">
              <div><b>รถ:</b> {bookingDetail.model} ({bookingDetail.license_plate})</div>
              <div><b>วันที่:</b> {new Date(bookingDetail.date).toLocaleDateString("th-TH")}</div>
              <div><b>เวลา:</b> {bookingDetail.time}</div>
              <div><b>รายละเอียด:</b> {bookingDetail.description || "-"}</div>
              <div><b>สถานะ:</b> {getStatus(bookingDetail.status_id).text}</div>
            </div>

            <table className="table small">
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

            {/* ✅ สรุปค่าใช้จ่าย */}
            <div className="total-section">
              <h4>💰 สรุปค่าใช้จ่าย</h4>
              <p>ค่าอะไหล่: <b>{Number(bookingDetail.cost || 0).toLocaleString()} ฿</b></p>
              <p>ค่าแรงช่าง: <b>{Number(bookingDetail.service || 0).toLocaleString()} ฿</b></p>
              <p>ค่ารับ-ส่งรถ: <b>{Number(bookingDetail.freight || 0).toLocaleString()} ฿</b></p>
              <hr />
              <p style={{ fontSize: "16px" }}>
                รวมทั้งหมด:{" "}
                <b style={{ color: "#007bff" }}>
                  {(
                    Number(bookingDetail.cost || 0) +
                    Number(bookingDetail.service || 0) +
                    Number(bookingDetail.freight || 0)
                  ).toLocaleString()} ฿
                </b>
              </p>
            </div>

            {/* ✅ QR PromptPay */}
            {bookingDetail.status_id === 5 && (
              <>
                <div className="qr-section">
                  <button className="btn btn-success" onClick={showQRCode}>
                    📱 แสดง QR พร้อมยอด
                  </button>
                </div>

                <form onSubmit={uploadSlip} className="slip-upload">
                  <label>📎 แนบสลิปการชำระเงิน:</label>
                  <input
                    type="file"
                    accept=".jpg,.jpeg,.png,.pdf"
                    onChange={(e) => setSlipFile(e.target.files[0])}
                  />
                  <button className="btn btn-primary" type="submit">
                    📤 อัปโหลด
                  </button>
                </form>
              </>
            )}

            {/* ✅ แสดงสลิปถ้ามี */}
            {bookingDetail.slipfilename && (
              <div className="slip-preview">
                <p>📄 สลิปที่แนบแล้ว:</p>
                <img
                  src={`http://localhost:3000/uploads/${bookingDetail.slipfilename}`}
                  alt="Slip"
                  className="slip-img"
                />
              </div>
            )}

            <div className="popup-actions">
              {bookingDetail.status_id === 1 && (
                <button className="btn btn-cancel" onClick={cancelBooking}>
                  ❌ ยกเลิกการซ่อม
                </button>
              )}
              <button className="btn btn-secondary" onClick={closePopup}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
