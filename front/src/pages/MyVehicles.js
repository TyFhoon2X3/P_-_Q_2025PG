// src/pages/MyVehicles.jsx
import { useEffect, useState } from "react";
import { api } from "../api";
import Swal from "sweetalert2";

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [types, setTypes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);

  const [form, setForm] = useState({
    vehicle_id: "",
    license_plate: "",
    model: "",
    id_brand: "",
    id_type: "",
  });

  // โหลดรถ, ยี่ห้อ, ประเภท
  const fetchData = async () => {
    try {
      const [v, b, t] = await Promise.all([
        api("/api/vehicles/mine"),
        api("/api/brands"),
        api("/api/typecar"),
      ]);
      setVehicles(v.vehicles || []);
      setBrands(b.brands || []);
      setTypes(t.typecar || []);
    } catch (err) {
      Swal.fire("ผิดพลาด ❌", "เกิดข้อผิดพลาดในการโหลดข้อมูล", "error");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // เปลี่ยนค่าใน form
  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  // กดเพิ่ม/แก้ไข
  const submit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api(`/api/vehicles/${form.vehicle_id}`, {
          method: "PUT",
          body: form,
        });
        Swal.fire("สำเร็จ ✅", "แก้ไขข้อมูลเรียบร้อยแล้ว", "success");
      } else {
        await api("/api/vehicles", { method: "POST", body: form });
        Swal.fire("สำเร็จ ✅", "เพิ่มรถเรียบร้อยแล้ว", "success");
      }
      setForm({ vehicle_id: "", license_plate: "", model: "", id_brand: "", id_type: "" });
      setEditing(false);
      fetchData();
    } catch (err) {
      Swal.fire("ไม่สำเร็จ ❌", "มีป้ายทะเบียนนี่ในระบบแล้ว", "error");
    }
  };

  // กดแก้ไข
  const onEdit = (v) => {
    setForm({
      vehicle_id: v.vehicle_id,
      license_plate: v.license_plate,
      model: v.model,
      id_brand: v.id_brand, // ✅ ให้ dropdown ยี่ห้อเลือกถูก
      id_type: v.id_type,   // ✅ ให้ dropdown ประเภทเลือกถูก
    });
    setEditing(true);
  };

  // กดยกเลิก
  const onCancel = () => {
    setForm({ vehicle_id: "", license_plate: "", model: "", id_brand: "", id_type: "" });
    setEditing(false);
  };

  // กดลบ
  const onDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "การลบนี้ไม่สามารถย้อนกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
    });

    if (!confirm.isConfirmed) return;

    try {
      await api(`/api/vehicles/${id}`, { method: "DELETE" });
      Swal.fire("สำเร็จ ✅", "ลบรถเรียบร้อยแล้ว", "success");
      fetchData();
    } catch (err) {
      Swal.fire("ไม่สำเร็จ ❌", err.message, "error");
    }
  };

  if (loading) return <div>⏳ กำลังโหลด...</div>;

  return (
    <div className="page-container" style={{ maxWidth: "900px", margin: "24px auto", padding: "0 16px" }}>
      <h1 className="page-title">🚙 รถของฉัน</h1>

      {/* ฟอร์มเพิ่ม/แก้ไข */}
      <div className="card" style={{ padding: "16px", marginBottom: "20px" }}>
        <h3>{editing ? "✏️ แก้ไขรถ" : "➕ เพิ่มรถ"}</h3>
        <form onSubmit={submit}>
          <div className="label">ทะเบียน</div>
          <input
            type="text"
            name="license_plate"
            value={form.license_plate}
            onChange={onChange}
            className="input"
            required
          />

          <div className="label">รุ่น</div>
          <input
            type="text"
            name="model"
            value={form.model}
            onChange={onChange}
            className="input"
            required
          />

          <div className="label">ยี่ห้อ</div>
          <select
            name="id_brand"
            value={form.id_brand}
            onChange={onChange}
            className="input"
            required
          >
            <option value="">-- เลือกยี่ห้อ --</option>
            {brands.map((b) => (
              <option key={b.id_brand} value={b.id_brand}>
                {b.brandname}
              </option>
            ))}
          </select>

          <div className="label">ประเภทรถ</div>
          <select
            name="id_type"
            value={form.id_type}
            onChange={onChange}
            className="input"
            required
          >
            <option value="">-- เลือกประเภท --</option>
            {types.map((t) => (
              <option key={t.id_type} value={t.id_type}>
                {t.typename}
              </option>
            ))}
          </select>

          <div style={{ marginTop: "12px" }}>
            <button type="submit" className="btn-primary">
              {editing ? "บันทึกการแก้ไข" : "เพิ่มรถ"}
            </button>
            {editing && (
              <button type="button" onClick={onCancel} style={{ marginLeft: "8px" }}>
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      </div>

      {/* ตารางแสดงรถ */}
      <div className="card" style={{ padding: "16px" }}>
        {vehicles.length === 0 ? (
          <p style={{ color: "gray" }}>ยังไม่มีข้อมูลรถ</p>
        ) : (
          <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>ยี่ห้อ</th>
                <th>รุ่น</th>
                <th>ทะเบียน</th>
                <th>ประเภทรถ</th>
                <th>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.vehicle_id}>
                  <td>{v.brandname}</td>
                  <td>{v.model}</td>
                  <td>{v.license_plate}</td>
                  <td>{v.typename}</td>
                  <td>
                    <button onClick={() => onEdit(v)} style={{ marginRight: "8px" }}>
                      แก้ไข
                    </button>
                    <button onClick={() => onDelete(v.vehicle_id)} style={{ color: "red" }}>
                      ลบ
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
