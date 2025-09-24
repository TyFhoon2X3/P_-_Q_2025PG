import { useEffect, useState } from "react";
import { api } from "../api";
import Swal from "sweetalert2";
import "../styles/MyVehicles.css";

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

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

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
      Swal.fire("ไม่สำเร็จ ❌", "มีป้ายทะเบียนนี้ในระบบแล้ว", "error");
    }
  };

  const onEdit = (v) => {
    setForm({
      vehicle_id: v.vehicle_id,
      license_plate: v.license_plate,
      model: v.model,
      id_brand: v.id_brand,
      id_type: v.id_type,
    });
    setEditing(true);
  };

  const onCancel = () => {
    setForm({ vehicle_id: "", license_plate: "", model: "", id_brand: "", id_type: "" });
    setEditing(false);
  };

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
    <div className="page-container">
      <h1 className="page-title">🚙 รถของฉัน</h1>

      <div className="card">
        <h3>{editing ? "✏️ แก้ไขรถ" : "➕ เพิ่มรถ"}</h3>
        <form onSubmit={submit}>
          <div className="form-group">
            <label className="label">ทะเบียน</label>
            <input
              type="text"
              name="license_plate"
              value={form.license_plate}
              onChange={onChange}
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">รุ่น</label>
            <input
              type="text"
              name="model"
              value={form.model}
              onChange={onChange}
              className="input"
              required
            />
          </div>

          <div className="form-group">
            <label className="label">ยี่ห้อ</label>
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
          </div>

          <div className="form-group">
            <label className="label">ประเภทรถ</label>
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
          </div>

          <div className="form-buttons">
            <button type="submit" className="btn-primary">
              {editing ? "บันทึกการแก้ไข" : "เพิ่มรถ"}
            </button>
            {editing && (
              <button type="button" onClick={onCancel} className="btn-secondary">
                ยกเลิก
              </button>
            )}
          </div>
        </form>
      </div>

      <div className="card">
        {vehicles.length === 0 ? (
          <p className="no-data">ยังไม่มีข้อมูลรถ</p>
        ) : (
          <div className="table-container">
            <table className="table">
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
                      <button onClick={() => onEdit(v)} className="btn-edit">แก้ไข</button>
                      <button onClick={() => onDelete(v.vehicle_id)} className="btn-delete">ลบ</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
