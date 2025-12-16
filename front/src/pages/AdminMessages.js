import React, { useEffect, useState } from "react";
import axios from "axios";
import Swal from "sweetalert2";
import "../styles/AdminMessages.css";
import { Mail, Phone, Calendar, Search, Filter } from "lucide-react";

export default function AdminMessages() {
    const [messages, setMessages] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [filter, setFilter] = useState("all"); // all, unread, read (Mock status for now)

    useEffect(() => {
        fetchMessages();
    }, []);

    const fetchMessages = async () => {
        try {
            // In a real app, you might need an auth token here
            const res = await axios.get("http://localhost:3000/api/contact");
            if (res.data.success) {
                setMessages(res.data.messages);
            }
            setLoading(false);
        } catch (err) {
            console.error("Error fetching messages:", err);
            // Use mock data if API fails or is empty for demo purposes (optional)
            setLoading(false);
        }
    };

    const handleStatusChange = (id, newStatus) => {
        // Placeholder for future status update feature
        console.log(`Update message ${id} to ${newStatus}`);
    };

    const filteredMessages = messages.filter((msg) => {
        // Basic search
        const term = searchTerm.toLowerCase();
        const matchesSearch =
            msg.name.toLowerCase().includes(term) ||
            msg.subject.toLowerCase().includes(term) ||
            msg.phone.includes(term);

        // Basic filter (Using mock status logic as DB default is 'unread')
        if (filter === "all") return matchesSearch;
        if (filter === "unread") return matchesSearch && msg.status === "unread";
        // ...
        return matchesSearch;
    });

    if (loading) return <div className="loading-container">⏳ กำลังโหลดข้อความ...</div>;

    return (
        <div className="admin-messages-page">
            <div className="page-header">
                <h1>📨 กล่องข้อความลูกค้า</h1>
                <p>จัดการข้อความและคำถามจากหน้าเว็บไซต์</p>
            </div>

            <div className="messages-controls">
                <div className="search-bar">
                    <Search size={20} className="search-icon" />
                    <input
                        type="text"
                        placeholder="ค้นหาตามชื่อ, เรื่อง, หรือเบอร์โทร..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                {/* Future Filter Dropdown can go here */}
            </div>

            <div className="messages-list">
                {filteredMessages.length === 0 ? (
                    <div className="empty-state">
                        <Mail size={48} />
                        <p>ไม่พบข้อความที่ค้นหา</p>
                    </div>
                ) : (
                    filteredMessages.map((msg) => (
                        <div key={msg.message_id} className={`message-card ${msg.status}`}>
                            <div className="message-header">
                                <div className="sender-info">
                                    <h3 className="sender-name">{msg.name}</h3>
                                    <span className="sender-phone">
                                        <Phone size={14} /> {msg.phone}
                                    </span>
                                </div>
                                <div className="message-meta">
                                    <span className="message-date">
                                        <Calendar size={14} /> {new Date(msg.created_at).toLocaleString('th-TH')}
                                    </span>
                                    <span className={`status-badge status-${msg.status}`}>
                                        {msg.status === 'unread' ? 'ใหม่' : 'อ่านแล้ว'}
                                    </span>
                                </div>
                            </div>

                            <div className="message-subject">
                                <strong>เรื่อง:</strong> {msg.subject}
                            </div>

                            <div className="message-body">
                                {msg.message}
                            </div>

                            <div className="message-actions">
                                <a href={`tel:${msg.phone}`} className="btn-action btn-call">
                                    <Phone size={16} /> โทรกลับ
                                </a>
                                {/* Add more actions like 'Mark as Read' here */}
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
}
