import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";

export default function BookingDetail() {
    const { id } = useParams();
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchBooking = async () => {
            try {
                const token = localStorage.getItem("token");
                const res = await fetch(`http://localhost:3000/api/bookings/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                });
                const json = await res.json();
                setData(json);
            } catch (err) {
                console.error("โหลด booking detail error:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchBooking();
    }, [id]);

    if (loading) return <div>⏳ กำลังโหลด...</div>;
    if (!data?.success) return <div>❌ ไม่พบ booking</div>;

    const booking = data.booking;
    const items = data.repair_items || [];

    return (
        <div className="page-container" style={{ maxWidth: "900px", margin: "24px auto", padding: "0 16px" }}>
            <h1 className="page-title">📋 รายละเอียดการจอง #{booking.booking_id}</h1>

            <div className="card" style={{ padding: "16px", marginBottom: "24px" }}>
                <p><strong>วันที่:</strong> {new Date(booking.date).toLocaleDateString()}</p>
                <p><strong>เวลา:</strong> {booking.time}</p>
                <p><strong>รายละเอียด:</strong> {booking.description}</p>
                <p><strong>ค่าซ่อม:</strong> {booking.cost} ฿</p>
                <p><strong>ค่าบริการ:</strong> {booking.service} ฿</p>
                <p><strong>ค่าขนส่ง:</strong> {booking.freight} ฿</p>
                <h3 style={{ marginTop: "12px", color: "green" }}>💰 รวมทั้งหมด: {booking.total_price} ฿</h3>
            </div>

            <div className="card" style={{ padding: "16px" }}>
                <h2>🛠 รายการอะไหล่</h2>
                {items.length === 0 ? (
                    <p style={{ color: "gray" }}>ไม่มีข้อมูลอะไหล่</p>
                ) : (
                    <table className="table" style={{ width: "100%", borderCollapse: "collapse", marginTop: "12px" }}>
                        <thead>
                            <tr style={{ borderBottom: "1px solid #ddd" }}>
                                <th style={{ padding: "8px" }}>อะไหล่</th>
                                <th style={{ padding: "8px" }}>ยี่ห้อ</th>
                                <th style={{ padding: "8px" }}>จำนวน</th>
                                <th style={{ padding: "8px" }}>ราคาต่อหน่วย</th>
                                <th style={{ padding: "8px" }}>รวม</th>
                            </tr>
                        </thead>
                        <tbody>
                            {items.map((item, idx) => (
                                <tr key={idx} style={{ borderBottom: "1px solid #eee" }}>
                                    <td style={{ padding: "8px" }}>{item.partname}</td>
                                    <td style={{ padding: "8px" }}>{item.marque || "-"}</td>
                                    <td style={{ padding: "8px" }}>{item.quantity}</td>
                                    <td style={{ padding: "8px" }}>{item.unit_price} ฿</td>
                                    <td style={{ padding: "8px" }}>{item.subtotal} ฿</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
