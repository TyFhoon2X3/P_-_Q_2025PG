import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../styles/PartsManager.css";

const API_URL = "http://localhost:3000/api/parts";

const getAuthHeader = () => {
  const token = localStorage.getItem("token");
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

function PartsManager() {
  const [parts, setParts] = useState([]);
  const [filteredParts, setFilteredParts] = useState([]);
  const [form, setForm] = useState({
    name: "",
    marque: "",
    quantity: "",
    unit_price: "",
  });
  const [editingId, setEditingId] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");

  // pagination
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // ✅ โหลดข้อมูลเมื่อเปิดหน้า
  useEffect(() => {
    fetchParts();
  }, []);

  // ✅ ดึงข้อมูลอะไหล่ทั้งหมด
  const fetchParts = async () => {
    try {
      const res = await axios.get(API_URL, getAuthHeader());
      const data = res.data.parts || [];
      setParts(data);
      setFilteredParts(data);
    } catch (err) {
      console.error("Error loading parts:", err);
      Swal.fire("❌", "โหลดข้อมูลอะไหล่ไม่สำเร็จ", "error");
    }
  };

  // ✅ ฟังก์ชันค้นหา
  const handleSearch = (e) => {
    const value = e.target.value.toLowerCase();
    setSearchTerm(value);
    const filtered = parts.filter(
      (part) =>
        part.name.toLowerCase().includes(value) ||
        part.marque.toLowerCase().includes(value) ||
        part.part_id.toLowerCase().includes(value)
    );
    setFilteredParts(filtered);
    setCurrentPage(1); // รีเซ็ตไปหน้าแรก
  };

  // ✅ อัปเดตค่าฟอร์มเมื่อพิมพ์
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // ✅ บันทึก (เพิ่ม / แก้ไข)
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.name || !form.marque || !form.quantity || !form.unit_price)
      return Swal.fire("⚠️", "กรุณากรอกข้อมูลให้ครบ", "info");

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form, getAuthHeader());
        Swal.fire("✅", "อัปเดตข้อมูลสำเร็จ", "success");
      } else {
        await axios.post(API_URL, form, getAuthHeader());
        Swal.fire("✅", "เพิ่มอะไหล่สำเร็จ", "success");
      }

      setForm({ name: "", marque: "", quantity: "", unit_price: "" });
      setEditingId(null);
      fetchParts();
    } catch (err) {
      console.error("Save error:", err);
      Swal.fire("❌", "ไม่สามารถบันทึกข้อมูลได้", "error");
    }
  };

  // ✅ ดึงข้อมูลมาแก้ไข
  const handleEdit = (part) => {
    setForm({
      name: part.name,
      marque: part.marque,
      quantity: part.quantity,
      unit_price: part.unit_price,
    });
    setEditingId(part.part_id);
  };

  // ✅ ลบอะไหล่
  const handleDelete = async (id) => {
    const result = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการลบอะไหล่นี้จริง ๆ ใช่ไหม?",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#e74c3c",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
    });

    if (!result.isConfirmed) return;

    try {
      await axios.delete(`${API_URL}/${id}`, getAuthHeader());
      await fetchParts();
      Swal.fire("✅", "ลบอะไหล่เรียบร้อยแล้ว", "success");
    } catch (err) {
      console.error("Delete error:", err);
      Swal.fire("❌", "ไม่สามารถลบได้", "error");
    }
  };

  // ✅ ยกเลิกการแก้ไข
  const resetForm = () => {
    setForm({ name: "", marque: "", quantity: "", unit_price: "" });
    setEditingId(null);
  };

  // ✅ Pagination logic
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = filteredParts.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(filteredParts.length / itemsPerPage);

  return (
    <div className="parts-container">
      <h2>🚗 จัดการอะไหล่</h2>

      {/* 🔍 ช่องค้นหา */}
      <div className="search-box">
        <input
          type="text"
          placeholder="🔍 ค้นหาชื่ออะไหล่ / ยี่ห้อ / รหัส..."
          value={searchTerm}
          onChange={handleSearch}
        />
      </div>

      {/* ฟอร์มเพิ่ม / แก้ไข */}
      <form onSubmit={handleSubmit} className="parts-form">
        <input
          name="name"
          placeholder="ชื่ออะไหล่"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          name="marque"
          placeholder="ยี่ห้อ"
          value={form.marque}
          onChange={handleChange}
          required
        />
        <input
          name="quantity"
          type="number"
          placeholder="จำนวน"
          value={form.quantity}
          onChange={handleChange}
          required
        />
        <input
          name="unit_price"
          type="number"
          step="0.01"
          placeholder="ราคาต่อหน่วย (บาท)"
          value={form.unit_price}
          onChange={handleChange}
          required
        />

        <button type="submit" className="btn-save">
          {editingId ? "💾 บันทึกการแก้ไข" : "➕ เพิ่มอะไหล่"}
        </button>

        {editingId && (
          <button type="button" className="btn-cancel" onClick={resetForm}>
            ❌ ยกเลิก
          </button>
        )}
      </form>

      {/* ตารางแสดงอะไหล่ */}
      <table className="parts-table">
        <thead>
          <tr>
            <th>รหัส</th>
            <th>ชื่ออะไหล่</th>
            <th>ยี่ห้อ</th>
            <th>จำนวน</th>
            <th>ราคาต่อหน่วย</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {currentItems.length > 0 ? (
            currentItems.map((part) => (
              <tr key={part.part_id}>
                <td>{part.part_id}</td>
                <td>{part.name}</td>
                <td>{part.marque}</td>
                <td>{part.quantity}</td>
                <td>{Number(part.unit_price).toLocaleString()} ฿</td>
                <td>
                  <button className="edit-btn" onClick={() => handleEdit(part)}>
                    ✏️ แก้ไข
                  </button>
                  <button
                    className="delete-btn"
                    onClick={() => handleDelete(part.part_id)}
                  >
                    🗑️ ลบ
                  </button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="6" style={{ textAlign: "center", padding: "12px" }}>
                ไม่มีข้อมูลอะไหล่
              </td>
            </tr>
          )}
        </tbody>
      </table>

      {/* 🔢 Pagination buttons */}
      <div className="pagination">
        <button
          onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
          disabled={currentPage === 1}
        >
          ⬅️ ก่อนหน้า
        </button>

        {Array.from({ length: totalPages }, (_, index) => (
          <button
            key={index + 1}
            className={currentPage === index + 1 ? "active-page" : ""}
            onClick={() => setCurrentPage(index + 1)}
          >
            {index + 1}
          </button>
        ))}

        <button
          onClick={() =>
            setCurrentPage((prev) => Math.min(prev + 1, totalPages))
          }
          disabled={currentPage === totalPages || totalPages === 0}
        >
          ถัดไป ➡️
        </button>
      </div>
    </div>
  );
}

export default PartsManager;
