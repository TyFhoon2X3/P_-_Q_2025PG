
import React, { useState } from "react";
import "../styles/contact.css";
import { Mail, Phone, MapPin, Clock } from "lucide-react";
import Swal from "sweetalert2";
import axios from "axios";

export default function Contact() {
  const [formData, setFormData] = useState({
    name: "",
    phone: "",
    subject: "สอบถามราคาอะไหล่",
    message: ""
  });

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log("Form Data:", formData);

    // Simulate Loading
    Swal.fire({
      title: "กำลังส่งข้อความ...",
      didOpen: () => {
        Swal.showLoading();
      }
    });

    try {
      const res = await axios.post("http://localhost:3000/api/contact", formData);
      if (res.data.success) {
        Swal.fire({
          icon: "success",
          title: "ส่งข้อความเรียบร้อย!",
          text: "เจ้าหน้าที่จะติดต่อกลับให้เร็วที่สุดครับ",
          confirmButtonText: "ตกลง"
        });
        setFormData({ name: "", phone: "", subject: "สอบถามราคาอะไหล่", message: "" });
      }
    } catch (err) {
      console.error("Error sending message:", err);
      Swal.fire({
        icon: "error",
        title: "ส่งข้อความไม่สำเร็จ",
        text: "กรุณาลองใหม่อีกครั้ง หรือติดต่อผ่านเบอร์โทรศัพท์",
        confirmButtonText: "ปิด"
      });
    }
  };

  return (
    <div className="contact-page">
      <div className="contact-hero">
        <div className="contact-hero-content">
          <h1 className="contact-title">ติดต่อเรา</h1>
          <p className="contact-subtitle">
            เราพร้อมให้คำปรึกษาและดูแลรถของคุณดุจรถของเราเอง
            สอบถามข้อมูลเพิ่มเติมหรือนัดหมายได้ตลอดเวลา
          </p>
        </div>
      </div>

      <div className="contact-container container">
        <div className="contact-grid">
          {/* Info Side */}
          <div className="contact-info-wrapper">
            <h2>ข้อมูลการติดต่อ</h2>
            <p className="info-desc">
              มีข้อสงสัยหรือต้องการประเมินราคาซ่อมเบื้องต้น?
              ติดต่อเราได้ตามช่องทางด้านล่าง
            </p>

            <div className="info-cards">
              <div className="info-card">
                <div className="info-icon">📍</div>
                <div>
                  <h3>ที่อยู่</h3>
                  <p>123 ถนนเพชรเกษม หาดใหญ่ สงขลา 90110</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">📞</div>
                <div>
                  <h3>โทรศัพท์</h3>
                  <p>074-123-456</p>
                  <p>081-999-8888</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">📧</div>
                <div>
                  <h3>อีเมล</h3>
                  <p>support@pqgarage.com</p>
                  <p>service@pqgarage.com</p>
                </div>
              </div>

              <div className="info-card">
                <div className="info-icon">⏰</div>
                <div>
                  <h3>เวลาทำการ</h3>
                  <p>จันทร์ - เสาร์: 08:30 - 17:30</p>
                  <p>หยุดวันอาทิตย์</p>
                </div>
              </div>
            </div>
          </div>

          {/* Form Side */}
          <div className="contact-form-wrapper">
            <form className="contact-form" onSubmit={handleSubmit}>
              <h3>ส่งข้อความถึงเรา</h3>
              <div className="form-group">
                <label>ชื่อ - นามสกุล</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="ระบุชื่อของคุณ"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>เบอร์โทรศัพท์</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleChange}
                  placeholder="ระบุเบอร์โทรศัพท์"
                  className="form-input"
                  required
                />
              </div>
              <div className="form-group">
                <label>เรื่องที่ต้องการติดต่อ</label>
                <select
                  className="form-select"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                >
                  <option>สอบถามราคาอะไหล่</option>
                  <option>จองคิวซ่อม</option>
                  <option>ปรึกษาปัญหาเครื่องยนต์</option>
                  <option>อื่นๆ</option>
                </select>
              </div>
              <div className="form-group">
                <label>ข้อความเพิ่มเติม</label>
                <textarea
                  rows="4"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder="รายละเอียดที่ต้องการสอบถาม..."
                  className="form-input"
                  required
                ></textarea>
              </div>
              <button type="submit" className="btn-submit">ส่งข้อความ</button>
            </form>
          </div>
        </div>

        {/* Map Section */}
        <div className="map-section">
          <iframe
            title="Google Map"
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d63408.83296860642!2d100.43236245367503!3d6.99616892556531!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x304df393b749666b%3A0x30223bc2c366430!2sHat%20Yai%2C%20Hat%20Yai%20District%2C%20Songkhla!5e0!3m2!1sen!2sth!4v1703606629940!5m2!1sen!2sth"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen=""
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
          ></iframe>
        </div>
      </div>
    </div>
  );
}
