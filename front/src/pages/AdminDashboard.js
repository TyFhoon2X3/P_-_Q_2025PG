import React, { useEffect, useState } from "react";
import axios from "axios";
import {
  BarChart,
  Bar,
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

export default function VehicleStatsPage() {
  const [brandStats, setBrandStats] = useState([]);
  const [typeStats, setTypeStats] = useState([]);
  const [parts, setParts] = useState([]);

  const token = localStorage.getItem("token"); // JWT

  useEffect(() => {
    // 🚗 ดึงจำนวนรถตามยี่ห้อ
    axios
      .get("http://localhost:3000/api/vehicles/stats/brand", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) {
          const cleaned = res.data.stats.map((item) => ({
            brandname: item.brandname,
            total: Number(item.total),
          }));
          setBrandStats(cleaned);
        }
      })
      .catch((err) => console.error("Error fetching brand stats:", err));

    // 🚙 ดึงจำนวนรถตามประเภท
    axios
      .get("http://localhost:3000/api/vehicles/stats/type", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) {
          const cleaned = res.data.stats.map((item) => ({
            typename: item.typename,
            total: Number(item.total),
          }));
          setTypeStats(cleaned);
        }
      })
      .catch((err) => console.error("Error fetching type stats:", err));

    // 🔧 ดึงข้อมูลอะไหล่
    axios
      .get("http://localhost:3000/api/parts", {
        headers: { Authorization: `Bearer ${token}` },
      })
      .then((res) => {
        if (res.data.success) {
          setParts(res.data.parts || []);
        }
      })
      .catch((err) => console.error("Error fetching parts:", err));
  }, [token]);

  // กราฟแท่ง: จำนวนอะไหล่
  const barParts = parts.map((p) => ({
    name: p.name,
    quantity: Number(p.quantity),
  }));

  // กราฟวงกลม: สัดส่วนยี่ห้ออะไหล่
  const brandCounts = parts.reduce((acc, p) => {
    acc[p.marque] = (acc[p.marque] || 0) + Number(p.quantity);
    return acc;
  }, {});
  const pieParts = Object.keys(brandCounts).map((k) => ({
    name: k,
    value: brandCounts[k],
  }));

  const COLORS = ["#8884d8", "#82ca9d", "#ffc658", "#ff7f50", "#a4de6c", "#d0ed57"];

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-10 text-center text-gray-800">
        📊 Dashboard สถิติรถ & อะไหล่
      </h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* กราฟจำนวนรถตามยี่ห้อ */}
        <div className="bg-white shadow-lg rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4">🚗 จำนวนรถตามยี่ห้อ</h2>
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

        {/* กราฟจำนวนรถตามประเภท */}
        <div className="bg-white shadow-lg rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4">🚙 จำนวนรถตามประเภท</h2>
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

        {/* กราฟจำนวนอะไหล่ */}
        <div className="bg-white shadow-lg rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4">🔧 จำนวนอะไหล่</h2>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={barParts}>
              <CartesianGrid strokeDasharray="3 3" stroke="#eee" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="quantity" fill="#f97316" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* กราฟสัดส่วนยี่ห้ออะไหล่ */}
        <div className="bg-white shadow-lg rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4">⚙️ สัดส่วนยี่ห้ออะไหล่</h2>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={pieParts}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label
              >
                {pieParts.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
