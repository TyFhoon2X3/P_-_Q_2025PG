// src/pages/Login.js
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
import "../styles/auth.css";

export default function Login() {
  const [form, setForm] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const nav = useNavigate();

  const onChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("http://localhost:3000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "เกิดข้อผิดพลาด",
          text: data.message || "❌ อีเมลหรือรหัสผ่านไม่ถูกต้อง",
          confirmButtonColor: "#d33",
        });
        return;
      }

      // ✅ เก็บ token, role และ name
      localStorage.setItem("token", data.token);
      localStorage.setItem("role", data.user.roleid);
      localStorage.setItem("name", data.user.name);

      Swal.fire({
        icon: "success",
        title: "เข้าสู่ระบบสำเร็จ",
        text: `ยินดีต้อนรับ ${data.user.name || ""}`,
        showConfirmButton: false,
        timer: 1500,
      });

      // ✅ ไปหน้า dashboard ตาม role
      setTimeout(() => {
        if (data.user.roleid === "r1") {
          nav("/admin-dashboard");
        } else {
          nav("/user-dashboard");
        }
      }, 1600);

    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "warning",
        title: "เชื่อมต่อไม่ได้",
        text: "⚠️ ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="auth-hero">
        <h1>เข้าสู่ระบบ</h1>
        <p>กรอกอีเมลและรหัสผ่านของคุณเพื่อเข้าใช้งานระบบ</p>
      </section>

      <div className="card">
        <div className="card-inner">
          <form onSubmit={onSubmit}>
            <div className="label">อีเมล</div>
            <input
              className="input"
              type="email"
              name="email"
              placeholder="example@email.com"
              value={form.email}
              onChange={onChange}
              required
            />

            <div
              className="label"
              style={{ display: "flex", justifyContent: "space-between" }}
            >
              <span>รหัสผ่าน</span>
              <Link className="forgot" to="/forgot-password">
                ลืมรหัสผ่าน?
              </Link>
            </div>
            <input
              className="input"
              type="password"
              name="password"
              placeholder="********"
              value={form.password}
              onChange={onChange}
              required
            />

            <button className="btn-primary mt-8" type="submit" disabled={loading}>
              {loading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
            </button>
          </form>

          <div className="hr-or">หรือเข้าสู่ระบบด้วย</div>
          <div className="oauth-row">
            <button className="oauth">
              <img
                alt=""
                src="https://www.svgrepo.com/show/475656/google-color.svg"
              />
              Google
            </button>
            <button className="oauth">
              <img
                alt=""
                src="https://www.svgrepo.com/show/448224/facebook.svg"
              />
              Facebook
            </button>
          </div>

          <div className="card-footer">
            ยังไม่มีบัญชี? <Link to="/register">สมัครสมาชิก</Link>
          </div>
        </div>
      </div>
    </>
  );
}
