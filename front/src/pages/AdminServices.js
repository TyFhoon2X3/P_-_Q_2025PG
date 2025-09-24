// src/pages/AdminServices.js
import "../styles/common.css";
import "../styles/table.css";
import "../styles/modal.css";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";

export default function AdminServices() {
  const [services, setServices] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // modal form
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    service_name: "",
    price: "",
    description: "",
  });

  const fetchServices = async () => {
    setLoading(true);
    try {
      const data = await api("/api/services");
      setServices(data.services || []);
    } catch (err) {
      alert("โหลดข้อมูลบริการล้มเหลว: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return services;
    return services.filter((s) =>
      [s.service_name, s.description]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q))
    );
  }, [services, keyword]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditing(null);
    setForm({ service_name: "", price: "", description: "" });
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      service_name: row.service_name || "",
      price: row.price || "",
      description: row.description || "",
    });
    setOpen(true);
  };

  const onChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api(`/api/services/${editing.service_id}`, {
          method: "PUT",
          body: { ...form },
        });
      } else {
        await api("/api/services", {
          method: "POST",
          body: { ...form },
        });
      }
      setOpen(false);
      await fetchServices();
    } catch (err) {
      alert("บันทึกบริการล้มเหลว: " + err.message);
    }
  };

  const onDelete = async (row) => {
    if (!window.confirm(`ลบบริการ "${row.service_name}" ?`)) return;
    try {
      await api(`/api/services/${row.service_id}`, { method: "DELETE" });
      await fetchServices();
    } catch (err) {
      alert("ลบไม่สำเร็จ: " + err.message);
    }
  };

  return (
    <div style={{ maxWidth: 1200, margin: "24px auto", padding: "0 16px" }}>
      <h1 style={{ marginBottom: 12 }}>🛠️ จัดการบริการ</h1>

      <div className="card-wide">
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
          <input
            className="input"
            placeholder="ค้นหาบริการ"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
            style={{ maxWidth: 400 }}
          />
          <button className="btn-outline" onClick={fetchServices} disabled={loading}>
            {loading ? "กำลังโหลด..." : "รีเฟรช"}
          </button>
          <button className="btn-primary" onClick={openCreate}>+ เพิ่มบริการ</button>
        </div>

        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>ชื่อบริการ</th>
                <th>ราคา</th>
                <th>รายละเอียด</th>
                <th style={{ width: 160 }}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr><td colSpan="5" style={{ padding: 16, color: "var(--muted)" }}>ไม่พบข้อมูล</td></tr>
              ) : (
                paginated.map((s) => (
                  <tr key={s.service_id}>
                    <td>{s.service_id}</td>
                    <td>{s.service_name}</td>
                    <td>{s.price}</td>
                    <td title={s.description}>{s.description || "-"}</td>
                    <td>
                      <button className="btn-outline" onClick={() => openEdit(s)} style={{ marginRight: 8 }}>แก้ไข</button>
                      <button className="btn-outline" onClick={() => onDelete(s)}>ลบ</button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination bar */}
        {totalPages > 1 && (
          <div className="pagination">
            <div className="pagination-info">
              แสดง {paginated.length} รายการ จากทั้งหมด {filtered.length}
            </div>
            <div>
              <label style={{ marginRight: 8 }}>แถวต่อหน้า:</label>
              <select
                value={pageSize}
                onChange={(e) => { setPageSize(Number(e.target.value)); setPage(1); }}
                className="input" style={{ width: 80 }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>
            <div className="pagination-pages">
              <button disabled={page===1} onClick={()=>setPage(p=>p-1)}>‹</button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button key={num} onClick={()=>setPage(num)} className={num===page ? "active" : ""}>{num}</button>
              ))}
              <button disabled={page===totalPages} onClick={()=>setPage(p=>p+1)}>›</button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? "แก้ไขบริการ" : "เพิ่มบริการ"}</h3>
            <form onSubmit={onSubmit}>
              <div className="label">ชื่อบริการ</div>
              <input className="input" name="service_name" value={form.service_name} onChange={onChange} required />
              <div className="label">ราคา</div>
              <input className="input" name="price" value={form.price} onChange={onChange} required />
              <div className="label">รายละเอียด</div>
              <textarea className="input" name="description" value={form.description} onChange={onChange} rows={3} />
              <div style={{ display:"flex", gap:10, marginTop:16 }}>
                <button className="btn-primary" type="submit">บันทึก</button>
                <button type="button" className="btn-outline" onClick={() => setOpen(false)}>ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
