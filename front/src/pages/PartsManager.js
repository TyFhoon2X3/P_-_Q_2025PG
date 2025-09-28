import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/PartsManager.css";
import Swal from "sweetalert2";
const API_URL = "http://localhost:3000/api/parts"; // ✅ backend port ปกติจะไม่ใช่ 3000

// helper: ดึง token จาก localStorage
const getAuthHeader = () => {
  const token = localStorage.getItem("token"); // หลังจาก login แล้วต้องเซฟ token
  return {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  };
};

function PartsManager() {
  const [parts, setParts] = useState([]);
  const [form, setForm] = useState({
    part_id: "",
    name: "",
    marque: "",
    quantity: "",
    unit_price: "",
  });
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    fetchParts();
  }, []);

  const fetchParts = async () => {
    try {
      const res = await axios.get(API_URL, getAuthHeader());
      console.log("API response:", res.data);
      setParts(res.data.parts); // ✅ ตรงกับโครงสร้าง API
    } catch (err) {
      console.error("Error loading parts:", err);
    }
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, form, getAuthHeader());
      } else {
        await axios.post(API_URL, form, getAuthHeader());
      }
      setForm({
        part_id: "",
        name: "",
        marque: "",
        quantity: "",
        unit_price: "",
      });
      setEditingId(null);
      fetchParts();
    } catch (err) {
      console.error("Save error:", err);
    }
  };

  const handleEdit = (part) => {
    setForm(part);
    setEditingId(part.part_id);
  };

 const handleDelete = async (id) => {
  const result = await Swal.fire({
    title: "คุณแน่ใจหรือไม่?",
    text: "คุณต้องการลบอะไหล่นี้จริง ๆ ใช่หรือไม่",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "ใช่, ลบเลย",
    cancelButtonText: "ยกเลิก",
  });

  if (!result.isConfirmed) return;

  try {
    await axios.delete(`${API_URL}/${id}`, getAuthHeader());
    await fetchParts();

    Swal.fire({
      title: "ลบสำเร็จ!",
      text: "อะไหล่ถูกลบเรียบร้อยแล้ว",
      icon: "success",
      timer: 2000,
      showConfirmButton: false,
    });
  } catch (err) {
    console.error("Delete error:", err);
    Swal.fire({
      title: "ผิดพลาด",
      text: "ไม่สามารถลบอะไหล่ได้",
      icon: "error",
    });
  }
};

  return (
    <div className="parts-container">
      <h2>🚗 จัดการอะไหล่</h2>

      <form onSubmit={handleSubmit} className="parts-form">
        <input
          name="part_id"
          placeholder="Part ID"
          value={form.part_id}
          onChange={handleChange}
          required
          disabled={editingId !== null}
        />
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
          placeholder="ราคาต่อหน่วย"
          value={form.unit_price}
          onChange={handleChange}
          required
        />
        <button type="submit">{editingId ? "อัปเดต" : "เพิ่ม"}</button>
        {editingId && (
          <button
            type="button"
            className="cancel-btn"
            onClick={() => {
              setForm({
                part_id: "",
                name: "",
                marque: "",
                quantity: "",
                unit_price: "",
              });
              setEditingId(null);
            }}
          >
            ยกเลิก
          </button>
        )}
      </form>

      <table className="parts-table">
        <thead>
          <tr>
            <th>Part ID</th>
            <th>ชื่อ</th>
            <th>ยี่ห้อ</th>
            <th>จำนวน</th>
            <th>ราคาต่อหน่วย</th>
            <th>การจัดการ</th>
          </tr>
        </thead>
        <tbody>
          {parts.map((part) => (
            <tr key={part.part_id}>
              <td>{part.part_id}</td>
              <td>{part.name}</td>
              <td>{part.marque}</td>
              <td>{part.quantity}</td>
              <td>{part.unit_price}</td>
              <td>
                <button className="edit-btn" onClick={() => handleEdit(part)}>
                  แก้ไข
                </button>
                <button
                  className="delete-btn"
                  onClick={() => handleDelete(part.part_id)}
                >
                  ลบ
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PartsManager;
