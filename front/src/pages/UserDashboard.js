import React, { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/UserDashboard.css";

export default function UserDashboard() {
  const [user, setUser] = useState({ name: "..." });
  const [stats, setStats] = useState({
    vehicles: 0,
    pending: 0,
    history: 0,
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem("token");
      const headers = { Authorization: `Bearer ${token}` };

      // Parallel Fetching
      const [profileRes, vehiclesRes, bookingsRes] = await Promise.all([
        axios.get("http://localhost:3000/api/profile", { headers }),
        axios.get("http://localhost:3000/api/vehicles/mine", { headers }),
        axios.get("http://localhost:3000/api/bookings/mine", { headers }),
      ]);

      // 1. Set User Profile
      if (profileRes.data.success) {
        setUser(profileRes.data.profile);
      }

      // 2. Set Stats
      const vehiclesCount = vehiclesRes.data.vehicles.length;
      const allBookings = bookingsRes.data.bookings;

      // Assuming status_id 4=completed, 5=cancelled (adjust based on your logic)
      // Let's assume pending is anything NOT completed(3/4/5???)
      // Actually based on previous steps, let's treat "Pending" as status 1 or 2
      // And "History" as status 3, 4, 5
      // Or simply: "Pending" = !completed
      const pendingBookings = allBookings.filter((b) => b.status_id === 1 || b.status_id === 2);
      const historyBookings = allBookings.filter((b) => b.status_id >= 3);

      setStats({
        vehicles: vehiclesCount,
        pending: pendingBookings.length,
        history: historyBookings.length,
      });

      // 3. Set Recent Activity (Take top 3)
      setRecentActivity(allBookings.slice(0, 3));

      setLoading(false);
    } catch (err) {
      console.error("Error fetching dashboard data:", err);
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return {
      day: date.getDate(),
      month: date.toLocaleDateString("th-TH", { month: "short" }),
    };
  };

  const getStatusClass = (statusId) => {
    if (statusId === 1) return "status-pending"; // รอรับรถ
    if (statusId === 2) return "status-working"; // กำลังซ่อม
    if (statusId === 3 || statusId === 4) return "status-completed"; // เสร็จสิ้น
    return "status-pending";
  };

  const getStatusLabel = (statusName, statusId) => {
    // If status_name is joined from backend, use it. Otherwise fallback.
    return statusName || (statusId === 1 ? "รอการยืนยัน" : "สถานะ " + statusId);
  };

  if (loading) return <div className="p-10 text-center text-white">⏳ กำลังโหลดข้อมูล...</div>;

  return (
    <div className="user-dashboard">
      {/* Welcome Banner */}
      <div className="welcome-banner">
        <div className="welcome-text">
          <h1>ยินดีต้อนรับ, {user.name}</h1>
          <p>จัดการรถของคุณและติดตามสถานะการซ่อมได้ง่ายๆ ที่นี่</p>
        </div>
        <div className="welcome-icon">👋</div>
      </div>

      {/* Stats Cards */}
      <div className="dashboard-stats">
        <div className="stat-card">
          <div className="stat-icon vehicle">🚗</div>
          <div className="stat-info">
            <h3>รถของฉัน</h3>
            <span className="value">{stats.vehicles}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon booking">📅</div>
          <div className="stat-info">
            <h3>การจองที่รออยู่</h3>
            <span className="value">{stats.pending}</span>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon service">✅</div>
          <div className="stat-info">
            <h3>ประวัติการซ่อม</h3>
            <span className="value">{stats.history}</span>
          </div>
        </div>
      </div>

      {/* Dashboard Grid */}
      <div className="dashboard-grid">
        {/* Quick Actions */}
        <div className="section-card actions-section">
          <div className="section-header">
            <h2>⚡ เมนูด่วน</h2>
          </div>
          <div className="action-buttons">
            <Link to="/book-service" className="btn-action">
              <span className="action-icon">📅</span>
              <span>จองคิวซ่อมใหม่</span>
            </Link>
            <Link to="/my-vehicles" className="btn-action">
              <span className="action-icon">🚘</span>
              <span>จัดการรถของฉัน</span>
            </Link>
            <Link to="/bookings" className="btn-action">
              <span className="action-icon">📋</span>
              <span>ประวัติการจอง</span>
            </Link>
          </div>
        </div>

        {/* Recent Activity */}
        <div className="section-card activity-section">
          <div className="section-header">
            <h2>🕒 กิจกรรมล่าสุด</h2>
            <Link to="/bookings" className="text-link">ดูทั้งหมด</Link>
          </div>
          <div className="activity-list">
            {recentActivity.length === 0 ? (
              <p className="text-gray-400 text-center py-4">ยังไม่มีกิจกรรมล่าสุด</p>
            ) : (
              recentActivity.map((item) => {
                const { day, month } = formatDate(item.date);
                return (
                  <div className="activity-item" key={item.booking_id}>
                    <div className="activity-info">
                      <div className="activity-date">
                        <span className="day">{day}</span>
                        <span className="month">{month}</span>
                      </div>
                      <div className="activity-details">
                        <h4>{item.description}</h4>
                        <p>
                          {item.brandname} {item.model} - {item.license_plate}
                        </p>
                      </div>
                    </div>
                    <span className={`status-badge ${getStatusClass(item.status_id)}`}>
                      {getStatusLabel(item.status_name, item.status_id)}
                    </span>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
