// src/pages/Register.js
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import { api } from "../api";
import "../styles/auth.css";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "",
    address: "",
  });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      await api("/api/register", {
        method: "POST",
        body: form,
      });

      Swal.fire({
        icon: "success",
        title: "✅ สมัครสมาชิกสำเร็จ",
        text: "คุณสามารถเข้าสู่ระบบได้ทันที",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => nav("/login"));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "❌ สมัครสมาชิกไม่สำเร็จ",
        text: err.message || "เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <section className="auth-hero">
        <h1>สร้างบัญชีของคุณ</h1>
        <p>กรอกข้อมูลด้านล่างเพื่อสมัครสมาชิก</p>
      </section>

      <div className="card">
        <div className="card-inner">
          <form onSubmit={onSubmit}>
            <div className="label">ชื่อ-นามสกุล</div>
            <input
              className="input"
              name="name"
              placeholder="เช่น สมชาย ใจดี"
              value={form.name}
              onChange={onChange}
              required
            />

            <div className="label">อีเมล</div>
            <input
              className="input"
              name="email"
              placeholder="YOUR@EMAIL.COM"
              value={form.email}
              onChange={onChange}
              required
            />

            <div className="label">รหัสผ่าน</div>
            <input
              className="input"
              type="password"
              name="password"
              placeholder="********************"
              value={form.password}
              onChange={onChange}
              required
            />

            <div className="label">เบอร์โทรศัพท์</div>
            <input
              className="input"
              type="text"
              name="phone"
              placeholder="0812345678"
              value={form.phone}
              onChange={onChange}
              required
            />

            <div className="label">ที่อยู่</div>
            <input
              className="input"
              type="text"
              name="address"
              placeholder="123 ถนนหลัก เขต/อำเภอ จังหวัด"
              value={form.address}
              onChange={onChange}
              required
            />

            <button className="btn-primary mt-8" type="submit" disabled={loading}>
              {loading ? "กำลังสมัครสมาชิก..." : "สมัครสมาชิก"}
            </button>
          </form>

          <div className="card-footer">
            มีบัญชีอยู่แล้ว? <Link to="/login">เข้าสู่ระบบที่นี่</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
