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
  const [showModal, setShowModal] = useState(false);

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

  const openAddModal = () => {
    setForm({ vehicle_id: "", license_plate: "", model: "", id_brand: "", id_type: "" });
    setEditing(false);
    setShowModal(true);
  };

  const openEditModal = (v) => {
    setForm({
      vehicle_id: v.vehicle_id,
      license_plate: v.license_plate,
      model: v.model,
      id_brand: v.id_brand,
      id_type: v.id_type,
    });
    setEditing(true);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setForm({ vehicle_id: "", license_plate: "", model: "", id_brand: "", id_type: "" });
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
      closeModal();
      fetchData();
    } catch (err) {
      Swal.fire("ไม่สำเร็จ ❌", "มีป้ายทะเบียนนี้ในระบบแล้ว หรือเกิดข้อผิดพลาด", "error");
    }
  };

  const onDelete = async (id) => {
    const confirm = await Swal.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "การลบนี้ไม่สามารถย้อนกลับได้!",
      icon: "warning",
      showCancelButton: true,
      confirmButtonText: "ลบเลย",
      cancelButtonText: "ยกเลิก",
      confirmButtonColor: "#ef4444",
      background: "#1e293b",
      color: "#fff"
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

  if (loading) return <div className="loading-container">⏳ กำลังโหลด...</div>;

  return (
    <div className="page-container">
      <div className="header-actions">
        <div>
          <h1 className="page-title">🚙 รถของฉัน</h1>
          <p className="page-subtitle">จัดการข้อมูลรถของคุณได้ที่นี่</p>
        </div>
        <button onClick={openAddModal} className="btn-add-vehicle">
          <span>➕</span> เพิ่มรถใหม่
        </button>
      </div>

      <div className="vehicle-grid">
        {vehicles.length === 0 ? (
          <div className="no-data-card">
            <div className="no-data-icon">🚗</div>
            <h3>ยังไม่มีรถในระบบ</h3>
            <p>กดปุ่ม "เพิ่มรถใหม่" เพื่อเริ่มต้นใช้งาน</p>
          </div>
        ) : (
          vehicles.map((v) => (
            <div key={v.vehicle_id} className="vehicle-card">
              <div className="vehicle-icon-wrapper">
                <span className="vehicle-icon">🚘</span>
              </div>
              <div className="vehicle-info">
                <h3 className="vehicle-model">{v.brandname} {v.model}</h3>
                <div className="vehicle-badge">{v.typename}</div>
                <div className="vehicle-plate">
                  <span>ทะเบียน:</span>
                  <strong>{v.license_plate}</strong>
                </div>
              </div>
              <div className="vehicle-actions">
                <button onClick={() => openEditModal(v)} className="btn-icon edit">
                  ✏️ แก้ไข
                </button>
                <button onClick={() => onDelete(v.vehicle_id)} className="btn-icon delete">
                  🗑️ ลบ
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={(e) => { if (e.target.className === 'modal-overlay') closeModal(); }}>
          <div className="modal-content">
            <div className="modal-header">
              <h3>{editing ? "✏️ แก้ไขข้อมูลรถ" : "➕ เพิ่มรถคันใหม่"}</h3>
              <button onClick={closeModal} className="btn-close">✖</button>
            </div>

            <form onSubmit={submit} className="modal-form">
              <div className="form-group">
                <label className="label">ทะเบียนรถ</label>
                <input
                  type="text"
                  name="license_plate"
                  value={form.license_plate}
                  onChange={onChange}
                  className="input"
                  placeholder="เช่น กข 1234"
                  required
                />
              </div>

              <div className="form-group">
                <label className="label">รุ่นรถ</label>
                <input
                  type="text"
                  name="model"
                  value={form.model}
                  onChange={onChange}
                  className="input"
                  placeholder="เช่น Civic, Model 3"
                  required
                />
              </div>

              <div className="form-row">
                <div className="form-group">
                  <label className="label">ยี่ห้อ</label>
                  <select
                    name="id_brand"
                    value={form.id_brand}
                    onChange={onChange}
                    className="input"
                    required
                  >
                    <option value="">เลือกยี่ห้อ</option>
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
                    <option value="">เลือกประเภท</option>
                    {types.map((t) => (
                      <option key={t.id_type} value={t.id_type}>
                        {t.typename}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal} className="btn-secondary">
                  ยกเลิก
                </button>
                <button type="submit" className="btn-primary">
                  {editing ? "บันทึกการแก้ไข" : "ยืนยันการเพิ่ม"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
