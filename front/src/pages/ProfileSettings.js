import { useState, useEffect } from "react";
import { api } from "../api";
import Swal from "sweetalert2";
import {
    User, Mail, Phone, MapPin, Lock, Save, Key,
    ChevronRight, Camera, Shield, UserCircle
} from "lucide-react";
import "../styles/common.css";

export default function ProfileSettings() {
    const [activeTab, setActiveTab] = useState("profile");
    const [profile, setProfile] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
    });
    const [passwords, setPasswords] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        fetchProfile();
    }, []);

    const fetchProfile = async () => {
        try {
            const res = await api("/api/profile");
            if (res.success) {
                setProfile({
                    name: res.profile.name || "",
                    email: res.profile.email || "",
                    phone: res.profile.phone || "",
                    address: res.profile.address || "",
                });
            }
        } catch (err) {
            console.error("Fetch profile failed:", err);
        } finally {
            setLoading(false);
        }
    };

    const handleProfileChange = (e) => {
        setProfile({ ...profile, [e.target.name]: e.target.value });
    };

    const handlePasswordChange = (e) => {
        setPasswords({ ...passwords, [e.target.name]: e.target.value });
    };

    const updateProfile = async (e) => {
        e.preventDefault();
        setSaving(true);
        try {
            const res = await api("/api/profile", {
                method: "PUT",
                body: profile,
            });
            if (res.success) {
                Swal.fire({
                    icon: "success",
                    title: "สำเร็จ",
                    text: "อัปเดตข้อมูลส่วนตัวเรียบร้อย",
                    timer: 2000,
                    showConfirmButton: false,
                });
                localStorage.setItem("name", profile.name);
            }
        } catch (err) {
            Swal.fire("ข้อผิดพลาด", err.message, "error");
        } finally {
            setSaving(false);
        }
    };

    const updatePassword = async (e) => {
        e.preventDefault();
        if (passwords.newPassword !== passwords.confirmPassword) {
            return Swal.fire("แจ้งเตือน", "รหัสผ่านใหม่ไม่ตรงกัน", "warning");
        }
        if (passwords.newPassword.length < 6) {
            return Swal.fire("แจ้งเตือน", "รหัสผ่านใหม่ต้องมีอย่างน้อย 6 ตัวอักษร", "warning");
        }

        setSaving(true);
        try {
            const res = await api("/api/profile/change-password", {
                method: "PUT",
                body: {
                    currentPassword: passwords.currentPassword,
                    newPassword: passwords.newPassword,
                },
            });
            if (res.success) {
                Swal.fire("สำเร็จ", "เปลี่ยนรหัสผ่านเรียบร้อยแล้ว", "success");
                setPasswords({ currentPassword: "", newPassword: "", confirmPassword: "" });
            }
        } catch (err) {
            Swal.fire("ข้อผิดพลาด", err.message, "error");
        } finally {
            setSaving(false);
        }
    };

    if (loading) return (
        <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div className="spinner"></div>
            <p style={{ marginLeft: 15, color: 'var(--text-secondary)' }}>กำลังเตรียมข้อมูล...</p>
        </div>
    );

    return (
        <div className="profile-redesign-container" style={{
            maxWidth: 1100,
            margin: "40px auto",
            padding: "0 20px",
            fontFamily: "'Inter', sans-serif"
        }}>
            {/* Header Section */}
            <header style={{ marginBottom: 40, position: 'relative' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 24 }}>
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: 100, height: 100,
                            borderRadius: '50%',
                            background: 'linear-gradient(135deg, var(--accent-light, #fbbf24), var(--accent-dark, #d97706))',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '2.5rem', color: '#fff', fontWeight: 'bold',
                            boxShadow: '0 10px 25px rgba(251, 191, 36, 0.3)'
                        }}>
                            {profile.name?.charAt(0).toUpperCase() || <User size={40} />}
                        </div>
                        <button style={{
                            position: 'absolute', bottom: 0, right: 0,
                            width: 32, height: 32, borderRadius: '50%',
                            backgroundColor: '#262626', border: '2px solid var(--bg-card)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            color: '#fff', cursor: 'pointer'
                        }}>
                            <Camera size={16} />
                        </button>
                    </div>
                    <div>
                        <h1 style={{ fontSize: '2rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em' }}>
                            {profile.name}
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', margin: '4px 0 0 0', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Mail size={14} /> {profile.email}
                        </p>
                    </div>
                </div>
            </header>

            <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 40, alignItems: 'start' }}>

                {/* Sidebar Navigation */}
                <aside style={{
                    position: 'sticky', top: 100,
                    background: 'rgba(255, 255, 255, 0.03)',
                    backdropFilter: 'blur(10px)',
                    borderRadius: 20,
                    padding: 12,
                    border: '1px solid rgba(255, 255, 255, 0.05)'
                }}>
                    <div style={{ padding: '12px 16px', fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        Settings
                    </div>
                    <button
                        onClick={() => setActiveTab("profile")}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                            borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)', marginBottom: 4,
                            backgroundColor: activeTab === "profile" ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
                            color: activeTab === "profile" ? 'var(--accent-light, #fbbf24)' : 'var(--text-secondary)'
                        }}
                    >
                        <UserCircle size={20} />
                        <span style={{ fontWeight: 600, flex: 1 }}>General Information</span>
                        {activeTab === "profile" && <ChevronRight size={16} />}
                    </button>
                    <button
                        onClick={() => setActiveTab("security")}
                        style={{
                            width: '100%', display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
                            borderRadius: 12, border: 'none', cursor: 'pointer', textAlign: 'left',
                            transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                            backgroundColor: activeTab === "security" ? 'rgba(251, 191, 36, 0.1)' : 'transparent',
                            color: activeTab === "security" ? 'var(--accent-light, #fbbf24)' : 'var(--text-secondary)'
                        }}
                    >
                        <Shield size={20} />
                        <span style={{ fontWeight: 600, flex: 1 }}>Login & Security</span>
                        {activeTab === "security" && <ChevronRight size={16} />}
                    </button>
                </aside>

                {/* Main Content Area */}
                <main className="glass-card" style={{
                    borderRadius: 24,
                    padding: 40,
                    minHeight: 500,
                    animation: 'fadeIn 0.3s ease-out'
                }}>

                    {activeTab === "profile" ? (
                        <div id="tab-profile">
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>General Information</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Update your personal details and location.</p>

                            <form onSubmit={updateProfile} style={{ display: 'grid', gap: 24 }}>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }}>
                                    <div className="input-group">
                                        <label className="label">Full Name</label>
                                        <div style={{ position: 'relative' }}>
                                            <User size={18} className="input-icon-left" />
                                            <input
                                                className="modern-input"
                                                name="name"
                                                value={profile.name}
                                                onChange={handleProfileChange}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="input-group">
                                        <label className="label">Phone Number</label>
                                        <div style={{ position: 'relative' }}>
                                            <Phone size={18} className="input-icon-left" />
                                            <input
                                                className="modern-input"
                                                name="phone"
                                                value={profile.phone}
                                                onChange={handleProfileChange}
                                                placeholder="0xx-xxx-xxxx"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label className="label">Email Address (Read-only)</label>
                                    <div style={{ position: 'relative' }}>
                                        <Mail size={18} className="input-icon-left" />
                                        <input
                                            className="modern-input disabled"
                                            value={profile.email}
                                            disabled
                                            style={{ cursor: 'not-allowed', opacity: 0.5 }}
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label className="label">Physical Address</label>
                                    <div style={{ position: 'relative' }}>
                                        <MapPin size={18} style={{ position: 'absolute', left: 16, top: 16, color: 'var(--text-muted)' }} />
                                        <textarea
                                            className="modern-input"
                                            name="address"
                                            value={profile.address}
                                            onChange={handleProfileChange}
                                            style={{ minHeight: 120, paddingTop: 14, paddingLeft: 46 }}
                                            placeholder="Your home or office address..."
                                        />
                                    </div>
                                </div>

                                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-end' }}>
                                    <button className="premium-btn" type="submit" disabled={saving}>
                                        <Save size={18} /> {saving ? "Saving Changes..." : "Update Profile"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    ) : (
                        <div id="tab-security">
                            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: 8 }}>Login & Security</h2>
                            <p style={{ color: 'var(--text-secondary)', marginBottom: 32 }}>Change your password to keep your account secure.</p>

                            <form onSubmit={updatePassword} style={{ display: 'grid', gap: 24, maxWidth: 500 }}>
                                <div className="input-group">
                                    <label className="label">Current Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Key size={18} className="input-icon-left" />
                                        <input
                                            type="password"
                                            className="modern-input"
                                            name="currentPassword"
                                            value={passwords.currentPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="••••••••"
                                        />
                                    </div>
                                </div>

                                <div style={{ height: 1, backgroundColor: 'rgba(255,255,255,0.05)', margin: '8px 0' }}></div>

                                <div className="input-group">
                                    <label className="label">New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} className="input-icon-left" />
                                        <input
                                            type="password"
                                            className="modern-input"
                                            name="newPassword"
                                            value={passwords.newPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="Min. 6 characters"
                                        />
                                    </div>
                                </div>

                                <div className="input-group">
                                    <label className="label">Confirm New Password</label>
                                    <div style={{ position: 'relative' }}>
                                        <Lock size={18} className="input-icon-left" />
                                        <input
                                            type="password"
                                            className="modern-input"
                                            name="confirmPassword"
                                            value={passwords.confirmPassword}
                                            onChange={handlePasswordChange}
                                            required
                                            placeholder="Re-type new password"
                                        />
                                    </div>
                                </div>

                                <div style={{ marginTop: 12, display: 'flex', justifyContent: 'flex-start' }}>
                                    <button className="premium-btn active" type="submit" disabled={saving}>
                                        <Shield size={18} /> {saving ? "Processing..." : "Secure My Account"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    )}

                </main>
            </div>

            <style dangerouslySetInnerHTML={{
                __html: `
                .profile-redesign-container {
                    animation: fadeIn 0.5s ease-out;
                }
                
                @keyframes fadeIn {
                    from { opacity: 0; transform: translateY(10px); }
                    to { opacity: 1; transform: translateY(0); }
                }

                .modern-input {
                    width: 100%;
                    background: rgba(255, 255, 255, 0.05);
                    border: 1px solid rgba(255, 255, 255, 0.1);
                    border-radius: 12px;
                    padding: 14px 16px 14px 46px;
                    color: #fff;
                    font-size: 0.95rem;
                    transition: all 0.2s;
                    box-sizing: border-box;
                }

                .modern-input:focus {
                    outline: none;
                    background: rgba(255, 255, 255, 0.08);
                    border-color: var(--accent-light, #fbbf24);
                    box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.1);
                }

                .input-icon-left {
                    position: absolute;
                    left: 16px;
                    top: 50%;
                    transform: translateY(-50%);
                    color: var(--text-muted);
                    pointer-events: none;
                }

                .premium-btn {
                    display: flex;
                    align-items: center;
                    gap: 10px;
                    padding: 12px 28px;
                    border-radius: 12px;
                    font-weight: 700;
                    font-size: 1rem;
                    cursor: pointer;
                    transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
                    border: none;
                    background: var(--bg-card, #1f2937);
                    color: #fff;
                    border: 1px solid rgba(255, 255, 255, 0.1);
                }

                .premium-btn:hover {
                    transform: translateY(-2px);
                    background: #2d3748;
                    box-shadow: 0 10px 20px rgba(0, 0, 0, 0.2);
                }

                .premium-btn.active {
                  background: linear-gradient(135deg, #fbbf24, #d97706);
                  color: #000;
                  border: none;
                }

                .premium-btn.active:hover {
                  background: linear-gradient(135deg, #fcd34d, #f59e0b);
                  box-shadow: 0 10px 25px rgba(251, 191, 36, 0.3);
                }

                .glass-card {
                  background: rgba(255, 255, 255, 0.02);
                  backdrop-filter: blur(20px);
                  -webkit-backdrop-filter: blur(20px);
                  border: 1px solid rgba(255, 255, 255, 0.05);
                  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
                }

                .label {
                  display: block;
                  font-size: 0.85rem;
                  font-weight: 600;
                  color: var(--text-muted);
                  margin-bottom: 8px;
                  letter-spacing: 0.02em;
                }

                .spinner {
                  width: 30px;
                  height: 30px;
                  border: 3px solid rgba(251, 191, 36, 0.1);
                  border-top-color: var(--accent-light, #fbbf24);
                  border-radius: 50%;
                  animation: spin 1s linear infinite;
                }

                @keyframes spin {
                  to { transform: rotate(360deg); }
                }
            ` }} />
        </div>
    );
}
