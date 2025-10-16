import { useEffect, useState } from "react";
import { api } from "../api";
import Swal from "sweetalert2";
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

  const fetchBookings = async () => {
    try {
      const data = await api("/api/bookings");
      if (data.success) {
        setBookings(data.bookings);
        setFiltered(data.bookings);
      }
    } catch {
      Swal.fire("❌", "โหลดข้อมูลไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  };

  // ดึงรายการอะไหล่ทั้งหมดของ booking
  const fetchRepairItems = async (booking_id) => {
    try {
      const res = await api(`/api/repair-items/${booking_id}`);
      if (res.success) setRepairItems(res.items);
    } catch {
      setRepairItems([]);
    }
  };

  // ดึงรายการอะไหล่ในคลัง
  const fetchParts = async () => {
    try {
      const res = await api("/api/parts");
      if (res.success) setParts(res.parts);
    } catch {
      setParts([]);
    }
  };

  // เปิด popup พร้อมโหลดข้อมูลอะไหล่
  const openDetail = async (b) => {
    setSelected(b);
    await Promise.all([fetchRepairItems(b.booking_id), fetchParts()]);
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

  // เพิ่มอะไหล่ใหม่
  const addRepairItem = async (e) => {
    e.preventDefault();
    const form = e.target;
    const part_id = form.part_id.value;
    const qty = Number(form.quantity.value);

    if (!part_id || !qty) return;

    const part = parts.find((p) => p.part_id === part_id);
    if (!part) return Swal.fire("⚠️", "ไม่พบข้อมูลอะไหล่", "warning");

    const res = await api("/api/repair-items", {
      method: "POST",
      body: JSON.stringify({
        booking_id: selected.booking_id,
        part_id,
        quantity: qty,
        unit_price: part.unit_price,
      }),
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
    const res = await api(
      `/api/repair-items/${selected.booking_id}/${part_id}`,
      { method: "DELETE" }
    );
    if (res.success) {
      Swal.fire("🗑️", "ลบอุปกรณ์สำเร็จ", "success");
      fetchRepairItems(selected.booking_id);
    } else {
      Swal.fire("❌", res.message, "error");
    }
  };

  // ฟิลเตอร์
  useEffect(() => {
    let data = bookings;

    if (search) {
      data = data.filter(
        (b) =>
          b.license_plate?.toLowerCase().includes(search.toLowerCase()) ||
          b.model?.toLowerCase().includes(search.toLowerCase()) ||
          b.owner_name?.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status !== "all") {
      data = data.filter((b) => String(b.status_id) === String(status));
    }

    setFiltered(data);
  }, [search, status, bookings]);

  if (loading) return <div className="loading">⏳ กำลังโหลด...</div>;

  return (
    <div className="user-page">
      <h2 className="user-title">🧰 ระบบจัดการงานซ่อม (Admin)</h2>

      {/* 🔍 Filter bar */}
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
        <button className="btn btn-primary" onClick={fetchBookings}>
          🔄 รีเฟรช
        </button>
      </div>

      {/* 🧾 ตาราง */}
      <table className="user-table">
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
          {filtered.length === 0 ? (
            <tr>
              <td colSpan="8" style={{ textAlign: "center", padding: "20px" }}>
                ไม่พบข้อมูล
              </td>
            </tr>
          ) : (
            filtered.map((b) => {
              const s = getStatus(b.status_id);
              return (
                <tr key={b.booking_id}>
                  <td>{b.booking_id}</td>
                  <td>{new Date(b.date).toLocaleDateString("th-TH")}</td>
                  <td>{b.time}</td>
                  <td>{b.owner_name}</td>
                  <td>
                    {b.license_plate} ({b.model})
                  </td>
                  <td>{b.description || "-"}</td>
                  <td>
                    <span className={`status-badge ${s.class}`}>{s.text}</span>
                  </td>
                  <td>
                    <button
                      className="btn btn-detail"
                      onClick={() => openDetail(b)}
                    >
                      🧾 รายละเอียด
                    </button>
                  </td>
                </tr>
              );
            })
          )}
        </tbody>
      </table>

      {/* 🪟 Popup */}
      {selected && (
        <div className="popup-overlay" onClick={() => setSelected(null)}>
          <div className="popup-card" onClick={(e) => e.stopPropagation()}>
            <h3 className="popup-title">🧾 งานซ่อม #{selected.booking_id}</h3>
            <div className="info-grid">
              <p><b>รถ:</b> {selected.model} ({selected.license_plate})</p>
              <p><b>เจ้าของ:</b> {selected.owner_name}</p>
              <p><b>วันที่:</b> {new Date(selected.date).toLocaleDateString("th-TH")}</p>
              <p><b>เวลา:</b> {selected.time}</p>
              <p><b>สถานะ:</b> {getStatus(selected.status_id).text}</p>
              <p><b>รายละเอียด:</b> {selected.description || "-"}</p>
            </div>

            {/* 🔧 ตารางอะไหล่ */}
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
                {repairItems.length === 0 ? (
                  <tr><td colSpan="5" style={{ textAlign: "center" }}>ไม่มีข้อมูล</td></tr>
                ) : (
                  repairItems.map((i) => (
                    <tr key={i.part_id}>
                      <td>{i.partname}</td>
                      <td>{i.quantity}</td>
                      <td>{Number(i.unit_price).toLocaleString()} ฿</td>
                      <td>{(i.unit_price * i.quantity).toLocaleString()} ฿</td>
                      <td>
                        {selected.status_id === 2 && (
                          <button className="btn btn-cancel" onClick={() => deleteItem(i.part_id)}>🗑</button>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>

            {/* ➕ เพิ่มอะไหล่ใหม่ */}
            {selected.status_id === 2 && (
              <form className="add-form" onSubmit={addRepairItem}>
                <h4>➕ เพิ่มอะไหล่</h4>
                <div className="add-row">
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
                </div>
              </form>
            )}

            <div className="popup-actions">
              <button className="btn btn-secondary" onClick={() => setSelected(null)}>
                ปิด
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
