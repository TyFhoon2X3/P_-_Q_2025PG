// src/pages/AdminVehicleTypes.jsx
import React, { useState, useEffect } from "react";
import axios from "axios";

const API_URL = "http://localhost:3000/api/typecar";

const TypeCarForm = ({ editingType, onSave, onCancel }) => {
  const [typeName, setTypeName] = useState("");

  useEffect(() => {
    if (editingType) setTypeName(editingType.type_name);
    else setTypeName("");
  }, [editingType]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!typeName.trim()) return;
    onSave(typeName.trim());
    setTypeName("");
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginBottom: "1rem" }}>
      <input
        type="text"
        value={typeName}
        onChange={(e) => setTypeName(e.target.value)}
        placeholder="ชื่อประเภทของรถ"
        required
        style={{ padding: "0.3rem", marginRight: "0.5rem" }}
      />
      <button type="submit">{editingType ? "อัปเดต" : "เพิ่ม"}</button>
      {editingType && (
        <button
          type="button"
          onClick={onCancel}
          style={{ marginLeft: "0.5rem" }}
        >
          ยกเลิก
        </button>
      )}
    </form>
  );
};

const AdminVehicleTypes = () => {
  const [types, setTypes] = useState([]);
  const [editingType, setEditingType] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchTypes = async () => {
    setLoading(true);
    try {
      const res = await axios.get(API_URL);
      setTypes(res.data.typecar);
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการโหลดข้อมูล");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTypes();
  }, []);

  const handleSave = async (typeName) => {
    try {
      if (editingType) {
        await axios.put(`${API_URL}/${editingType.id_type}`, { type_name: typeName });
        alert("แก้ไขข้อมูลสำเร็จ");
      } else {
        await axios.post(API_URL, { type_name: typeName });
        alert("เพิ่มข้อมูลสำเร็จ");
      }
      setEditingType(null);
      fetchTypes();
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      console.error(error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("คุณแน่ใจหรือว่าต้องการลบประเภทนี้?")) return;
    try {
      await axios.delete(`${API_URL}/${id}`);
      alert("ลบข้อมูลสำเร็จ");
      fetchTypes();
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการลบข้อมูล");
      console.error(error);
    }
  };

  const handleCancelEdit = () => {
    setEditingType(null);
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h1>จัดการประเภทของรถ</h1>

      <TypeCarForm
        editingType={editingType}
        onSave={handleSave}
        onCancel={handleCancelEdit}
      />

      {loading ? (
        <p>กำลังโหลดข้อมูล...</p>
      ) : (
        <ul
          style={{
            listStyleType: "none",
            paddingLeft: 0,
            maxWidth: 400,
            marginTop: "1rem",
          }}
        >
          {types.map((type) => (
            <li
              key={type.id_type}
              style={{
                marginBottom: "0.5rem",
                padding: "0.5rem",
                border: "1px solid #ccc",
                borderRadius: "4px",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <span>{type.type_name}</span>
              <div>
                <button
                  onClick={() => setEditingType(type)}
                  style={{ marginRight: "0.5rem" }}
                >
                  ✏️ แก้ไข
                </button>
                <button onClick={() => handleDelete(type.id_type)}>🗑️ ลบ</button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default AdminVehicleTypes;
