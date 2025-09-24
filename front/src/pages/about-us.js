import React from "react";
import "../styles/about-us.css"; // ✅ ใช้ไฟล์ CSS แยก
import Swal from "sweetalert2";



export default function AboutUs() {
  return (
    <div className="about-container">
      <h1 className="about-title">ℹ️ About Us</h1>
      <p className="about-subtitle">
        <strong>P & Q Garage</strong> อู่ซ่อมรถครบวงจรที่มุ่งเน้นการบริการด้วยคุณภาพ
        และความเชื่อมั่นจากลูกค้า
      </p>

      <div className="about-section">
        <h2>👨‍🔧 ทีมงานมืออาชีพ</h2>
        <p>
          ทีมช่างของเรามีความเชี่ยวชาญสูง ผ่านการอบรมและมีประสบการณ์
          พร้อมที่จะดูแลรถของคุณอย่างดีที่สุด
        </p>
      </div>

      <div className="about-section">
        <h2>⚙️ บริการครบวงจร</h2>
        <p>
          เรามีบริการหลากหลาย ไม่ว่าจะเป็นตรวจเช็คเครื่องยนต์ 
          เปลี่ยนถ่ายน้ำมันเครื่อง ซ่อมแอร์รถยนต์ และอีกมากมาย
        </p>
      </div>

      <div className="about-section">
        <h2>📈 เป้าหมายของเรา</h2>
        <p>
          เราตั้งใจพัฒนาเทคโนโลยีและการให้บริการ
          เพื่อให้ลูกค้าได้รับความสะดวกสบายและความปลอดภัยสูงสุด
        </p>
      </div>
    </div>
  );
}
