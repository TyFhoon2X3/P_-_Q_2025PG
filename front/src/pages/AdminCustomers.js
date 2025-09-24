import "../styles/common.css";
import "../styles/table.css";
import "../styles/modal.css";
import { useEffect, useMemo, useState } from "react";
import { api } from "../api";

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

  const fetchCustomers = async () => {
    setLoading(true);
    try {
      const data = await api("/api/customers");
      setCustomers(data.customers || []);
    } catch (err) {
      alert("โหลดข้อมูลลูกค้าล้มเหลว: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomers();
  }, []);

  const filtered = useMemo(() => {
    const q = keyword.trim().toLowerCase();
    if (!q) return customers;
    return customers.filter((c) =>
      [c.name, c.email, c.phone, c.address]
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
            password: "Temp@12345", // temporary
            roleid: "r2",
          },
        });
      }
      setOpen(false);
      await fetchCustomers();
    } catch (err) {
      alert("บันทึกล้มเหลว: " + err.message);
    }
  };

  const onDelete = async (row) => {
    if (!window.confirm(`ลบลูกค้า "${row.name}" ?`)) return;
    try {
      await api(`/api/customers/${row.user_id}`, { method: "DELETE" });
      await fetchCustomers();
    } catch (err) {
      alert("ลบไม่สำเร็จ: " + err.message);
    }
  };

  return (
    <div
      className="page-container"
      style={{ maxWidth: 1400, margin: "24px auto", padding: "0 16px" }}
    >
      <h1 className="page-title" style={{ marginBottom: 12 }}>
        👤 จัดการลูกค้า
      </h1>

      <div className="card-wide">

        {/* Search + Action */}
        <div
          style={{
            display: "flex",
            gap: 12,
            alignItems: "center",
            marginBottom: 12,
            flexWrap: "wrap",
          }}
        >
          <input
            className="input"
            placeholder="ค้นหา ชื่อ / อีเมล / เบอร์โทร / ที่อยู่"
            value={keyword}
            onChange={(e) => {
              setKeyword(e.target.value);
              setPage(1);
            }}
            style={{ maxWidth: 420 }}
          />
          <button
            className="btn-outline"
            onClick={fetchCustomers}
            disabled={loading}
          >
            {loading ? "กำลังโหลด..." : "รีเฟรช"}
          </button>
          <button
            className="btn-primary"
            style={{ width: "auto" }}
            onClick={openCreate}
          >
            + เพิ่มลูกค้า
          </button>
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
                <th style={{ width: 160 }}>การจัดการ</th>
              </tr>
            </thead>
            <tbody>
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ padding: 16, color: "var(--muted)" }}>
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
                      <button
                        className="btn-outline"
                        onClick={() => openEdit(c)}
                        style={{ marginRight: 8 }}
                      >
                        แก้ไข
                      </button>
                      <button
                        className="btn-outline"
                        onClick={() => onDelete(c)}
                      >
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginTop: 16,
              flexWrap: "wrap",
              gap: 12,
            }}
          >
            {/* info */}
            <div style={{ fontSize: 14, color: "var(--muted)" }}>
              แสดง {paginated.length} รายการ จากทั้งหมด {filtered.length}
            </div>

            {/* rows per page */}
            <div>
              <label style={{ marginRight: 8 }}>แถวต่อหน้า:</label>
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="input"
                style={{ width: 80 }}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={20}>20</option>
              </select>
            </div>

            {/* buttons */}
            <div style={{ display: "flex", gap: 6 }}>
              <button
                className="btn-outline"
                disabled={page === 1}
                onClick={() => setPage((p) => p - 1)}
              >
                ก่อนหน้า
              </button>

              {Array.from({ length: totalPages }, (_, i) => i + 1).map((num) => (
                <button
                  key={num}
                  onClick={() => setPage(num)}
                  className="btn-outline"
                  style={{
                    background: num === page ? "var(--primary)" : "#fff",
                    color: num === page ? "#fff" : "var(--primary)",
                    minWidth: 36,
                    height: 36,
                    padding: 0,
                    borderRadius: "50%",
                    textAlign: "center",
                  }}
                >
                  {num}
                </button>
              ))}

              <button
                className="btn-outline"
                disabled={page === totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                ถัดไป
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Modal */}
      {open && (
        <div className="modal-backdrop" onClick={() => setOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <h3>{editing ? "แก้ไขลูกค้า" : "เพิ่มลูกค้า"}</h3>
            <form onSubmit={onSubmit}>
              <div className="label">ชื่อ</div>
              <input
                className="input"
                name="name"
                value={form.name}
                onChange={onChange}
                required
              />
              <div className="label">อีเมล</div>
              <input
                className="input"
                name="email"
                type="email"
                value={form.email}
                onChange={onChange}
                required
              />
              <div className="label">เบอร์โทร</div>
              <input
                className="input"
                name="phone"
                value={form.phone}
                onChange={onChange}
              />
              <div className="label">ที่อยู่</div>
              <input
                className="input"
                name="address"
                value={form.address}
                onChange={onChange}
              />
              <div style={{ display: "flex", gap: 10, marginTop: 16 }}>
                <button
                  className="btn-primary"
                  type="submit"
                  style={{ width: "auto" }}
                >
                  บันทึก
                </button>
                <button
                  type="button"
                  className="btn-outline"
                  onClick={() => setOpen(false)}
                >
                  ยกเลิก
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
