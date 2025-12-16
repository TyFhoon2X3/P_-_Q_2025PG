import { Link } from "react-router-dom";
import "../styles/Home.css";

export default function Home() {
    return (
        <div className="home-container">
            <div className="home-hero">
                <div className="hero-content">
                    <h1 className="hero-title">
                        P&Q Garage <span className="text-accent">Auto Repair</span>
                    </h1>
                    <p className="hero-subtitle">
                        บริการซ่อมรถครบวงจรระดับพรีเมียม ดูแลใส่ใจทุกรายละเอียด
                        ด้วยทีมช่างมืออาชีพและเครื่องมือทันสมัย
                    </p>
                    <div className="hero-actions">
                        <Link to="/book-service" className="btn btn-primary">
                            จองคิวซ่อมทันที
                        </Link>
                        <Link to="/about-us" className="btn btn-outline">
                            เกี่ยวกับเรา
                        </Link>
                    </div>
                </div>
            </div>

            <div className="features-section container">
                <div className="feature-card">
                    <div className="feature-icon">🔧</div>
                    <h3>บริการครบวงจร</h3>
                    <p>ซ่อมเครื่องยนต์ ช่วงล่าง เบรก และเช็คระยะมาตรฐาน</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">⚡</div>
                    <h3>รวดเร็ว ทันใจ</h3>
                    <p>แจ้งสถานะการซ่อมแบบ Real-time ผ่านระบบออนไลน์</p>
                </div>
                <div className="feature-card">
                    <div className="feature-icon">🛡️</div>
                    <h3>รับประกันงานซ่อม</h3>
                    <p>มั่นใจได้ด้วยการรับประกันอะไหล่และงานบริการ</p>
                </div>
            </div>

            <section className="why-choose-us container">
                <div className="why-content">
                    <h2>ทำไมต้องเลือก <span className="text-accent">P & Q Garage</span></h2>
                    <p>เรามุ่งมั่นให้บริการที่ดีที่สุดเพื่อรถที่คุณรักด้วยมาตรฐานสากล</p>
                    <ul className="benefits-list">
                        <li>✅ ทีมช่างผู้ชำนาญการประสบการณ์กว่า 10 ปี</li>
                        <li>✅ เครื่องมือวิเคราะห์ปัญหาที่ทันสมัยแม่นยำ</li>
                        <li>✅ ใช้อะไหล่แท้และอะไหล่เกรดพรีเมียมเท่านั้น</li>
                        <li>✅ ประเมินราคาก่อนซ่อม ไม่มีค่าใช้จ่ายแอบแฝง</li>
                    </ul>
                </div>
                <div className="why-stats">
                    <div className="stat-item">
                        <span className="stat-number">5000+</span>
                        <span className="stat-label">รถที่เข้าใช้บริการ</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">99%</span>
                        <span className="stat-label">ความพึงพอใจลูกค้า</span>
                    </div>
                    <div className="stat-item">
                        <span className="stat-number">10+</span>
                        <span className="stat-label">ปีแห่งความเชี่ยวชาญ</span>
                    </div>
                </div>
            </section>
        </div>
    );
}
