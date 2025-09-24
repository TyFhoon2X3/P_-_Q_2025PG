import { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";

export default function BookService() {
  const nav = useNavigate();
  const [vehicles, setVehicles] = useState([]);
  const [form, setForm] = useState({
    vehicle_id: "",
    date: "",
    time: "",
    description: "",
    transport_required: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // ✅ โหลดเฉพาะรถของ user ที่ login
  useEffect(() => {
    api("/api/vehicles/mine")
      .then((data) => {
        if (data.success === false) {
          setError(data.message || "ไม่สามารถโหลดข้อมูลรถได้");
          setVehicles([]);
        } else {
          setVehicles(data.vehicles || []);
        }
      })
      .catch((err) => {
        console.error("โหลดข้อมูลรถ error:", err);
        setError("เกิดข้อผิดพลาดในการโหลดข้อมูลรถ");
      })
      .finally(() => setLoading(false));
  }, []);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const submit = async (e) => {
    e.preventDefault();
    try {
      await api("/api/bookings", {
        method: "POST",
        body: form,
      });
      alert("✅ จองบริการสำเร็จ");
      nav("/bookings");
    } catch (err) {
      alert("❌ จองไม่สำเร็จ: " + err.message);
    }
  };

  if (loading) return <div>⏳ กำลังโหลดข้อมูลรถ...</div>;

  return (
    <div
      className="page-container"
      style={{ maxWidth: "600px", margin: "24px auto", padding: "0 16px" }}
    >
      <h1 className="page-title">📝 จองบริการ</h1>

      <div className="card" style={{ padding: "16px" }}>
        {error && <p style={{ color: "red" }}>{error}</p>}

        <form onSubmit={submit}>
          <div className="label">เลือกรถ</div>
          <select
            name="vehicle_id"
            value={form.vehicle_id}
            onChange={onChange}
            className="input"
            required
          >
            <option value="">-- เลือกรถ --</option>
            {vehicles.map((v) => (
              <option key={v.vehicle_id} value={v.vehicle_id}>
                {v.brandname} {v.model} ({v.license_plate})
              </option>
            ))}
          </select>

          <div className="label">วันที่</div>
          <input
            type="date"
            name="date"
            value={form.date}
            onChange={onChange}
            className="input"
            required
          />

          <div className="label">เวลา</div>
          <input
            type="time"
            name="time"
            value={form.time}
            onChange={onChange}
            className="input"
            required
          />

          <div className="label">รายละเอียดการซ่อม</div>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            className="input"
            rows="3"
            required
          />

          <label
            style={{
              display: "flex",
              alignItems: "center",
              gap: "6px",
              marginTop: "12px",
            }}
          >
            <input
              type="checkbox"
              name="transport_required"
              checked={form.transport_required}
              onChange={onChange}
            />
            ต้องการให้ทางร้านรับรถถึงที่
          </label>

          <button
            className="btn-primary"
            type="submit"
            style={{ marginTop: "16px" }}
          >
            จองเลย
          </button>
        </form>
      </div>
    </div>
  );
}
