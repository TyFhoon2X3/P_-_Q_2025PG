import React, { useEffect, useState } from "react";
import axios from "axios";
import "../styles/PartsManager.css";

const API_URL = "http://localhost:3000/api/parts"; // เปลี่ยนตาม API คุณ

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
      const res = await axios.get(API_URL);
      setParts(res.data.parts);
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
        await axios.put(`${API_URL}/${editingId}`, form);
      } else {
        await axios.post(API_URL, form);
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
    if (window.confirm("แน่ใจว่าจะลบอะไหล่นี้?")) {
      try {
        await axios.delete(`${API_URL}/${id}`);
        fetchParts();
      } catch (err) {
        console.error("Delete error:", err);
      }
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
                <button className="edit-btn" onClick={() => handleEdit(part)}>แก้ไข</button>
                <button className="delete-btn" onClick={() => handleDelete(part.part_id)}>ลบ</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PartsManager;
