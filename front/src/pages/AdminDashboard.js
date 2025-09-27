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
} from "recharts";

export default function VehicleStatsPage() {
  const [brandStats, setBrandStats] = useState([]);
  const [typeStats, setTypeStats] = useState([]);

  const token = localStorage.getItem("token"); // JWT เก็บใน localStorage

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
            total: Number(item.total), // แปลง string → number
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
  }, [token]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6 text-center">📊 Vehicle Statistics Dashboard</h1>

      {/* กราฟจำนวนรถตามยี่ห้อ */}
      <div className="mb-12">
        <h2 className="text-xl font-semibold mb-4">จำนวนรถตามยี่ห้อ</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={brandStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="brandname" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#8884d8" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* กราฟจำนวนรถตามประเภท */}
      <div>
        <h2 className="text-xl font-semibold mb-4">จำนวนรถตามประเภท</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={typeStats} margin={{ top: 20, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="typename" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="total" fill="#82ca9d" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
