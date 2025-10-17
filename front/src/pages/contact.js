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
        <p>เลขที่ 88/9 ถนน 4153 ต.หนองไทร อ. พุนพิน จ.สุราษฎร์ธานี 84000</p>
      </div>

      <div className="contact-section">
        <h3>📞 โทรศัพท์</h3>
        <p>0837607387</p>
      </div>

      <div className="contact-section">
        <h3>📧 อีเมล</h3>
        <p>pqgarage@gmail.com</p>
      </div>

      <div className="contact-section">
        <h3>🕐 เวลาทำการ</h3>
        <p>จันทร์ – เสาร์ : 08:30 – 18:00 น.</p>
        <p>หยุดทุกวันอาทิตย์</p>
      </div>
    </div>
  );
}
