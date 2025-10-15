import { useEffect, useState } from "react";
import { api } from "../api";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../font/Sarabun-Regular-normal.js";
import "../font/Sarabun-ExtraBold-normal.js";

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

  // ✅ โหลดข้อมูลทั้งหมด
  useEffect(() => {
    fetchBookings();
    fetchParts();
  }, []);

  const fetchBookings = async () => {
    try {
      const data = await api("/api/bookings");
      if (data.success) {
        console.log("✅ Bookings fetched:", data.bookings);
        setBookings(data.bookings);
        setFiltered(data.bookings);
      }
    } catch (err) {
      console.error("❌ Error fetching bookings:", err);
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

  // ✅ Map สถานะ
  const getStatus = (id) => {
    switch (id) {
      case 1:
        return { text: "รอช่าง", class: "pending" };
      case 2:
        return { text: "กำลังซ่อม", class: "progress" };
      case 3:
        return { text: "เสร็จแล้ว", class: "done" };
      case 4:
        return { text: "ยกเลิกการจอง", class: "cancel" };
      case 5:
        return { text: "รอชำระเงิน", class: "waiting" };
      default:
        return { text: "-", class: "unknown" };
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

  // ✅ เปิด Popup
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
      Swal.fire("❌", "โหลดรายละเอียดไม่สำเร็จ", "error");
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
        Swal.fire("✅", "เพิ่มอะไหล่สำเร็จ", "success");
        form.reset();
        openPopup(selectedBooking, currentStatus);
      }
    } catch {
      Swal.fire("❌", "เกิดข้อผิดพลาด", "error");
    }
  };

  // ✅ คำนวณราคา
  const totalParts = repairItems.reduce(
    (sum, i) => sum + Number(i.unit_price) * Number(i.quantity),
    0
  );
  const service = Number(bookingDetail?.service || 0);
  const freight = bookingDetail?.transport_required ? Number(bookingDetail?.freight || 0) : 0;
  const grandTotal = totalParts + service + freight;

  // ✅ พิมพ์ใบเสร็จ PDF
  const printPDF = () => {
    if (!bookingDetail) return;
    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.setFont("Sarabun-Regular");
    doc.setFontSize(16);
    doc.text("ใบเสร็จซ่อมรถ (Repair Invoice)", 65, 18);
    doc.line(14, 22, 196, 22);
    doc.setFontSize(11);
    doc.text(`รหัสงาน: #${bookingDetail.booking_id}`, 14, 30);
    doc.text(`วันที่: ${new Date(bookingDetail.date).toLocaleDateString("th-TH")}`, 130, 30);
    doc.text(`รถ: ${bookingDetail.model} (${bookingDetail.license_plate})`, 14, 38);
    doc.text(`รายละเอียด: ${bookingDetail.description || "-"}`, 14, 46);

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
      startY: 56,
      theme: "grid",
      styles: { font: "Sarabun-Regular", fontSize: 10 },
      headStyles: { fillColor: [50, 100, 200], textColor: 255 },
    });

    let finalY = doc.lastAutoTable.finalY + 10;
    doc.text(`💰 รวมทั้งหมด: ${grandTotal.toLocaleString()} บาท`, 150, finalY);
    doc.text("ลงชื่อลูกค้า ____________________", 14, finalY + 20);
    doc.save(`Repair_${bookingDetail.booking_id}.pdf`);
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

      {/* ✅ ตาราง */}
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
                  <td>{b.owner_name || "-"}</td>
                  <td>{b.license_plate} ({b.model})</td>
                  <td>{b.description || "-"}</td>
                  <td>
                    <span className={`badge ${s.class}`}>
                      {b.status_name || s.text || "-"}
                    </span>
                  </td>
                  <td>
                    <button className="btn btn-detail" onClick={() => openPopup(b.booking_id, b.status_id)}>🧾</button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* ✅ Popup */}
      {selectedBooking && bookingDetail && (
        <div className="popup-overlay">
          <div className="popup-card compact">
            <h4 className="popup-title">🧾 งานซ่อม #{selectedBooking}</h4>

            <div className="info-grid">
              <div><b>รถ:</b> {bookingDetail.model} ({bookingDetail.license_plate})</div>
              <div><b>เจ้าของ:</b> {bookingDetail.owner_name || "-"}</div>
              <div><b>วันที่:</b> {new Date(bookingDetail.date).toLocaleDateString("th-TH")}</div>
              <div><b>เวลา:</b> {bookingDetail.time}</div>
              <div><b>รายละเอียด:</b> {bookingDetail.description || "-"}</div>
              <div><b>สถานะ:</b> {bookingDetail.status_name || getStatus(bookingDetail.status_id).text || "-"}</div>
            </div>

            <div className="status-change">
              <label>เปลี่ยนสถานะ:</label>
              <select value={currentStatus} onChange={updateStatus}>
                <option value={1}>⏳ รอช่าง</option>
                <option value={2}>🔧 กำลังซ่อม</option>
                <option value={5}>💰 รอชำระเงิน</option>
                <option value={3}>✅ เสร็จแล้ว</option>
                <option value={4}>❌ ยกเลิก</option>
              </select>
            </div>

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
