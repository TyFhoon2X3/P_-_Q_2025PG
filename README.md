# Car Repair Booking Management System

ระบบจัดการการจองซ่อมรถแบบครบวงจร ที่ช่วยให้ลูกค้าสามารถจองการซ่อมรถได้อย่างง่ายดาย และเจ้าของร้านสามารถจัดการการจองได้อย่างมีประสิทธิภาพ

## 📋 บทนำ

นี่คือแอปพลิเคชันเว็บแบบ Full-Stack ที่ใช้เทคโนโลยี:
- **Backend**: Node.js + Express + PostgreSQL
- **Frontend**: React + React Router + Axios
- **Authentication**: JWT (JSON Web Tokens)
- **Database**: PostgreSQL

## ✨ ฟีเจอร์หลัก

### 👤 สำหรับลูกค้า
- ✅ ลงทะเบียนและเข้าสู่ระบบ
- ✅ จัดการข้อมูลรถของคุณ (ทะเบียน, ยี่ห้อ, รุ่น, ประเภท)
- ✅ จองการซ่อมรถแบบออนไลน์
- ✅ ติดตามสถานะการจองแบบเรียลไทม์
- ✅ ดูประวัติการจองและการประเมิน
- ✅ เพิ่มอะไหล่หรือบริการซ่อมแซม
- ✅ ส่งข้อมูลการชำระเงิน (Slip)
- ✅ ให้คะแนนและเขียนรีวิว

### 👨‍💼 สำหรับผู้ดูแลระบบ (Admin)
- ✅ ดูแลลูกค้าทั้งหมด
- ✅ จัดการรถของลูกค้า
- ✅ ดูแลการจองทั้งหมด
- ✅ ปรับเปลี่ยนสถานะการจอง
- ✅ จัดการข้อมูลรายการซ่อม
- ✅ จัดการอะไหล่ (Parts)
- ✅ ดูแลรีวิวลูกค้า
- ✅ ตรวจสอบข้อมูลติดต่อ
- ✅ สร้างรายงานและสถิติ

## 🏗️ โครงสร้างโปรเจกต์

```
P_-_Q_2025PG/
├── Backend/                    # เซิร์ฟเวอร์ Node.js
│   ├── controllers/            # ตรรมชาติทางธุรกิจ
│   │   ├── authController.js
│   │   ├── bookingController.js
│   │   ├── customerController.js
│   │   ├── VehiclesController.js
│   │   ├── PartsController.js
│   │   ├── reviewController.js
│   │   └── ...
│   ├── routes/                 # กำหนดเส้นทาง API
│   │   ├── authRoutes.js
│   │   ├── bookingRoutes.js
│   │   ├── vehicleRoutes.js
│   │   └── ...
│   ├── middleware/             # Middleware (Auth, Protection)
│   │   ├── authenticateUser.js
│   │   └── authMiddleware.js
│   ├── db/                     # การเชื่อมต่อฐานข้อมูล
│   │   └── db.js
│   ├── uploads/                # สำหรับจัดเก็บไฟล์อัปโหลด
│   ├── index.js                # จุดเข้า Server
│   └── package.json
│
├── front/                      # React Frontend
│   ├── src/
│   │   ├── pages/              # หน้าของแอป
│   │   │   ├── Login.js
│   │   │   ├── Home.js
│   │   │   ├── BookService.js
│   │   │   ├── AdminDashboard.js
│   │   │   ├── AdminBookings.js
│   │   │   ├── AdminCustomers.js
│   │   │   └── ...
│   │   ├── components/         # React Components
│   │   │   ├── Navbar.js
│   │   │   ├── ProtectedRoute.js
│   │   │   └── ...
│   │   ├── styles/             # CSS Stylesheets
│   │   ├── api.js              # axios configuration
│   │   └── App.js              # หลัก React App
│   ├── public/
│   ├── package.json
│   └── README.md
│
└── README.md (ไฟล์นี้)
```

## 🔧 การติดตั้งและการใช้งาน

### ✅ ความต้องการ
- Node.js v14+ และ npm
- PostgreSQL v12+
- Git

### 📥 การติดตั้ง

#### 1. Clone Repository
```bash
git clone <repository-url>
cd P_-_Q_2025PG
```

#### 2. ตั้งค่า Backend

```bash
cd Backend
npm install
```

สร้างไฟล์ `.env` ในโฟลเดอร์ Backend:
```env
DB_HOST=localhost
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=your_password
DB_DATABASE=repair_shop_db
JWT_SECRET=your_secret_key_here
PORT=8080
```

รันเซิร์ฟเวอร์ Backend:
```bash
npm run dev    # ใช้ nodemon (พัฒนา)
# หรือ
npm start      # รัน node ปกติ
```

#### 3. ตั้งค่า Frontend

```bash
cd ../front
npm install
```

ในไฟล์ `src/api.js` ตรวจสอบ URL ของ Backend:
```javascript
const API_BASE_URL = "http://localhost:8080/api";
```

รัน Frontend:
```bash
npm start
```

Frontend จะเปิดที่ `http://localhost:3000`

## 🗄️ โครงสร้างฐานข้อมูล

ระบบใช้ PostgreSQL กับตารางหลักต่อไปนี้:

- **users** - ข้อมูลผู้ใช้ (ลูกค้า, Admin)
- **vehicles** - ข้อมูลรถของลูกค้า
- **bookings** - การจองการซ่อม
- **repair_items** - รายการซ่อมในแต่ละการจอง
- **parts** - อะไหล่ที่ใช้ได้
- **statuses** - สถานะการจอง
- **reviews** - รีวิวจากลูกค้า
- **roles** - บทบาท (Admin, User)
- **contacts** - ข้อมูลติดต่อจากแบบฟอร์ม

## 🔐 ระบบการรักษาความปลอดภัย

### Authentication
- ใช้ JWT สำหรับการรักษาความปลอดภัยของ API
- Password ถูกเข้ารหัสด้วย bcrypt
- Token จัดเก็บใน localStorage ของ Frontend

### Authorization
- ProtectedRoute ตรวจสอบบทบาทของผู้ใช้
- Admin routes ยอมรับเฉพาะ Admin เท่านั้น
- ลูกค้าสามารถเข้าถึงเฉพาะข้อมูลของตนเอง

## 📡 API Endpoints หลัก

### Authentication
- `POST /api/login` - เข้าสู่ระบบ
- `POST /api/register` - ลงทะเบียน

### Bookings
- `GET /api/bookings/mine` - ดึงการจองของฉัน
- `GET /api/bookings` (Admin) - ดึงการจองทั้งหมด
- `POST /api/bookings` - สร้างการจองใหม่
- `PUT /api/bookings/:id` - อัปเดตการจอง
- `PUT /api/bookings/:id/status` - เปลี่ยนสถานะ

### Vehicles
- `GET /api/vehicles` - ดึงรถของฉัน
- `POST /api/vehicles` - เพิ่มรถใหม่
- `PUT /api/vehicles/:id` - อัปเดตรถ
- `DELETE /api/vehicles/:id` - ลบรถ

### Customers
- `GET /api/customers` (Admin) - ดูลูกค้าทั้งหมด
- `PUT /api/customers/:id` - อัปเดตโปรไฟล์

### Parts
- `GET /api/parts` - ดึงอะไหล่
- `POST /api/parts` (Admin) - เพิ่มอะไหล่
- `PUT /api/parts/:id` (Admin) - อัปเดตอะไหล่

### Reviews
- `GET /api/reviews` - ดูรีวิวทั้งหมด
- `POST /api/reviews` - สร้างรีวิว

## 🎨 เทคโนโลยี

### Backend
| Package | เวอร์ชัน | วัตถุประสงค์ |
|---------|---------|-----------|
| Express | ^5.1.0 | Web Framework |
| pg | ^8.16.3 | PostgreSQL Client |
| bcrypt | ^6.0.0 | Password Hashing |
| jsonwebtoken | ^9.0.2 | JWT Authentication |
| cors | ^2.8.5 | Cross-Origin Requests |
| multer | ^2.0.2 | File Upload |
| dotenv | ^17.2.1 | Environment Variables |

### Frontend
| Package | เวอร์ชัน | วัตถุประสงค์ |
|---------|---------|-----------|
| React | ^19.1.1 | UI Framework |
| React Router | ^7.8.2 | Routing |
| Axios | ^1.12.2 | HTTP Client |
| Chart.js | ^4.5.0 | Charts/Graphs |
| jsPDF | ^2.5.1 | PDF Generation |
| SweetAlert2 | ^11.23.0 | Beautiful Alerts |

## 🚀 วิธีใช้งาน

### สำหรับลูกค้า

1. **ลงทะเบียน** - ไปที่หน้า Register และกรอกข้อมูล
2. **เข้าสู่ระบบ** - ใช้ email และ password
3. **เพิ่มรถของคุณ** - ไปที่ My Vehicles และเพิ่มรายละเอียดรถ
4. **จองการซ่อม** - คลิก Book Service เลือกรถและวันเวลา
5. **ติดตามสถานะ** - ตรวจสอบ Booking List เพื่อดูความคืบหน้า
6. **ให้คะแนน** - หลังจากการซ่อมเสร็จ ให้คะแนนและเขียนรีวิว

### สำหรับผู้ดูแลระบบ

1. **เข้าสู่ระบบ** - ใช้ข้อมูล Admin
2. **ดูแลการจอง** - ไปที่ Admin Bookings เพื่อจัดการการจอง
3. **ปรับเปลี่ยนสถานะ** - อัปเดตสถานะการจอง (รับหน้างาน, กำลังซ่อม, สำเร็จ ฯลฯ)
4. **จัดการลูกค้า** - ไปที่ Admin Customers เพื่อดูข้อมูลลูกค้า
5. **จัดการอะไหล่** - ดูแลรายการอะไหล่ที่มีอยู่
6. **ดูรีวิว** - ตรวจสอบรีวิวและการประเมินจากลูกค้า

## 📝 ไฟล์สำคัญ

| ไฟล์ | วัตถุประสงค์ |
|------|-----------|
| [Backend/index.js](Backend/index.js) | จุดเข้า Server หลัก |
| [Backend/db/db.js](Backend/db/db.js) | การเชื่อมต่อ PostgreSQL |
| [front/src/App.js](front/src/App.js) | หลัก React App & Routing |
| [front/src/api.js](front/src/api.js) | Axios API Configuration |
| [Backend/controllers](Backend/controllers/) | ตรรมชาติทางธุรกิจ |
| [Backend/routes](Backend/routes/) | กำหนด API Routes |
| [front/src/pages](front/src/pages/) | React Pages |

## 🐛 Troubleshooting

### Backend ไม่เชื่อมต่อฐานข้อมูล
- ตรวจสอบ `.env` มี `DB_HOST`, `DB_USER`, `DB_PASSWORD` ที่ถูกต้อง
- ตรวจสอบว่า PostgreSQL เปิดใช้งาน
- ตรวจสอบชื่อฐานข้อมูล

### Frontend ไม่เชื่อมต่อ Backend
- ตรวจสอบ Backend ทำงานอยู่ที่พอร์ต 8080
- ตรวจสอบ CORS ในไฟล์ Backend/index.js
- เปิด Browser DevTools ดู Error Message

### JWT Token หมดอายุ
- ลบ localStorage แล้วเข้าสู่ระบบใหม่
- ตรวจสอบ JWT_SECRET ในไฟล์ .env

## 📧 ติดต่อและสนับสนุน

สำหรับคำถามหรือปัญหา กรุณา:
- ตรวจสอบหน้า Issues ใน GitHub
- ติดต่อผู้พัฒนา
- อ่านเอกสารเพิ่มเติมใน Backend/README.md

## 📄 ลิขสิทธิ์

โปรเจกต์นี้เป็นส่วนหนึ่งของการศึกษาปี 2025PG

---

**Last Updated**: January 2026
**Version**: 1.0.0
**Status**: In Development ✅