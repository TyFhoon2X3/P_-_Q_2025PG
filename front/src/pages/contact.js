import React from "react";
import "../styles/contact.css"; 

export default function Contact() {
  return (
    <div className="contact-container">
      <h1 className="contact-title">📞 Contact Us</h1>
      <p className="contact-subtitle">
        หากคุณต้องการติดต่อ <strong>P & Q Garage</strong> 
        สามารถติดต่อเราได้ตามช่องทางด้านล่างนี้
      </p>

      <div className="contact-section">
        <h3>🏠 ที่อยู่</h3>
        <p>123 ถนนหลัก ตำบลเมือง อำเภอหาดใหญ่ จังหวัดสงขลา 90110</p>
      </div>

      <div className="contact-section">
        <h3>📞 โทรศัพท์</h3>
        <p>074-123456, 081-234-5678</p>
      </div>

      <div className="contact-section">
        <h3>📧 อีเมล</h3>
        <p>pqgarage@example.com</p>
      </div>

      <div className="contact-section">
        <h3>🕐 เวลาทำการ</h3>
        <p>จันทร์ – เสาร์ : 08:30 – 18:00 น.</p>
        <p>หยุดวันอาทิตย์</p>
      </div>
    </div>
  );
}
