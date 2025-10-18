import { useEffect, useState } from "react";
import { api } from "../api";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import "../font/Sarabun-Regular-normal.js";
import "../font/Sarabun-ExtraBold-normal.js";
import "../styles/UserRepair.css";

export default function UserRepairStatus() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selectedBooking, setSelectedBooking] = useState(null);
  const [repairItems, setRepairItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [slipFile, setSlipFile] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, []);

  // ✅ โหลดรายการซ่อมของผู้ใช้
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

  // ✅ โหลดรายการอะไหล่
  const fetchRepairItems = async (id) => {
    try {
      const res = await api(`/api/repair-items/${id}`);
      if (res.success) setRepairItems(res.items || []);
    } catch {
      setRepairItems([]);
    }
  };

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

  const openDetail = async (b) => {
    setSelectedBooking(b);
    await fetchRepairItems(b.booking_id);
  };

  const closePopup = () => {
    setSelectedBooking(null);
    setRepairItems([]);
  };

  // ✅ อัปโหลด slip
  const uploadSlip = async (bookingId) => {
    if (!slipFile) return Swal.fire("⚠️", "กรุณาเลือกไฟล์ก่อนอัปโหลด", "warning");
    const formData = new FormData();
    formData.append("slip", slipFile);
    try {
      const res = await api(`/api/bookings/${bookingId}/slip`, { method: "POST", body: formData });
      if (res.success) {
        Swal.fire("✅", "อัปโหลดสลิปสำเร็จ!", "success");
        fetchBookings();
        closePopup();
      }
    } catch {
      Swal.fire("❌", "เกิดข้อผิดพลาดในการอัปโหลด", "error");
    }
  };

  // ✅ ฟังก์ชันพิมพ์ PDF (สำหรับลูกค้า)
  const printReceipt = () => {
    if (!selectedBooking) return;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.setFont("Sarabun-Regular");
    doc.setFontSize(16);
    doc.text("ใบเสร็จการซ่อมรถ (Customer Repair Receipt)", 45, 18);
    doc.line(14, 22, 196, 22);

    // 🧾 Header Info
    doc.setFontSize(11);
    doc.text(`เลขที่งาน: #${selectedBooking.booking_id}`, 14, 30);
    doc.text(`วันที่: ${new Date(selectedBooking.date).toLocaleDateString("th-TH")}`, 130, 30);
    doc.text(`ลูกค้า: ${selectedBooking.owner_name}`, 14, 38);
    doc.text(`รถ: ${selectedBooking.model} (${selectedBooking.license_plate})`, 14, 46);
    doc.text(`สถานะ: ${getStatus(selectedBooking.status_id).text}`, 14, 54);

    const desc = selectedBooking.description ? selectedBooking.description.trim() : "-";
    doc.text(`รายละเอียดการซ่อม: ${desc}`, 14, 62, { maxWidth: 180 });

    // 🔩 ตารางอะไหล่
    const tableData = repairItems.map((i, idx) => [
      idx + 1,
      i.partname,
      i.quantity,
      `${Number(i.unit_price).toLocaleString("th-TH", { minimumFractionDigits: 2 })}`,
      `${(i.unit_price * i.quantity).toLocaleString("th-TH", { minimumFractionDigits: 2 })}`,
    ]);

    doc.autoTable({
      startY: 70,
      head: [["#", "ชื่ออะไหล่", "จำนวน", "ราคา/หน่วย (บาท)", "ราคารวม (บาท)"]],
      body: tableData,
      styles: { font: "Sarabun-Regular", fontSize: 10, valign: "middle" },
      headStyles: { fillColor: [33, 102, 172], textColor: 255, halign: "center" },
      theme: "striped",
    });

    const totalParts = repairItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
    const service = Number(selectedBooking.service || 0);
    const freight = Number(selectedBooking.freight || 0);
    const grandTotal = totalParts + service + freight;

    let y = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(12);
    doc.text("สรุปค่าใช้จ่าย", 14, y);
    doc.line(14, y + 2, 196, y + 2);

    const labelX = 125, rightX = 180;
    y += 10;
    doc.text("ค่าอะไหล่:", labelX, y);
    doc.text(`${totalParts.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท`, rightX, y, { align: "right" });

    y += 8;
    doc.text("ค่าบริการ:", labelX, y);
    doc.text(`${service.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท`, rightX, y, { align: "right" });

    if (selectedBooking.transport_required) {
      y += 8;
      doc.text("ค่าขนส่ง:", labelX, y);
      doc.text(`${freight.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท`, rightX, y, { align: "right" });
    }

    y += 12;
    doc.setFont("Sarabun-ExtraBold");
    doc.setFontSize(13);
    doc.text("รวมทั้งหมด:", labelX - 2, y);
    doc.text(`${grandTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท`, rightX, y, { align: "right" });

    // ✅ Footer
    y += 25;
    doc.setFont("Sarabun-Regular");
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text("ขอบคุณที่ใช้บริการ P&Q Garage", 80, y);
    doc.save(`Receipt_${selectedBooking.booking_id}.pdf`);
  };

  if (loading) return <div className="loading">⏳ กำลังโหลด...</div>;

  return (
    <div className="user-page">
      <h2 className="user-title">🔧 ติดตามสถานะงานซ่อม</h2>

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

      {/* 📄 Popup รายละเอียด */}
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

            {/* 📸 สลิป */}
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
                      <input type="file" accept="image/*" onChange={(e) => setSlipFile(e.target.files[0])} />
                      <button className="btn btn-upload" onClick={() => uploadSlip(selectedBooking.booking_id)}>📤 อัปโหลดสลิป</button>
                    </div>
                  )}
                </>
              )}
            </section>

            <footer className="popup-actions">
              <button className="btn btn-print" onClick={printReceipt}>🖨️ พิมพ์ใบเสร็จ</button>
              <button className="btn btn-secondary" onClick={closePopup}>ปิด</button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}
