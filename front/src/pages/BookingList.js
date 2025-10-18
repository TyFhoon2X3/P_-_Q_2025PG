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

  // ✅ เปลี่ยนสถานะข้อความ
  const getStatus = (id) => {
    switch (Number(id)) {
      case 1:
        return { text: "⏳ รอช่าง", class: "pending" };
      case 2:
        return { text: "🔧 กำลังซ่อม", class: "progress" };
      case 5:
        return { text: "💰 รอชำระ", class: "waiting" };
      case 3:
        return { text: "✅ เสร็จแล้ว", class: "done" };
      case 4:
        return { text: "❌ ยกเลิก", class: "cancel" };
      default:
        return { text: "-", class: "" };
    }
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
>>>>>>> d3480cde3ae02edeed9c4ebf02c2279628111cca
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

<<<<<<< HEAD
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
      fetchBookings();
      closePopup();
    } else {
      Swal.fire("❌", res.message || "อัปโหลดไม่สำเร็จ", "error");
    }
  } catch (err) {
    console.error("Upload error:", err);
    Swal.fire("❌", "เกิดข้อผิดพลาดในการอัปโหลด", "error");
  }
};


  // ✅ QR PromptPay Generator
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
      idPayloadFormat +
      "02" +
      "01" +
      idPOI +
      "02" +
      "11" +
      idMerchantInfo +
      "37" +
      "0016A000000677010111011300" +
      mobile +
      idTransactionCurrency +
      "03" +
      "764";

    const amt = amount.toFixed(2);
    const len = amt.length.toString().padStart(2, "0");
    payload += idTransactionAmount + len + amt;
    payload += idCountryCode + "02TH";
    payload += idCRC + "04";

    const crc = computeCRC16(payload);
    return payload + crc;
  };

  const computeCRC16 = (payload) => {
    let crc = 0xffff;
    for (let i = 0; i < payload.length; i++) {
      crc ^= payload.charCodeAt(i) << 8;
      for (let j = 0; j < 8; j++) {
        crc = crc & 0x8000 ? (crc << 1) ^ 0x1021 : crc << 1;
        crc &= 0xffff;
      }
    }
    return crc.toString(16).toUpperCase().padStart(4, "0");
  };

  // ✅ แสดง QR Code
  const showQRCode = async () => {
    const phoneNumber = "0612163450"; // 📱 พร้อมเพย์ร้าน
    const freight = Number(selectedBooking.freight || 0);
    const service = Number(selectedBooking.service || 0);
    const partsTotal = repairItems.reduce(
      (sum, i) => sum + i.unit_price * i.quantity,
      0
    );
    const total = partsTotal + service + freight;

    try {
      const payload = generatePromptPayPayload(phoneNumber, total);
      const qrImage = await QRCode.toDataURL(payload, { width: 230 });

      Swal.fire({
        title: "📱 สแกนเพื่อชำระเงิน",
        html: `
          <p>ยอดชำระทั้งหมด <b>${total.toLocaleString()} บาท</b></p>
          <img src="${qrImage}" alt="QR Payment" style="width:200px; border-radius:10px; margin-top:10px;" />
          <p style="margin-top:10px; font-weight:bold;">บัญชีพร้อมเพย์: ${phoneNumber}</p>
          <p>ชื่อบัญชี: ร้าน P & Q Garage</p>
        `,
        confirmButtonText: "ปิด",
      });
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

=======
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

>>>>>>> d3480cde3ae02edeed9c4ebf02c2279628111cca
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
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
        >
          <option value="all">ทุกสถานะ</option>
          <option value="1">รอช่าง</option>
          <option value="2">กำลังซ่อม</option>
          <option value="5">รอชำระ</option>
          <option value="3">เสร็จแล้ว</option>
          <option value="4">ยกเลิก</option>
        </select>
        <input
          type="date"
          value={startDate}
          onChange={(e) => setStartDate(e.target.value)}
        />
        <input
          type="date"
          value={endDate}
          onChange={(e) => setEndDate(e.target.value)}
        />
      </div>

      {/* ตารางงาน */}
      <table className="user-table">
        <thead>
<<<<<<< HEAD
          <tr>
            <th>#</th><th>วันที่</th><th>เวลา</th><th>รถ</th><th>สถานะ</th><th>ยอดรวม</th><th>จัดการ</th>
          </tr>
=======
          <tr><th>รหัส</th><th>วันที่</th><th>เวลา</th><th>รถ</th><th>รายละเอียด</th><th>สถานะ</th><th>จัดการ</th></tr>
>>>>>>> d3480cde3ae02edeed9c4ebf02c2279628111cca
        </thead>
        <tbody>
          {filtered.map((b) => {
            const s = getStatus(b.status_id);
            return (
              <tr key={b.booking_id}>
                <td>{b.booking_id}</td>
                <td>{new Date(b.date).toLocaleDateString("th-TH")}</td>
                <td>{b.time}</td>
                <td>
                  {b.license_plate} ({b.model})
                </td>
                <td>
                  <span className={`status-badge ${s.class}`}>{s.text}</span>
                </td>
                <td>{Number(b.total_price || 0).toLocaleString()} ฿</td>
                <td>
                  <button
                    className="btn btn-detail"
                    onClick={() => openDetail(b)}
                  >
                    🔍 ดูรายละเอียด
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* Popup รายละเอียด */}
<<<<<<< HEAD
      {selectedBooking && (
        <div className="popup-overlay" onClick={closePopup}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <header className="popup-header">
              <h3>🧾 รายละเอียดงาน #{selectedBooking.booking_id}</h3>
              <button className="btn-close" onClick={closePopup}>✖</button>
            </header>

            <p>
              <b>รถ:</b> {selectedBooking.model} (
              {selectedBooking.license_plate})
            </p>
            <p>
              <b>วันที่:</b>{" "}
              {new Date(selectedBooking.date).toLocaleDateString("th-TH")}{" "}
              {selectedBooking.time}
            </p>
            <p>
              <b>รายละเอียด:</b> {selectedBooking.description || "-"}
            </p>
            <p>
              <b>สถานะ:</b>{" "}
              <span
                className={`status-badge ${
                  getStatus(selectedBooking.status_id).class
                }`}
              >
                {getStatus(selectedBooking.status_id).text}
              </span>
            </p>

            <h4>🧩 รายการอะไหล่</h4>
            <table className="small-table">
              <thead>
                <tr>
                  <th>ชื่ออะไหล่</th>
                  <th>จำนวน</th>
                  <th>ราคา/หน่วย</th>
                  <th>รวม</th>
                </tr>
              </thead>
              <tbody>
                {repairItems.length > 0 ? (
                  repairItems.map((i) => (
                    <tr key={i.part_id}>
                      <td>{i.partname}</td>
                      <td>{i.quantity}</td>
                      <td>{i.unit_price.toLocaleString()} ฿</td>
                      <td>{(i.unit_price * i.quantity).toLocaleString()} ฿</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4">ไม่มีข้อมูลอะไหล่</td>
                  </tr>
                )}
              </tbody>
            </table>

            {/* 💰 รวมยอดแยก */}
            {/* 💰 รวมยอดแยก */}
            <div className="total-box">
              <p>
                ค่าอะไหล่:{" "}
                {repairItems
                  .reduce((sum, i) => sum + i.unit_price * i.quantity, 0)
                  .toLocaleString()}{" "}
                ฿
              </p>
              <p>
                ค่าบริการ (Service):{" "}
                {Number(selectedBooking.service || 0).toLocaleString()} ฿
              </p>
              {selectedBooking.transport_required && (
                <p>
                  ค่าขนส่ง (Freight):{" "}
                  {Number(selectedBooking.freight || 0).toLocaleString()} ฿
                </p>
              )}
              <hr />
              {/* รวมทั้งหมดแบบคำนวณสด */}
              <b>
                รวมทั้งหมด:{" "}
                {(
                  Number(selectedBooking.service || 0) +
                  Number(selectedBooking.freight || 0) +
                  repairItems.reduce(
                    (sum, i) => sum + i.unit_price * i.quantity,
                    0
                  )
                ).toLocaleString()}{" "}
                ฿
              </b>
            </div>

            {/* 📸 สลิป + QR */}
            {selectedBooking.status_id === 5 && (
              <>
                <button className="btn btn-qrcode" onClick={showQRCode}>
                  📱 แสดง QR พร้อมยอด
                </button>
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
              </>
            )}

            {selectedBooking.slipfilename && (
              <div className="slip-preview">
                <img
                  src={`http://localhost:3000/uploads/${selectedBooking.slipfilename}`}
                  alt="Slip"
                  className="slip-image"
                />
              </div>
            )}

<<<<<<< HEAD
            <footer className="popup-actions">
              <button className="btn btn-secondary" onClick={closePopup}>ปิด</button>
            </footer>
=======
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
>>>>>>> d3480cde3ae02edeed9c4ebf02c2279628111cca
          </div>
        </div>
      )}
    </div>
  );
}
