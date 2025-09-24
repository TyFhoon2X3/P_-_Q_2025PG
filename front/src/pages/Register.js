// src/pages/Register.js
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Swal from "sweetalert2";
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
      const res = await fetch("http://localhost:3000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        Swal.fire({
          icon: "error",
          title: "Register Failed",
          text: data.message || "เกิดข้อผิดพลาด",
        });
        return;
      }

      Swal.fire({
        icon: "success",
        title: "✅ Register สำเร็จ!",
        text: "สามารถล็อกอินได้เลย",
        timer: 1500,
        showConfirmButton: false,
      }).then(() => nav("/login"));
    } catch (err) {
      console.error(err);
      Swal.fire({
        icon: "error",
        title: "Network Error",
        text: "Server ไม่ตอบสนอง",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <section className="auth-hero">
        <h1>Create Your Account</h1>
        <p>Fill in your details to register.</p>
      </section>

      <div className="card">
        <div className="card-inner">
          <form onSubmit={onSubmit}>
            <div className="label">Full Name</div>
            <input
              className="input"
              name="name"
              placeholder="Your Name"
              value={form.name}
              onChange={onChange}
              required
            />

            <div className="label">Email Address</div>
            <input
              className="input"
              name="email"
              placeholder="YOU@MAIL.COM"
              value={form.email}
              onChange={onChange}
              required
            />

            <div className="label">Password</div>
            <input
              className="input"
              type="password"
              name="password"
              placeholder="********************"
              value={form.password}
              onChange={onChange}
              required
            />

            <div className="label">Phone Number</div>
            <input
              className="input"
              type="text"
              name="phone"
              placeholder="0812345678"
              value={form.phone}
              onChange={onChange}
              required
            />

            <div className="label">Address</div>
            <input
              className="input"
              type="text"
              name="address"
              placeholder="123 Main St, Bangkok"
              value={form.address}
              onChange={onChange}
              required
            />

            <button className="btn-primary mt-8" type="submit" disabled={loading}>
              {loading ? "Registering..." : "REGISTER"}
            </button>
          </form>

          <div className="card-footer">
            Already have an account? <Link to="/login">Login here</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
// src/pages/UserDashboard.js