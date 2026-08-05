import { useEffect, useState } from "react";
import { api } from "../api";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";
import * as XLSX from "xlsx";
import "../font/Sarabun-Regular-normal.js";
import "../font/Sarabun-ExtraBold-normal.js";
import "../styles/AdminRepairManager.css";

export default function AdminRepairManager() {
  const [bookings, setBookings] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [selected, setSelected] = useState(null);
  const [repairItems, setRepairItems] = useState([]);
  const [parts, setParts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [staff, setStaff] = useState([]);

  // 🧮 Pagination
  const [page, setPage] = useState(1);
  const rowsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / rowsPerPage);

  useEffect(() => {
    fetchBookings();
    fetchStaff();
  }, []);

  const fetchStaff = async () => {
    try {
      const res = await api("/api/customers/staff");
      if (res.success) setStaff(res.staff || []);
    } catch {
      console.error("Failed to fetch staff");
    }
  };

  // ✅ โหลดรายการงานซ่อมทั้งหมด
  const fetchBookings = async () => {
    try {
      const res = await api("/api/bookings");
      if (res.success) {
        const sorted = res.bookings.sort((a, b) => b.booking_id - a.booking_id);
        setBookings(sorted);
        setFiltered(sorted);
      }
    } catch {
      Swal.fire("❌", "โหลดข้อมูลงานซ่อมไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  };

  // ✅ โหลดอะไหล่ของงานซ่อม
  const fetchRepairItems = async (id) => {
    try {
      const res = await api(`/api/repair-items/${id}`);
      if (res.success) setRepairItems(res.items || []);
    } catch {
      setRepairItems([]);
    }
  };

  // ✅ โหลดอะไหล่ทั้งหมด
  const fetchParts = async () => {
    try {
      const res = await api("/api/parts");
      if (res.success) setParts(res.parts || []);
    } catch {
      setParts([]);
    }
  };

  // ✅ Map สถานะ
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

  // ✅ เปิดรายละเอียด
  const openDetail = async (b) => {
    setSelected(b);
    await Promise.all([fetchRepairItems(b.booking_id), fetchParts()]);
  };

  const closePopup = () => {
    setSelected(null);
    setRepairItems([]);
  };

  // ✅ เพิ่มอะไหล่
  const addRepairItem = async (e) => {
    e.preventDefault();
    const form = e.target;
    const part_id = form.part_id.value;
    const qty = Number(form.quantity.value);
    if (!part_id || !qty) return;

    const part = parts.find((p) => p.part_id === part_id);
    if (!part) return Swal.fire("⚠️", "ไม่พบข้อมูลอะไหล่", "warning");

    // ✅ ตรวจสอบสต็อกเบื้องต้นที่ฝั่ง Client
    if (qty > part.quantity) {
      return Swal.fire({
        icon: "error",
        title: "สต็อกไม่เพียงพอ",
        text: `อะไหล่ชิ้นนี้เหลือเพียง ${part.quantity} ชิ้นในคลัง`,
      });
    }

    const res = await api("/api/repair-items", {
      method: "POST",
      body: { booking_id: selected.booking_id, part_id, quantity: qty, unit_price: part.unit_price },
    });

    if (res.success) {
      Swal.fire("✅", "เพิ่มอะไหล่สำเร็จ", "success");
      fetchRepairItems(selected.booking_id);
      form.reset();
    } else {
      Swal.fire("❌", res.message || "เพิ่มไม่สำเร็จ", "error");
    }
  };

  // ✅ ลบอะไหล่
  const deleteItem = async (part_id) => {
    const res = await api(`/api/repair-items/${selected.booking_id}/${part_id}`, { method: "DELETE" });
    if (res.success) {
      Swal.fire("🗑️", "ลบอะไหล่สำเร็จ", "success");
      fetchRepairItems(selected.booking_id);
    } else {
      Swal.fire("❌", res.message, "error");
    }
  };

  // ✅ บันทึกค่าใช้จ่าย
  const updateCost = async (e) => {
    e.preventDefault();
    const freightInput = e.target.elements.freight;
    const serviceInput = e.target.elements.service;
    const freight = selected.transport_required ? Number(freightInput?.value || 0) : 0;
    const service = Number(serviceInput?.value || 0);

    // Sanitise and prevent negative values
    const safeFreight = Math.max(0, freight);
    const safeService = Math.max(0, service);

    if (freight < 0 || service < 0) {
      return Swal.fire("❌", "ค่าต้องไม่เป็นค่าติดลบ", "error");
    }

    console.log("Saving cost:", { freight, service, transport: selected.transport_required });

    const res = await api(`/api/bookings/${selected.booking_id}/cost`, {
      method: "PUT",
      body: { freight: safeFreight, service: safeService },
    });

    if (res.success) {
      Swal.fire("✅", "บันทึกค่าใช้จ่ายสำเร็จ", "success");
      fetchBookings();
      setSelected({ ...selected, freight: safeFreight, service: safeService });
    } else {
      Swal.fire("❌", res.message || "บันทึกไม่สำเร็จ", "error");
    }
  };

  // ✅ เปลี่ยนสถานะ
  const updateStatus = async (newStatus) => {
    const res = await api(`/api/bookings/${selected.booking_id}/status`, {
      method: "PUT",
      body: { status_id: Number(newStatus) },
    });
    if (res.success) {
      Swal.fire("✅", "อัปเดตสถานะสำเร็จ", "success");
      fetchBookings();
      setSelected({ ...selected, status_id: Number(newStatus) });
    } else {
      Swal.fire("❌", res.message || "เปลี่ยนสถานะไม่สำเร็จ", "error");
    }
  };

  // ✅ เปลี่ยนพนักงาน (ช่าง)
  const updateTechnician = async (techId) => {
    const res = await api(`/api/bookings/${selected.booking_id}`, {
      method: "PUT",
      body: { technician_id: techId ? Number(techId) : null },
    });
    if (res.success) {
      Swal.fire("✅", "มอบหมายช่างสำเร็จ", "success");
      fetchBookings();
      setSelected({ ...selected, technician_id: techId ? Number(techId) : null });
    } else {
      Swal.fire("❌", res.message || "มอบหมายไม่สำเร็จ", "error");
    }
  };

  // ✅ พิมพ์ PDF
  // ✅ พิมพ์ PDF แบบใหม่ (มีช่องลายเซ็น)
  // ✅ พิมพ์ PDF (ใบสรุปงานซ่อมเวอร์ชันสมบูรณ์)
  const printPDF = () => {
    if (!selected) return;

    const doc = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
    doc.setFont("Sarabun-Regular");
    doc.setFontSize(16);
    doc.text("ใบสรุปงานซ่อม (Repair Report)", 65, 18);
    doc.line(14, 22, 196, 22);

    // 🧾 Header Info
    doc.setFontSize(11);
    doc.text(`เลขที่งาน: #${selected.booking_id}`, 14, 30);
    doc.text(`วันที่: ${new Date(selected.date).toLocaleDateString("th-TH")}`, 130, 30);
    doc.text(`ลูกค้า: ${selected.owner_name}`, 14, 38);
    doc.text(`รถ: ${selected.model} (${selected.license_plate})`, 14, 46);
    doc.text(`สถานะ: ${getStatus(selected.status_id).text}`, 14, 54);

    // ✏️ รายละเอียดงาน
    const desc = selected.description ? selected.description.trim() : "-";
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
      styles: {
        font: "Sarabun-Regular",
        fontSize: 10,
        cellPadding: { top: 3, bottom: 3, left: 3, right: 3 },
        valign: "middle",
      },
      headStyles: { fillColor: [40, 100, 200], textColor: 255, halign: "center" },
      columnStyles: {
        0: { cellWidth: 10, halign: "center" },
        1: { cellWidth: 70, halign: "left" },
        2: { cellWidth: 20, halign: "center" },
        3: { cellWidth: 40, halign: "right" },
        4: { cellWidth: 40, halign: "right" },
      },
      theme: "striped",
    });

    // 💰 สรุปยอดรวม
    const totalParts = repairItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
    const service = Number(selected.service || 0);
    const freight = Number(selected.freight || 0);
    const grandTotal = totalParts + service + freight;

    let y = doc.lastAutoTable.finalY + 12;
    doc.setFontSize(12);
    doc.text("สรุปค่าใช้จ่าย", 14, y);
    doc.line(14, y + 2, 196, y + 2);

    const rightAlign = 180; // ขยับขวาให้ห่างขึ้น
    const labelX = 125;     // ตำแหน่งข้อความ
    y += 10;
    doc.setFontSize(11);
    doc.text("ค่าอะไหล่:", labelX, y);
    doc.text(`${totalParts.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท`, rightAlign, y, { align: "right" });

    y += 8;
    doc.text("ค่าบริการ:", labelX, y);
    doc.text(`${service.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท`, rightAlign, y, { align: "right" });

    if (selected.transport_required) {
      y += 8;
      doc.text("ค่าขนส่ง:", labelX, y);
      doc.text(`${freight.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท`, rightAlign, y, { align: "right" });
    }

    // ✅ รวมทั้งหมด (เพิ่มระยะห่างและทำให้ดูหรู)
    y += 12;
    doc.setFont("Sarabun-ExtraBold");
    doc.setFontSize(13);
    doc.text("รวมทั้งหมด:", labelX - 2, y);
    doc.text(`${grandTotal.toLocaleString("th-TH", { minimumFractionDigits: 2 })} บาท`, rightAlign, y, { align: "right" });

    // ✍️ ช่องลายเซ็น
    y += 30;
    doc.setFont("Sarabun-Regular");
    doc.setFontSize(11);
    doc.text("..........................................................", 35, y);
    doc.text("..........................................................", 135, y);

    y += 6;
    doc.text("(ลายเซ็นลูกค้า)", 55, y);
    doc.text("(นายอาดี อาแวหามะ)", 145, y);

    // 🏁 Footer
    y += 10;
    doc.setFontSize(10);
    doc.setTextColor(120, 120, 120);
    doc.text("ขอบคุณที่ใช้บริการ P&Q Garage — บริการซ่อมรถครบวงจร", 55, y);

    doc.save(`Repair_${selected.booking_id}.pdf`);
  };




  // 🔍 ฟิลเตอร์
  useEffect(() => {
    let data = bookings;
    if (search)
      data = data.filter(
        (b) =>
          b.license_plate?.toLowerCase().includes(search.toLowerCase()) ||
          b.model?.toLowerCase().includes(search.toLowerCase()) ||
          b.owner_name?.toLowerCase().includes(search.toLowerCase())
      );
    if (status !== "all") data = data.filter((b) => String(b.status_id) === String(status));
    if (startDate) data = data.filter((b) => new Date(b.date) >= new Date(startDate));
    if (endDate) data = data.filter((b) => new Date(b.date) <= new Date(endDate));
    setFiltered(data);
    setPage(1); // Reset page when filtering
  }, [search, status, startDate, endDate, bookings]);

  // 📊 ส่งออก Excel
  const exportToExcel = () => {
    const data = filtered.map(b => ({
      "ID": b.booking_id,
      "วันที่": new Date(b.date).toLocaleDateString("th-TH"),
      "เวลา": b.time,
      "ลูกค้า": b.owner_name,
      "ทะเบียนระ": b.license_plate,
      "รุ่น": b.model,
      "รายละเอียด": b.description,
      "สถานะ": getStatus(b.status_id).text,
      "ค่าอะไหล่": b.parts_total,
      "ค่าบริการ": b.service,
      "ค่าส่ง": b.freight,
      "รวมสุทธิ": b.total_price
    }));
    const worksheet = XLSX.utils.json_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Bookings");
    XLSX.writeFile(workbook, `bookings_export_${new Date().getTime()}.xlsx`);
  };

  // 📄 ส่งออก CSV
  const exportToCSV = () => {
    try {
      const fields = [
        "booking_id", "date", "time", "owner_name", "license_plate", "model",
        "description", "status_id", "parts_total", "service", "freight", "total_price"
      ];
      const headers = ["ID", "วันที่", "เวลา", "ลูกค้า", "ทะเบียน", "รุ่น", "รายละเอียด", "สถานะ", "ค่าอะไหล่", "ค่าบริการ", "ค่าส่ง", "รวมสุทธิ"];

      const csvRows = [];
      csvRows.push(headers.join(","));

      for (const row of filtered) {
        const values = fields.map(field => {
          let val = row[field];
          if (field === "status_id") val = getStatus(row.status_id).text;
          if (val === null || val === undefined) val = "";
          const stringVal = String(val).replace(/"/g, '""');
          return `"${stringVal}"`;
        });
        csvRows.push(values.join(","));
      }

      const csvString = csvRows.join("\n");
      const blob = new Blob(["\uFEFF" + csvString], { type: "text/csv;charset=utf-8;" });
      const link = document.createElement("a");
      link.href = URL.createObjectURL(blob);
      link.setAttribute("download", `bookings_export_${new Date().getTime()}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error(err);
      Swal.fire("❌", "ส่งออก CSV ไม่สำเร็จ", "error");
    }
  };

  if (loading) return <div className="loading">⏳ กำลังโหลด...</div>;

  const startIndex = (page - 1) * rowsPerPage;
  const currentRows = filtered.slice(startIndex, startIndex + rowsPerPage);

  return (
    <div className="user-page">
      <h2 className="user-title">🧰 ระบบจัดการงานซ่อม (Admin)</h2>

      <div className="filter-bar">
        <input
          type="text"
          placeholder="ค้นหา (ชื่อ / ทะเบียน / รุ่น)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select value={status} onChange={(e) => setStatus(e.target.value)}>
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
        <div className="export-btns" style={{ display: "flex", gap: "8px" }}>
          <button className="btn btn-detail" onClick={exportToExcel} style={{ background: "#10b981" }}>📗 Excel</button>
          <button className="btn btn-detail" onClick={exportToCSV} style={{ background: "#6b7280" }}>📄 CSV</button>
        </div>
      </div>

      <table className="user-table">
        <thead>
          <tr>
            <th>#</th><th>วันที่</th><th>เวลา</th><th>เจ้าของรถ</th>
            <th>รถ</th><th>รายละเอียด</th><th>สถานะ</th><th>จัดการ</th>
          </tr>
        </thead>
        <tbody>
          {currentRows.map((b) => {
            const s = getStatus(b.status_id);
            return (
              <tr key={b.booking_id}>
                <td>{b.booking_id}</td>
                <td>{new Date(b.date).toLocaleDateString("th-TH")}</td>
                <td>{b.time}</td>
                <td>{b.owner_name}</td>
                <td>{b.license_plate} ({b.model})</td>
                <td>{b.description || "-"}</td>
                <td><span className={`status-badge ${s.class}`}>{s.text}</span></td>
                <td><button className="btn btn-detail" onClick={() => openDetail(b)}>🧾 จัดการ</button></td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {/* 🪄 Popup ใหม่แบบ UX/UI สวย */}
      {selected && (
        <div className="popup-overlay">
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <header className="popup-header">
              <h3>🧾 งานซ่อม #{selected.booking_id}</h3>
              <button className="btn-close" onClick={closePopup}>✖</button>
            </header>

            <div className="popup-body-grid">
              <section className="popup-section info">
              <h4>🔧 ข้อมูลทั่วไป</h4>
              <div className="info-grid">
                <div><b>ลูกค้า:</b> {selected.owner_name}</div>
                <div><b>รถ:</b> {selected.model} ({selected.license_plate})</div>
                <div><b>สถานะ:</b> <span className={`status-badge ${getStatus(selected.status_id).class}`}>{getStatus(selected.status_id).text}</span></div>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px", marginTop: "16px" }}>
                <div className="status-select">
                  <label>เปลี่ยนสถานะ:</label>
                  <select
                    value={selected.status_id}
                    onChange={(e) => updateStatus(e.target.value)}
                  >
                    <option value="1">⏳ รอช่าง</option>
                    <option value="2">🔧 กำลังซ่อม</option>
                    <option value="5">💰 รอชำระ</option>
                    <option value="3">✅ เสร็จแล้ว</option>
                    <option value="4">❌ ยกเลิก</option>
                  </select>
                </div>
                <div className="status-select">
                  <label>ช่างผู้ดูแล:</label>
                  <select
                    value={selected.technician_id || ""}
                    onChange={(e) => updateTechnician(e.target.value)}
                  >
                    <option value="">-- ยังไม่ได้มอบหมาย --</option>
                    {staff.map(s => (
                      <option key={s.user_id} value={s.user_id}>{s.name}</option>
                    ))}
                  </select>
                </div>
              </div>
              </section>

              <section className="popup-section parts">
              <h4>🧩 รายการอะไหล่</h4>
              <table className="small-table">
                <thead>
                  <tr><th>ชื่ออะไหล่</th><th>จำนวน</th><th>ราคา/หน่วย</th><th>รวม</th><th></th></tr>
                </thead>
                <tbody>
                  {repairItems.length > 0 ? (
                    repairItems.map((i) => (
                      <tr key={i.part_id}>
                        <td>{i.partname}</td>
                        <td>{i.quantity}</td>
                        <td>{Number(i.unit_price).toLocaleString()} ฿</td>
                        <td>{(i.unit_price * i.quantity).toLocaleString()} ฿</td>
                        <td>{selected.status_id === 2 && <button className="btn-delete" onClick={() => deleteItem(i.part_id)}>🗑️</button>}</td>
                      </tr>
                    ))
                  ) : (
                    <tr><td colSpan="5">ไม่มีข้อมูลอะไหล่</td></tr>
                  )}
                </tbody>
              </table>

              {selected.status_id === 2 && (
                <form className="add-form" onSubmit={addRepairItem}>
                  <input
                    list="parts-list"
                    name="part_id"
                    placeholder="พิมพ์ชื่ออะไหล่หรือรหัส..."
                    required
                  />
                  <datalist id="parts-list">
                    {parts.map((p) => (
                      <option key={p.part_id} value={p.part_id}>
                        {p.name} ({p.marque}) — {p.unit_price}฿ [คงเหลือ: {p.quantity}]
                      </option>
                    ))}
                  </datalist>

                  <input
                    type="number"
                    name="quantity"
                    min="1"
                    placeholder="จำนวน"
                    required
                  />
                  <button className="btn btn-add">➕ เพิ่ม</button>
                </form>

              )}
              </section>

              <section className="popup-section cost">
              <h4>💰 ค่าใช้จ่าย</h4>
                <form onSubmit={updateCost} className="cost-form">
                  {selected.transport_required && (
                    <div className="input-currency">
                      <input
                        type="number"
                        name="freight"
                        placeholder="ค่าขนส่ง"
                        defaultValue={selected.freight || 0}
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        aria-label="ค่าขนส่ง"
                      />
                      <span className="currency">฿</span>
                    </div>
                  )}

                  <div className="input-currency">
                    <input
                      type="number"
                      name="service"
                      placeholder="ค่าบริการ"
                      defaultValue={selected.service || 0}
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      aria-label="ค่าบริการ"
                    />
                    <span className="currency">฿</span>
                  </div>

                  <button className="btn btn-save">💾 บันทึก</button>
                </form>

              <div className="total-summary">
                <p>ค่าอะไหล่: {repairItems.reduce((sum, i) => sum + i.quantity * i.unit_price, 0).toLocaleString()} ฿</p>
                <p>ค่าขนส่ง: {Number(selected.freight || 0).toLocaleString()} ฿</p>
                <p>ค่าบริการ: {Number(selected.service || 0).toLocaleString()} ฿</p>
                <hr />
                <h4>รวมทั้งหมด: <b>{(
                  repairItems.reduce((sum, i) => sum + i.quantity * i.unit_price, 0)
                  + Number(selected.freight || 0)
                  + Number(selected.service || 0)
                ).toLocaleString()} ฿</b></h4>
              </div>
            </section>

              {/* ✅ แสดงสลิปโอนเงิน */}
              {selected.slipfilename && (
                <section className="popup-section slip" style={{ textAlign: "center", marginTop: "16px" }}>
                  <h4>📸 หลักฐานการโอนเงิน</h4>
                  <div className="slip-preview">
                    <img
                      src={`http://localhost:3000/uploads/${selected.slipfilename}`}
                      alt="Slip Payment"
                      style={{ maxWidth: "100%", maxHeight: "300px", borderRadius: "8px", cursor: "pointer", border: "1px solid #ddd" }}
                      onClick={() => window.open(`http://localhost:3000/uploads/${selected.slipfilename}`, "_blank")}
                    />
                    <p style={{ fontSize: "12px", color: "gray", marginTop: "4px" }}>คลิกที่รูปเพื่อดูภาพขนาดใหญ่</p>
                  </div>
                </section>
              )}

            </div>

            <footer className="popup-actions">
              <button className="btn btn-print" onClick={printPDF}>🖨️ พิมพ์ใบซ่อม</button>
              <button className="btn btn-secondary" onClick={closePopup}>ปิด</button>
            </footer>
          </div>
        </div >
      )
      }
    </div >
  );
}
