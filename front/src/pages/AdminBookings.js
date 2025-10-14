import { useEffect, useState } from "react";
import { api } from "../api";
import Swal from "sweetalert2";
import "../styles/TableForBook.css";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../font/Sarabun-ExtraBold-normal.js";
import "../font/Sarabun-Regular-normal.js";

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
      case 5: return { text: "💰 รอชำระเงิน", class: "waiting" };
      case 3: return { text: "✅ เสร็จแล้ว", class: "done" };
      case 4: return { text: "❌ ยกเลิก", class: "cancel" };
      default: return { text: "❔ ไม่ทราบ", class: "unknown" };
    }
  };


  // ✅ ฟิลเตอร์ข้อมูล
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

  // ✅ อัปเดตค่าแรง / ค่าส่ง
  const updateCost = async () => {
    if (currentStatus === 3 || currentStatus === 4)
      return Swal.fire("⚠️", "ไม่สามารถแก้ไขในสถานะนี้ได้", "warning");

    try {
      const res = await api(`/api/bookings/${selectedBooking}`, {
        method: "PUT",
        body: {
          service: Number(bookingDetail.service),
          freight: bookingDetail.transport_required ? Number(bookingDetail.freight) : 0,
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

  // ✅ คำนวณราคารวม
  const totalParts = repairItems.reduce(
    (sum, i) => sum + Number(i.unit_price) * Number(i.quantity),
    0
  );
  const service = Number(bookingDetail?.service || 0);
  const freight = bookingDetail?.transport_required ? Number(bookingDetail?.freight || 0) : 0;
  const grandTotal = totalParts + service + freight;

  // ✅ พิมพ์ใบเสร็จ PDF (ไม่มีโลโก้)
  const printPDF = () => {
    if (!bookingDetail) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.setFont("Sarabun-Regular");

    // หัวกระดาษ
    doc.setFontSize(16);
    doc.setFont("Sarabun-ExtraBold");
    doc.text("ใบเสร็จซ่อมรถ / Repair Invoice", 70, 18);
    doc.line(14, 22, 196, 22);

    // รายละเอียดลูกค้า
    doc.setFontSize(11);
    doc.setFont("Sarabun-Regular");
    const startY = 30;
    doc.text(`เลขที่งานซ่อม: #${bookingDetail.booking_id}`, 14, startY);
    doc.text(`วันที่: ${new Date(bookingDetail.date).toLocaleDateString("th-TH")}`, 130, startY);
    doc.text(`ชื่อเจ้าของรถ: ${bookingDetail.owner_name || "-"}`, 14, startY + 7);
    doc.text(`รุ่นรถ: ${bookingDetail.model}`, 14, startY + 14);
    doc.text(`ทะเบียน: ${bookingDetail.license_plate}`, 130, startY + 14);
    doc.text(`ขนส่ง: ${bookingDetail.transport_required ? "ให้ร้านรับ-ส่งรถ" : "ลูกค้าส่งเอง"}`, 14, startY + 21);

    // ตารางอะไหล่
    const tableData = repairItems.map((i, idx) => [
      idx + 1,
      i.partname,
      i.quantity,
      `${Number(i.unit_price).toLocaleString()} ฿`,
      `${(i.unit_price * i.quantity).toLocaleString()} ฿`,
    ]);

    doc.autoTable({
      head: [["#", "ชื่ออะไหล่", "จำนวน", "ราคา/หน่วย", "รวม"]],
      body: tableData,
      startY: startY + 30,
      theme: "grid",
      headStyles: { fillColor: [41, 128, 185], textColor: 255 },
      styles: { font: "Sarabun-Regular", fontSize: 10 },
    });

    let finalY = doc.lastAutoTable.finalY + 8;
    doc.text(`ค่าอะไหล่: ${totalParts.toLocaleString()} ฿`, 120, finalY);
    doc.text(`ค่าแรง: ${service.toLocaleString()} ฿`, 120, finalY + 6);
    if (bookingDetail.transport_required) {
      doc.text(`ค่าส่งรถ: ${freight.toLocaleString()} ฿`, 120, finalY + 12);
      finalY += 6;
    }
    doc.setFont("Sarabun-ExtraBold");
    doc.text(`รวมทั้งหมด: ${grandTotal.toLocaleString()} ฿`, 120, finalY + 18);
    doc.line(14, finalY + 25, 196, finalY + 25);
    doc.setFont("Sarabun-Regular");
    doc.text("ลายเซ็นช่างผู้ซ่อม ____________________", 14, finalY + 40);
    doc.text("ลายเซ็นลูกค้า _________________________", 120, finalY + 40);
    doc.save(`Invoice_${bookingDetail.booking_id}.pdf`);
  };

  if (loading) return <div className="loading">⏳ กำลังโหลด...</div>;

  return (
    <div className="page-container">
      <h1 className="page-title">🧰 ระบบจัดการงานซ่อม (Admin)</h1>

      {/* ✅ Filter Bar */}
      <div className="filter-bar">
        <input
          type="text"
          placeholder="🔍 ค้นหา (ชื่อ / ทะเบียน / รุ่น)"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="all">ทุกสถานะ</option>
          <option value="1">⏳ รอช่าง</option>
          <option value="2">🔧 กำลังซ่อม</option>
          <option value="5">💰 รอชำระเงิน</option>
          <option value="3">✅ เสร็จแล้ว</option>
          <option value="4">❌ ยกเลิก</option>
        </select>

        <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
        <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        <button className="btn btn-primary" onClick={fetchBookings}>🔄 รีเฟรช</button>
      </div>

      {/* ตารางหลัก */}
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
                    <button className="btn btn-detail" onClick={() => openPopup(b.booking_id, b.status_id)}>🧾</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ Popup กะทัดรัด */}
      {selectedBooking && bookingDetail && (
        <div className="popup-overlay">
          <div className="popup-card compact">
            <h4 className="popup-title">🧾 งานซ่อม #{selectedBooking}</h4>

            <div className="info-grid">
              <div><b>🚗 รถ:</b> {bookingDetail.model} ({bookingDetail.license_plate})</div>
              <div><b>👤 เจ้าของ:</b> {bookingDetail.owner_name || "-"}</div>
              <div><b>📅 วันที่:</b> {new Date(bookingDetail.date).toLocaleDateString("th-TH")}</div>
              <div><b>🕓 เวลา:</b> {bookingDetail.time}</div>
              <div><b>💬 รายละเอียด:</b> {bookingDetail.description || "-"}</div>
              <div><b>🚚:</b> {bookingDetail.transport_required ? "รับ-ส่ง" : "ลูกค้าส่งเอง"}</div>
            </div>

            <div className="status-change">
              <label>สถานะ: </label>
              <select value={currentStatus} onChange={updateStatus}>
                <option value={1}>⏳ รอช่าง</option>
                <option value={2}>🔧 กำลังซ่อม</option>
                <option value={3}>✅ เสร็จแล้ว</option>
                <option value={4}>❌ ยกเลิก</option>
                <option value={5}>💰 รอชำระเงิน</option>
              </select>
            </div>

            <table className="table small">
              <thead>
                <tr>
                  <th>อุปกรณ์</th><th>จำนวน</th><th>ราคา/หน่วย</th><th>รวม</th><th></th>
                </tr>
              </thead>
              <tbody>
                {repairItems.map((i) => (
                  <tr key={i.part_id}>
                    <td>{i.partname}</td>
                    <td>{i.quantity}</td>
                    <td>{Number(i.unit_price).toLocaleString()} ฿</td>
                    <td>{(i.unit_price * i.quantity).toLocaleString()} ฿</td>
                    <td><button className="btn btn-cancel" onClick={() => deleteItem(i.part_id)}>🗑</button></td>
                  </tr>
                ))}
              </tbody>
            </table>

            {currentStatus !== 3 && currentStatus !== 4 && (
              <form onSubmit={addRepairItem} className="add-form">
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
              </form>
            )}

            <div className="cost-summary">
              <label>🧰 ค่าแรง:</label>
              <input type="number" value={bookingDetail.service || 0}
                onChange={(e) => setBookingDetail({ ...bookingDetail, service: e.target.value })} />
              {bookingDetail.transport_required && (
                <>
                  <label>🚗 ค่าส่ง:</label>
                  <input type="number" value={bookingDetail.freight || 0}
                    onChange={(e) => setBookingDetail({ ...bookingDetail, freight: e.target.value })} />
                </>
              )}
              <button className="btn btn-primary" onClick={updateCost}>💾</button>
            </div>

            <div className="total-mini">
              <p>อะไหล่: {totalParts.toLocaleString()} ฿</p>
              <p>แรง: {service.toLocaleString()} ฿</p>
              {bookingDetail.transport_required && <p>ส่งรถ: {freight.toLocaleString()} ฿</p>}
              <b>💰 รวม: {grandTotal.toLocaleString()} ฿</b>
            </div>

            {/* ✅ ส่วนแสดงสลิปที่แนบ */}
            {bookingDetail.slipfilename && (
              <div className="slip-preview">
                <h4>📄 สลิปการชำระเงินจากลูกค้า</h4>
                <img
                  src={`http://localhost:3000/uploads/${bookingDetail.slipfilename}`}
                  alt="Slip"
                  className="slip-img"
                />
                <p style={{ fontSize: "0.9rem", color: "#555", marginTop: "0.4rem" }}>
                  🕓 วันที่แนบ: {new Date(bookingDetail.updated_at || bookingDetail.date).toLocaleString("th-TH")}
                </p>
                <a
                  href={`http://localhost:3000/uploads/${bookingDetail.slipfilename}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-success"
                  style={{ marginTop: "0.6rem" }}
                >
                  🔍 เปิดดูขนาดเต็ม
                </a>
              </div>
            )}

            <div className="popup-actions">
              <button className="btn btn-print" onClick={printPDF}>🖨️ พิมพ์ใบเสร็จ</button>
              <button className="btn btn-secondary" onClick={closePopup}>ปิด</button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
