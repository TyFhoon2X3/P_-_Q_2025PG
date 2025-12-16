import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import "../styles/Dashboard.css"; // ✅ import css ใหม่

export default function VehicleStatsPage() {
  const [brandStats, setBrandStats] = useState([]);
  const [typeStats, setTypeStats] = useState([]);
  const [parts, setParts] = useState([]);
  const [statusStats, setStatusStats] = useState([]);
  const token = localStorage.getItem("token");

  useEffect(() => {
    const headers = { Authorization: `Bearer ${token}` };

    // 🚗 จำนวนรถตามยี่ห้อ
    axios.get("http://localhost:3000/api/vehicles/stats/brand", { headers }).then((res) => {
      if (res.data.success) {
        setBrandStats(
          res.data.stats.map((i) => ({
            brandname: i.brandname,
            total: Number(i.total),
          }))
        );
      }
    });

    // 🚙 จำนวนรถตามประเภท
    axios.get("http://localhost:3000/api/vehicles/stats/type", { headers }).then((res) => {
      if (res.data.success) {
        setTypeStats(
          res.data.stats.map((i) => ({
            typename: i.typename,
            total: Number(i.total),
          }))
        );
      }
    });

    // 🔧 ข้อมูลอะไหล่ทั้งหมด
    axios.get("http://localhost:3000/api/parts", { headers }).then((res) => {
      if (res.data.success) setParts(res.data.parts || []);
    });

    // 🧰 สถานะงานซ่อมทั้งหมด
    axios.get("http://localhost:3000/api/bookings", { headers }).then((res) => {
      if (res.data.success) {
        const counts = {};
        res.data.bookings.forEach((b) => {
          counts[b.status_id] = (counts[b.status_id] || 0) + 1;
        });
        const mapped = [
          { name: "⏳ รอช่าง", value: counts[1] || 0, color: "#f0ad4e" },
          { name: "🔧 กำลังซ่อม", value: counts[2] || 0, color: "#0275d8" },
          { name: "💰 รอชำระเงิน", value: counts[5] || 0, color: "#8b5cf6" },
          { name: "✅ เสร็จแล้ว", value: counts[3] || 0, color: "#5cb85c" },
          { name: "❌ ยกเลิก", value: counts[4] || 0, color: "#d9534f" },
        ];
        setStatusStats(mapped);
      }
    });
  }, [token]);

  // 🔧 กราฟจำนวนอะไหล่
  const barParts = parts.map((p) => ({
    name: p.name,
    quantity: Number(p.quantity),
  }));

  // ⚙️ สัดส่วนยี่ห้ออะไหล่
  const brandCounts = parts.reduce((acc, p) => {
    acc[p.marque] = (acc[p.marque] || 0) + Number(p.quantity);
    return acc;
  }, {});
  const lineParts = Object.keys(brandCounts).map((k) => ({
    name: k,
    value: brandCounts[k],
  }));

  return (
    <div className="dashboard-container">
      <h1 className="dashboard-title">📊 Dashboard สถิติรถ & งานซ่อม</h1>

      {/* ✅ Info Cards */}
      <div className="info-cards">
        {statusStats.map((s, i) => (
          <div key={i} className="info-card">
            <h3>{s.name}</h3>
            <p style={{ color: s.color }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* ✅ Charts */}
      <div className="chart-grid">
        <div className="chart-card">
          <h2>🚗 จำนวนรถตามยี่ห้อ</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={brandStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="brandname" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#4f46e5" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>🚙 จำนวนรถตามประเภท</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={typeStats}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="typename" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="total" fill="#10b981" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="chart-card">
          <h2>🧰 สถานะการซ่อมทั้งหมด</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={statusStats}
                dataKey="value"
                nameKey="name"
                innerRadius={60} // 👈 เพิ่มตรงนี้
                outerRadius={100}
                label
              >
                {statusStats.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>


        <div className="chart-card">
          <h2>⚙️ สัดส่วนยี่ห้ออะไหล่</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineParts}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#f97316"
                strokeWidth={3}
                dot={{ r: 5, fill: "#f97316" }}
                label={{ position: "top" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
