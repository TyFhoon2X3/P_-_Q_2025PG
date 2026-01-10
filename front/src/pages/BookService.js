import { useEffect, useState } from "react";
import { api } from "../api";
import { useNavigate } from "react-router-dom";
import Swal from "sweetalert2";
import { Calendar, Clock, Car, FileText, CheckCircle } from "lucide-react";
import "../styles/BookAppointmentPage.css";

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

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      Swal.fire({ title: "กรุณาเข้าสู่ระบบ", icon: "warning" });
      nav("/login");
      return;
    }

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
  }, [nav]);

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

      Swal.fire({
        title: "✅ จองสำเร็จ",
        text: "ระบบได้บันทึกการจองของคุณแล้ว",
        icon: "success",
        confirmButtonColor: "var(--accent-color)",
      });

      setForm({
        vehicle_id: "",
        date: "",
        time: "",
        description: "",
        transport_required: false,
      });

      nav("/bookings");
    } catch (err) {
      Swal.fire({
        title: "เกิดข้อผิดพลาด",
        text: "❌ จองไม่สำเร็จ: " + err.message,
        icon: "error",
      });
    }
  };

  if (loading) return (
    <div className="page-container text-center py-20">
      <div className="animate-spin text-accent mb-4">⏳</div>
      <p>กำลังโหลดข้อมูลรถ...</p>
    </div>
  );

  return (
    <div className="page-container">
      <div className="booking-header">
        <div className="icon-hero">
          <Calendar size={32} />
        </div>
        <h1 className="page-title">จองบริการซ่อม</h1>
        <p className="page-subtitle">เลือกวันและเวลาที่คุณสะดวกเพื่อเข้ารับบริการ</p>
      </div>

      <div className="card">
        {error && <p className="text-danger mb-4">{error}</p>}

        <form onSubmit={submit}>
          <div className="label"><Car size={16} /> เลือกรถของคุณ</div>
          <select
            name="vehicle_id"
            value={form.vehicle_id}
            onChange={onChange}
            className="input"
            required
          >
            <option value="">-- กรุณาเลือกรถ --</option>
            {vehicles.map((v) => (
              <option key={v.vehicle_id} value={v.vehicle_id}>
                {v.brandname} {v.model} ({v.license_plate})
              </option>
            ))}
          </select>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
            <div>
              <div className="label"><Calendar size={16} /> วันที่เข้ารับบริการ</div>
              <input
                type="date"
                name="date"
                value={form.date}
                onChange={onChange}
                className="input"
                required
                min={new Date().toISOString().split("T")[0]}
              />
            </div>
            <div>
              <div className="label"><Clock size={16} /> เวลา</div>
              <select
                name="time"
                value={form.time}
                onChange={onChange}
                className="input"
                required
              >
                <option value="">-- เลือกเวลา --</option>
                {(() => {
                  const slots = [];
                  for (let hour = 8; hour <= 16; hour++) {
                    const hourStr = hour.toString().padStart(2, "0");
                    slots.push(`${hourStr}:00`);
                    if (hour < 16) slots.push(`${hourStr}:30`);
                  }
                  return slots.map((slot) => (
                    <option key={slot} value={slot}>{slot} น.</option>
                  ));
                })()}
              </select>
            </div>
          </div>

          <div className="label"><FileText size={16} /> รายละเอียดการซ่อม / อาการเบื้องต้น</div>
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            className="input"
            rows="4"
            placeholder="โปรดระบุรายละเอียดปัญหาของรถคุณ..."
            required
          />

          <label className="checkbox-container">
            <input
              type="checkbox"
              name="transport_required"
              checked={form.transport_required}
              onChange={onChange}
            />
            <span>ต้องการให้ทางร้านรับรถถึงที่ (บริการพิเศษ)</span>
          </label>

          <button className="btn-primary" type="submit" style={{ marginTop: "32px" }}>
            ยืนยันการจองบริการ
          </button>
        </form>
      </div>
    </div>
  );
}
