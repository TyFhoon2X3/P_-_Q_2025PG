import { useEffect, useState } from "react";
import { api } from "../api";
import Swal from "sweetalert2";
import jsPDF from "jspdf";
import "jspdf-autotable";
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

  useEffect(() => {
    fetchBookings();
  }, []);

  // โหลดข้อมูลทั้งหมด
  const fetchBookings = async () => {
    try {
      const res = await api("/api/bookings");
      if (res.success) {
        setBookings(res.bookings);
        setFiltered(res.bookings);
      }
    } catch {
      Swal.fire("❌", "โหลดข้อมูลไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  };

  const fetchRepairItems = async (id) => {
    try {
      const res = await api(`/api/repair-items/${id}`);
      if (res.success) setRepairItems(res.items);
    } catch {
      setRepairItems([]);
    }
  };

  const fetchParts = async () => {
    try {
      const res = await api("/api/parts");
      if (res.success) setParts(res.parts);
    } catch {
      setParts([]);
    }
  };

  const getStatus = (id) => {
    switch (id) {
      case 1: return { text: "⏳ รอช่าง", class: "pending" };
      case 2: return { text: "🔧 กำลังซ่อม", class: "progress" };
      case 5: return { text: "💰 รอชำระเงิน", class: "waiting" };
      case 3: return { text: "✅ เสร็จแล้ว", class: "done" };
      case 4: return { text: "❌ ยกเลิก", class: "cancel" };
      default: return { text: "-", class: "" };
    }
  };

  // เปิด popup
  const openDetail = async (b) => {
    setSelected(b);
    await Promise.all([fetchRepairItems(b.booking_id), fetchParts()]);
  };

  const closePopup = () => {
    setSelected(null);
    setRepairItems([]);
  };

  // เปลี่ยนสถานะงาน
  const updateStatus = async (e) => {
    const newStatus = Number(e.target.value);
    try {
      const res = await api(`/api/bookings/${selected.booking_id}`, {
        method: "PUT",
        body: { status_id: newStatus },
      });
      if (res.success) {
        Swal.fire("✅", "อัปเดตสถานะสำเร็จ", "success");
        fetchBookings();
        setSelected({ ...selected, status_id: newStatus });
      }
    } catch {
      Swal.fire("❌", "อัปเดตสถานะไม่สำเร็จ", "error");
    }
  };

  // เพิ่มอะไหล่
  const addRepairItem = async (e) => {
    e.preventDefault();
    const form = e.target;
    const part_id = form.part_id.value;
    const qty = Number(form.quantity.value);

    const part = parts.find((p) => p.part_id === part_id);
    if (!part) return Swal.fire("⚠️", "ไม่พบอะไหล่", "warning");

    const res = await api("/api/repair-items", {
      method: "POST",
      body: {
        booking_id: selected.booking_id,
        part_id,
        quantity: qty,
        unit_price: part.unit_price,
      },
    });

    if (res.success) {
      Swal.fire("✅", "เพิ่มอะไหล่สำเร็จ", "success");
      fetchRepairItems(selected.booking_id);
      form.reset();
    } else {
      Swal.fire("❌", res.message || "เพิ่มไม่สำเร็จ", "error");
    }
  };

  // ลบอะไหล่
  const deleteItem = async (part_id) => {
    const res = await api(`/api/repair-items/${selected.booking_id}/${part_id}`, { method: "DELETE" });
    if (res.success) {
      Swal.fire("🗑️", "ลบอุปกรณ์สำเร็จ", "success");
      fetchRepairItems(selected.booking_id);
    } else {
      Swal.fire("❌", res.message, "error");
    }
  };

  // อัปเดตค่าแรง/ค่าส่งรถ
  const updateCost = async () => {
    try {
      const res = await api(`/api/bookings/${selected.booking_id}`, {
        method: "PUT",
        body: {
          service: Number(selected.service || 0),
          freight: selected.transport_required ? Number(selected.freight || 0) : 0,
        },
      });
      if (res.success) {
        Swal.fire("✅", "อัปเดตค่าใช้จ่ายสำเร็จ", "success");
        fetchBookings();
      }
    } catch {
      Swal.fire("❌", "ไม่สามารถบันทึกได้", "error");
    }
  };

  // พิมพ์ PDF
  const printPDF = () => {
    const doc = new jsPDF();
    doc.setFont("Sarabun-Regular");
    doc.text("ใบสรุปรายการซ่อมรถ", 14, 15);
    doc.text(`รหัสงาน: ${selected.booking_id}`, 14, 25);
    doc.text(`เจ้าของรถ: ${selected.owner_name}`, 14, 32);
    doc.text(`รถ: ${selected.model} (${selected.license_plate})`, 14, 39);

    const rows = repairItems.map((i, idx) => [
      idx + 1,
      i.partname,
      i.quantity,
      `${i.unit_price.toLocaleString()} ฿`,
      `${(i.unit_price * i.quantity).toLocaleString()} ฿`,
    ]);

    doc.autoTable({
      head: [["#", "ชื่ออะไหล่", "จำนวน", "ราคา/หน่วย", "รวม"]],
      body: rows,
      startY: 50,
    });

    const total = repairItems.reduce((sum, i) => sum + i.unit_price * i.quantity, 0);
    const service = Number(selected.service || 0);
    const freight = selected.transport_required ? Number(selected.freight || 0) : 0;
    const totalAll = total + service + freight;

    let y = doc.lastAutoTable.finalY + 10;
    doc.text(`ค่าอะไหล่: ${total.toLocaleString()} ฿`, 14, y);
    y += 6;
    doc.text(`ค่าแรง: ${service.toLocaleString()} ฿`, 14, y);
    y += 6;
    if (selected.transport_required) {
      doc.text(`ค่าส่งรถ: ${freight.toLocaleString()} ฿`, 14, y);
      y += 6;
    }
    doc.text(`รวมทั้งหมด: ${totalAll.toLocaleString()} ฿`, 14, y + 5);

    doc.save(`Repair_${selected.booking_id}.pdf`);
  };

  // ฟิลเตอร์
  useEffect(() => {
    let data = bookings;
    if (search)
      data = data.filter(
        (b) =>
          b.license_plate?.toLowerCase().includes(search.toLowerCase()) ||
          b.model?.toLowerCase().includes(search.toLowerCase()) ||
          b.owner_name?.toLowerCase().includes(search.toLowerCase())
      );
    if (status !== "all")
      data = data.filter((b) => String(b.status_id) === String(status));
    setFiltered(data);
  }, [search, status, bookings]);

  if (loading) return <div className="loading">⏳ กำลังโหลด...</div>;

  const totalParts = repairItems.reduce(
    (sum, i) => sum + Number(i.unit_price) * Number(i.quantity),
    0
  );

  const service = Number(selected?.service || 0);
  const freight = selected?.transport_required ? Number(selected?.freight || 0) : 0;
  const totalAll = totalParts + service + freight;

  return (
    <div className="page-container">
      <h2 className="page-title">🧰 ระบบจัดการงานซ่อม (Admin)</h2>

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
          <option value="5">รอชำระเงิน</option>
          <option value="3">เสร็จแล้ว</option>
          <option value="4">ยกเลิก</option>
        </select>
      </div>

      <table className="table">
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
                <td>{b.owner_name}</td>
                <td>{b.license_plate} ({b.model})</td>
                <td>{b.description || "-"}</td>
                <td><span className={`badge ${s.class}`}>{s.text}</span></td>
                <td>
                  <button className="btn btn-detail" onClick={() => openDetail(b)}>🧾 รายละเอียด</button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>

      {selected && (
        <div className="popup-overlay">
          <div className="popup-card">
            <h3>🧾 งานซ่อม #{selected.booking_id}</h3>
            <div className="info-grid">
              <p><b>🚗 รถ:</b> {selected.model} ({selected.license_plate})</p>
              <p><b>👤 เจ้าของ:</b> {selected.owner_name}</p>
              <p><b>📅 วันที่:</b> {new Date(selected.date).toLocaleDateString("th-TH")}</p>
              <p><b>🕓 เวลา:</b> {selected.time}</p>
              <p><b>💬 รายละเอียด:</b> {selected.description || "-"}</p>
            </div>

            <div className="status-change">
              <label>สถานะ: </label>
              <select value={selected.status_id} onChange={updateStatus}>
                <option value={1}>⏳ รอช่าง</option>
                <option value={2}>🔧 กำลังซ่อม</option>
                <option value={5}>💰 รอชำระเงิน</option>
                <option value={3}>✅ เสร็จแล้ว</option>
                <option value={4}>❌ ยกเลิก</option>
              </select>
            </div>

            <h4>🔩 รายการอะไหล่</h4>
            <table className="small-table">
              <thead>
                <tr>
                  <th>ชื่ออุปกรณ์</th>
                  <th>จำนวน</th>
                  <th>ราคา/หน่วย</th>
                  <th>รวม</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {repairItems.map((i) => (
                  <tr key={i.part_id}>
                    <td>{i.partname}</td>
                    <td>{i.quantity}</td>
                    <td>{Number(i.unit_price).toLocaleString()} ฿</td>
                    <td>{(i.unit_price * i.quantity).toLocaleString()} ฿</td>
                    <td><button className="btn btn-cancel" onClick={() => deleteItem(i.part_id)}>🗑️</button></td>
                  </tr>
                ))}
              </tbody>
            </table>

            <form className="add-form" onSubmit={addRepairItem}>
              <select name="part_id" required>
                <option value="">เลือกอะไหล่</option>
                {parts.map((p) => (
                  <option key={p.part_id} value={p.part_id}>
                    {p.name} ({p.marque}) — {p.unit_price}฿
                  </option>
                ))}
              </select>
              <input type="number" name="quantity" min="1" placeholder="จำนวน" required />
              <button className="btn btn-primary">เพิ่ม</button>
            </form>

            <div className="cost-edit">
              <label>🧰 ค่าแรง: </label>
              <input type="number" value={selected.service || 0} onChange={(e) => setSelected({ ...selected, service: e.target.value })} />
              {selected.transport_required && (
                <>
                  <label>🚗 ค่าส่งรถ: </label>
                  <input type="number" value={selected.freight || 0} onChange={(e) => setSelected({ ...selected, freight: e.target.value })} />
                </>
              )}
              <button className="btn btn-primary" onClick={updateCost}>💾 บันทึก</button>
            </div>

            <div className="total-section">
              <p>อะไหล่: {totalParts.toLocaleString()} ฿</p>
              <p>ค่าแรง: {service.toLocaleString()} ฿</p>
              {selected.transport_required && <p>ค่าส่ง: {freight.toLocaleString()} ฿</p>}
              <hr />
              <b>รวมทั้งหมด: {totalAll.toLocaleString()} ฿</b>
            </div>

            <button className="btn btn-print" onClick={printPDF}>🖨️ พิมพ์ใบซ่อม</button>
            <button className="btn btn-secondary" onClick={closePopup}>ปิด</button>
          </div>
        </div>
      )}
    </div>
  );
}
