import "../styles/common.css";
import "../styles/table.css";
import "../styles/modal.css";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import Swal from "sweetalert2";
import Select from "react-select";

export default function AdminVehiclesPage() {
  const [vehicles, setVehicles] = useState([]);
  const [brands, setBrands] = useState([]);
  const [types, setTypes] = useState([]);
  const [users, setUsers] = useState([]);

  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // form state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    license_plate: "",
    model: "",
    id_brand: "",
    id_type: "",
    id_user: "",
  });

  // โหลดข้อมูลรถ
  const fetchVehicles = async () => {
    setLoading(true);
    try {
      const data = await api("/api/vehicles");
      setVehicles(data.vehicles || []);
    } catch (err) {
      alert("โหลดข้อมูลรถล้มเหลว: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  // โหลด options
  const fetchOptions = async () => {
    try {
      const [b, t, u] = await Promise.all([
        api("/api/brands"),
        api("/api/typecar"),
        api("/api/customers"),
      ]);
      setBrands(b.brands || []);
      setTypes(t.typecar || []);
      setUsers(u.customers || []);
    } catch (err) {
      console.error("โหลด brands/types/users ไม่สำเร็จ", err);
    }
  };

  useEffect(() => {
    fetchVehicles();
    fetchOptions();
  }, []);

  // filter
  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return vehicles;
    return vehicles.filter((v) =>
      [v.license_plate, v.model, v.brandname, v.typename, v.owner_name]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q))
    );
  }, [vehicles, keyword]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  // form handler
  const openCreate = () => {
    setEditing(null);
    setForm({
      license_plate: "",
      model: "",
      id_brand: "",
      id_type: "",
      id_user: "", // ✅ เริ่มว่าง ให้เลือกเอง
    });
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      license_plate: row.license_plate || "",
      model: row.model || "",
      id_brand: row.id_brand || "",
      id_type: row.id_type || "",
      id_user: row.id_user || row.owner_id || "", // ✅ ใช้ค่า id_user จาก DB
    });
    setOpen(true);
  };

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api(`/api/vehicles/${editing.vehicle_id}`, {
          method: "PUT",
          body: { ...form },
        });
      } else {
        await api("/api/vehicles", { method: "POST", body: { ...form } });
      }
      setOpen(false);
      await fetchVehicles();
    } catch (err) {
      if (err.message.includes("Forbidden")) {
        alert("❌ คุณไม่มีสิทธิ์ทำรายการนี้ (ตรวจสอบ role ใน backend)");
      } else {
        alert("บันทึกล้มเหลว: " + err.message);
      }
    }
  };

  const onDelete = async (row) => {
    const result = await Swal.fire({
      title: `ลบรถ "${row.license_plate}" ?`,
      text: "การลบนี้ไม่สามารถย้อนกลับได้",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "ใช่, ลบเลย",
      cancelButtonText: "ยกเลิก",
    });

    if (!result.isConfirmed) return;

    try {
      await api(`/api/vehicles/${row.vehicle_id}`, { method: "DELETE" });
      await fetchVehicles();

      Swal.fire({
        title: "สำเร็จ!",
        text: "ลบรถเรียบร้อยแล้ว",
        icon: "success",
        timer: 2000,
        showConfirmButton: false,
      });
    } catch (err) {
      Swal.fire({
        title: "ลบไม่สำเร็จ",
        text: err.message,
        icon: "error",
      });
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 1400, margin: "24px auto", padding: "0 16px" }}>
      <h1 className="page-title" style={{ marginBottom: 12 }}>🚗 จัดการรถ</h1>

      <div className="card-wide">
        {/* Search + Action */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
          <input
            className="input"
            placeholder="ค้นหา ทะเบียน / รุ่น / ยี่ห้อ / เจ้าของ"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            style={{ maxWidth: 420 }}
          />
          <button className="btn-outline" onClick={fetchVehicles} disabled={loading}>
            {loading ? "กำลังโหลด..." : "รีเฟรช"}
          </button>
          <button className="btn-primary" style={{ width: "auto" }} onClick={openCreate}>
            + เพิ่มรถ
          </button>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>ทะเบียน</th>
                <th>รุ่น</th>
                <th>ยี่ห้อ</th>
                <th>ประเภท</th>
                <th>เจ้าของ</th>
                <th style={{ width: 160 }}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: 16, color: "var(--muted)" }}>
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                paginated.map((v) => (
                  <tr key={v.vehicle_id}>
                    <td>{v.vehicle_id}</td>
                    <td>{v.license_plate}</td>
                    <td>{v.model}</td>
                    <td>{v.brandname}</td>
                    <td>{v.typename}</td>
                    <td>{v.owner_name}</td>
                    <td>
                      <button className="btn-outline" onClick={() => openEdit(v)} style={{ marginRight: 8 }}>
                        แก้ไข
                      </button>
                      <button className="btn-outline" onClick={() => onDelete(v)}>
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Add/Edit */}
      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? "แก้ไขรถ" : "เพิ่มรถ"}</h3>
            <form onSubmit={onSubmit}>
              <div className="label">ทะเบียน</div>
              <input className="input" name="license_plate" value={form.license_plate} onChange={onChange} required />

              <div className="label">รุ่น</div>
              <input className="input" name="model" value={form.model} onChange={onChange} required />

              <div className="label">ยี่ห้อ</div>
              <select name="id_brand" value={form.id_brand} onChange={onChange} className="input" required>
                <option value="">-- เลือกยี่ห้อ --</option>
                {brands.map((b) => (
                  <option key={b.id_brand} value={b.id_brand}>
                    {b.brandname}
                  </option>
                ))}
              </select>

              <div className="label">ประเภท</div>
              <select name="id_type" value={form.id_type} onChange={onChange} className="input" required>
                <option value="">-- เลือกประเภท --</option>
                {types.map((t) => (
                  <option key={t.id_type} value={t.id_type}>
                    {t.typename}
                  </option>
                ))}
              </select>

              <div className="label">ผู้ใช้</div>
              <Select
                value={users.find((u) => String(u.user_id) === String(form.id_user)) || null}
                onChange={(opt) =>
                  setForm((p) => ({ ...p, id_user: opt ? String(opt.user_id) : "" }))
                }
                options={users}
                getOptionLabel={(u) => u.fullname || u.name}   // โชว์ชื่อ
                getOptionValue={(u) => String(u.user_id)}      // ✅ ใช้ user_id แทน
                placeholder="ค้นหาผู้ใช้..."
                isClearable
              />
            

              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button className="btn-primary" type="submit" style={{ width: "auto" }}>บันทึก</button>
                <button type="button" className="btn-outline" onClick={() => setOpen(false)}>ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
