import { useEffect, useState } from "react";
import { api } from "../api";

export default function MyVehicles() {
  const [vehicles, setVehicles] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVehicles = async () => {
    try {
      // ✅ เรียก API รถของ user
      const data = await api("/api/vehicles/mine", {
        method: "POST",
        body: { user_id: 1 } // TODO: ดึง user_id จาก localStorage หรือ token
      });
      setVehicles(data.vehicles || []);
    } catch (err) {
      console.error("โหลดข้อมูลรถ error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVehicles();
  }, []);

  if (loading) return <div>⏳ กำลังโหลด...</div>;

  return (
    <div className="page-container" style={{ maxWidth: "900px", margin: "24px auto", padding: "0 16px" }}>
      <h1 className="page-title">🚙 รถของฉัน</h1>

      <div className="card" style={{ padding: "16px" }}>
        {vehicles.length === 0 ? (
          <p style={{ color: "gray" }}>ยังไม่มีข้อมูลรถ</p>
        ) : (
          <table className="table" style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th>ยี่ห้อ</th>
                <th>รุ่น</th>
                <th>ทะเบียน</th>
                <th>ประเภทรถ</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((v) => (
                <tr key={v.vehicle_id}>
                  <td>{v.brandname}</td>
                  <td>{v.model}</td>
                  <td>{v.license_plate}</td>
                  <td>{v.typename}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
