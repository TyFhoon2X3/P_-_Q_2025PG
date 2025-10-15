import "../styles/common.css";
import "../styles/table.css";
import "../styles/modal.css";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";
import Swal from "sweetalert2";

export default function AdminCustomers() {
  const [customers, setCustomers] = useState([]);
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(false);

  // pagination
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // form state
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
  });

  // ban modal state
  const [banModal, setBanModal] = useState(false);
  const [banTarget, setBanTarget] = useState(null);
  const [banReason, setBanReason] = useState("");

  // ดึงข้อมูลลูกค้า
  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await api("/api/customers");
      setCustomers(data.customers || []);
    } catch (err) {
      Swal.fire("❌", "โหลดข้อมูลลูกค้าไม่สำเร็จ", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  // ✅ ฟิลเตอร์ค้นหา
  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.name, c.email, c.phone, c.address, c.reason]
        .filter(Boolean)
        .some((f) => String(f).toLowerCase().includes(q))
    );
  }, [customers, keyword]);

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

  const openCreate = () => {
    setEditing(null);
    setForm({ name: "", email: "", phone: "", address: "" });
    setOpen(true);
  };

  const openEdit = (row) => {
    setEditing(row);
    setForm({
      name: row.name || "",
      email: row.email || "",
      phone: row.phone || "",
      address: row.address || "",
    });
    setOpen(true);
  };

  const onChange = (e) =>
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editing) {
        await api(`/api/customers/${editing.user_id}`, {
          method: "PUT",
          body: { ...form },
        });
      } else {
        await api("/api/customers", {
          method: "POST",
          body: {
            ...form,
            password: "Temp@12345",
            roleid: "r2",
          },
        });
      }
      setOpen(false);
      fetchCustomers();
    } catch (err) {
      Swal.fire("❌", "บันทึกล้มเหลว: " + err.message, "error");
    }
  };

  // ✅ ลบลูกค้า
  const onDelete = async (row) => {
    const result = await Swal.fire({
      title: `ลบลูกค้า "${row.name}" ?`,
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
      await api(`/api/customers/${row.user_id}`, { method: "DELETE" });
      fetchCustomers();
      Swal.fire("✅", "ลบลูกค้าเรียบร้อยแล้ว", "success");
    } catch (err) {
      Swal.fire("❌", "ลบไม่สำเร็จ: " + err.message, "error");
    }
  };

  // ✅ เปิด modal แบนลูกค้า
  const openBan = (row) => {
    setBanTarget(row);
    setBanReason("");
    setBanModal(true);
  };

  // ✅ แบนลูกค้า
  const confirmBan = async () => {
    if (!banReason.trim()) {
      Swal.fire("⚠️", "กรุณากรอกเหตุผลการแบน", "warning");
      return;
    }

    try {
      await api(`/api/customers/${banTarget.user_id}/ban`, {
        method: "PUT",
        body: { reason: banReason },
      });
      Swal.fire("✅", `แบนลูกค้า ${banTarget.name} สำเร็จ`, "success");
      setBanModal(false);
      fetchCustomers();
    } catch (err) {
      Swal.fire("❌", "เกิดข้อผิดพลาดในการแบน", "error");
    }
  };

  // ✅ ปลดแบน
  const unban = async (row) => {
    const res = await Swal.fire({
      title: `ยืนยันปลดแบน ${row.name}?`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "ปลดแบน",
      cancelButtonText: "ยกเลิก",
    });
    if (!res.isConfirmed) return;

    try {
      await api(`/api/customers/${row.user_id}/ban`, {
        method: "PUT",
        body: { reason: null },
      });
      Swal.fire("✅", "ปลดแบนเรียบร้อย", "success");
      fetchCustomers();
    } catch {
      Swal.fire("❌", "ปลดแบนไม่สำเร็จ", "error");
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: 1400, margin: "24px auto", padding: "0 16px" }}>
      <h1 className="page-title" style={{ marginBottom: 12 }}>
        👤 จัดการลูกค้า
      </h1>

      <div className="card-wide">
        {/* Search + Action */}
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 12, flexWrap: "wrap" }}>
          <input
            className="input"
            placeholder="ค้นหา ชื่อ / อีเมล / เบอร์โทร / ที่อยู่ / เหตุผลแบน"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            style={{ maxWidth: 420 }}
          />
          <button className="btn-outline" onClick={fetchCustomers} disabled={loading}>
            {loading ? "กำลังโหลด..." : "รีเฟรช"}
          </button>
          <button className="btn-primary" onClick={openCreate}>+ เพิ่มลูกค้า</button>
        </div>

        {/* Table */}
        <div style={{ overflowX: "auto" }}>
          <table className="table">
            <thead>
              <tr>
                <th>ID</th>
                <th>ชื่อ</th>
                <th>อีเมล</th>
                <th>เบอร์โทร</th>
                <th>ที่อยู่</th>
                <th>สถานะ</th>
                <th>วันที่แบน</th>
                <th>เหตุผลแบน</th>
                <th style={{ width: 200 }}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="9" style={{ padding: 16, color: "var(--muted)" }}>
                    ไม่พบข้อมูล
                  </td>
                </tr>
              ) : (
                paginated.map((c) => (
                  <tr key={c.user_id}>
                    <td>{c.user_id}</td>
                    <td>{c.name}</td>
                    <td>{c.email}</td>
                    <td>{c.phone || "-"}</td>
                    <td>{c.address || "-"}</td>
                    <td>
                      {c.reason ? (
                        <span style={{ color: "#dc2626", fontWeight: 600 }}>ถูกแบน</span>
                      ) : (
                        <span style={{ color: "#16a34a" }}>ปกติ</span>
                      )}
                    </td>
                    <td>{c.blacklisted_date ? new Date(c.blacklisted_date).toLocaleDateString() : "-"}</td>
                    <td>{c.reason || "-"}</td>
                    <td>
                      <button className="btn-outline" onClick={() => openEdit(c)} style={{ marginRight: 6 }}>
                        แก้ไข
                      </button>
                      <button className="btn-outline" onClick={() => onDelete(c)} style={{ marginRight: 6 }}>
                        ลบ
                      </button>
                      {c.reason ? (
                        <button
                          className="btn-outline"
                          style={{ color: "#16a34a", borderColor: "#16a34a" }}
                          onClick={() => unban(c)}
                        >
                          ปลดแบน
                        </button>
                      ) : (
                        <button
                          className="btn-outline"
                          style={{ color: "#dc2626", borderColor: "#dc2626" }}
                          onClick={() => openBan(c)}
                        >
                          แบน
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal เพิ่ม/แก้ไขลูกค้า */}
      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? "แก้ไขลูกค้า" : "เพิ่มลูกค้า"}</h3>
            <form onSubmit={onSubmit}>
              <div className="label">ชื่อ</div>
              <input className="input" name="name" value={form.name} onChange={onChange} required />
              <div className="label">อีเมล</div>
              <input className="input" name="email" type="email" value={form.email} onChange={onChange} required />
              <div className="label">เบอร์โทร</div>
              <input className="input" name="phone" value={form.phone} onChange={onChange} />
              <div className="label">ที่อยู่</div>
              <input className="input" name="address" value={form.address} onChange={onChange} />
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button className="btn-primary" type="submit">บันทึก</button>
                <button type="button" className="btn-outline" onClick={() => setOpen(false)}>ยกเลิก</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal แบนลูกค้า */}
      {banModal && (
        <div className="modal-backdrop" onClick={() => setBanModal(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>🚫 แบนลูกค้า {banTarget?.name}</h3>
            <p style={{ color: "gray", marginTop: 6 }}>
              กรุณากรอกเหตุผลการแบน เช่น ใช้ระบบไม่เหมาะสม, ค้างชำระ, ข้อมูลเท็จ ฯลฯ
            </p>
            <textarea
              className="input"
              rows="3"
              value={banReason}
              onChange={(e) => setBanReason(e.target.value)}
              placeholder="กรอกเหตุผล..."
              style={{ resize: "none", marginTop: 10 }}
            ></textarea>
            <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
              <button className="btn-primary" onClick={confirmBan}>ยืนยันแบน</button>
              <button className="btn-outline" onClick={() => setBanModal(false)}>ยกเลิก</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
