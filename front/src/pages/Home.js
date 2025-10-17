import "../styles/homepagr.css"; // ✅ ใช้ไฟล์ CSS แยก



export default function Home() {
  return (
    <div className="home-container">
      {/* วงกลมตกแต่งพื้นหลัง */}
      <div className="home-bg-circle circle1"></div>
      <div className="home-bg-circle circle2"></div>

      {/* เนื้อหาหลัก */}
      <div className="home-content">
        <div className="logo-box">🚗</div>

        <h1 className="home-title">
          ยินดีต้อนรับสู่ <span>P & Q Garage</span>
        </h1>
        <p className="home-desc">
          ระบบจองคิวซ่อมรถยนต์ ตรวจสอบสถานะ ดูค่าใช้จ่าย และจัดการข้อมูลครบวงจร ⚙️  
          พร้อมทีมช่างมืออาชีพและบริการมาตรฐานเพื่อรถของคุณ
        </p>

        <div className="home-buttons">
          <button
            className="btn btn-login"
            onClick={() => (window.location.href = "/login")}
          >
            🔐 เข้าสู่ระบบ
          </button>
          <button
            className="btn btn-register"
            onClick={() => (window.location.href = "/register")}
          >
            📝 สมัครสมาชิก
          </button>
        </div>
      </div>

      {/* ส่วนบริการ */}
      <section className="services-section">
        <h2 className="services-title">🛠️ บริการของเรา</h2>
        <div className="services-grid">
          <div className="service-card">
            <div className="icon">🔧</div>
            <h3>ซ่อมทั่วไป</h3>
            <p>ให้บริการตรวจเช็กและซ่อมรถทุกประเภท ด้วยเครื่องมือที่ทันสมัย</p>
          </div>

          <div className="service-card">
            <div className="icon">🛢️</div>
            <h3>เปลี่ยนน้ำมันเครื่อง</h3>
            <p>ใช้น้ำมันเครื่องคุณภาพสูง เพิ่มประสิทธิภาพการทำงานของเครื่องยนต์</p>
          </div>

          <div className="service-card">
            <div className="icon">🚿</div>
            <h3>ล้างรถฟรีหลังซ่อม</h3>
            <p>ทุกครั้งหลังซ่อม รับบริการล้างรถฟรีเพื่อความสะอาดและความประทับใจ</p>
          </div>
        </div>
      </section>

      <footer className="home-footer">
        © {new Date().getFullYear()} P & Q Garage — Powered by PSU IT 💻
      </footer>
    </div>
  );
}
