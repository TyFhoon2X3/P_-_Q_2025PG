import { useEffect, useState, useMemo } from "react";
import { api } from "../api";
import Swal from "sweetalert2";
import {
    Star, MessageSquare, Users, TrendingUp,
    Search, Filter, Calendar, ChevronRight,
    MoreVertical, CheckCircle2
} from "lucide-react";
import "../styles/common.css";

export default function AdminReviews() {
    const [reviews, setReviews] = useState([]);
    const [loading, setLoading] = useState(true);
    const [search, setSearch] = useState("");

    const fetchReviews = async () => {
        try {
            const res = await api("/api/reviews/all");
            if (res.success) {
                setReviews(res.reviews);
            }
        } catch (err) {
            Swal.fire("❌", "โหลดข้อมูลรีวิวไม่สำเร็จ", "error");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReviews();
    }, []);

    // Calculate Statistics
    const stats = useMemo(() => {
        if (reviews.length === 0) return { avg: 0, total: 0, excellent: 0 };
        const total = reviews.length;
        const sum = reviews.reduce((acc, curr) => acc + curr.rating, 0);
        const excellent = reviews.filter(r => r.rating === 5).length;
        return {
            avg: (sum / total).toFixed(1),
            total,
            excellent
        };
    }, [reviews]);

    const filteredReviews = useMemo(() => {
        return reviews.filter(r =>
            r.reviewer_name?.toLowerCase().includes(search.toLowerCase()) ||
            r.model?.toLowerCase().includes(search.toLowerCase()) ||
            r.comment?.toLowerCase().includes(search.toLowerCase())
        );
    }, [reviews, search]);

    if (loading) return (
        <div className="loading-container" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '80vh' }}>
            <div className="spinner"></div>
            <p style={{ marginLeft: 15, color: 'var(--text-secondary)' }}>กำลังเตรียมข้อมูลรีวิว...</p>
        </div>
    );

    return (
        <div className="admin-reviews-redesign" style={{
            maxWidth: 1200,
            margin: "40px auto",
            padding: "0 24px",
            fontFamily: "'Inter', sans-serif"
        }}>

            {/* Header & Stats Dashboard */}
            <header style={{ marginBottom: 48 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 }}>
                    <div>
                        <h1 style={{ fontSize: '2.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.02em', color: '#fff' }}>
                            Customer Feedback
                        </h1>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', marginTop: 8 }}>
                            Manage and analyze service ratings from your customers.
                        </p>
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                        <div className="search-box">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search reviews..."
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 24 }}>
                    <div className="stat-card glass">
                        <div className="stat-icon" style={{ backgroundColor: 'rgba(251, 191, 36, 0.1)', color: '#fbbf24' }}>
                            <Star fill="#fbbf24" size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Average Rating</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                <span className="stat-value">{stats.avg}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>/ 5.0</span>
                            </div>
                        </div>
                        <TrendingUp size={20} style={{ position: 'absolute', top: 24, right: 24, color: '#10b981', opacity: 0.5 }} />
                    </div>

                    <div className="stat-card glass">
                        <div className="stat-icon" style={{ backgroundColor: 'rgba(59, 130, 246, 0.1)', color: '#3b82f6' }}>
                            <MessageSquare size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Total Reviews</span>
                            <span className="stat-value">{stats.total}</span>
                        </div>
                    </div>

                    <div className="stat-card glass">
                        <div className="stat-icon" style={{ backgroundColor: 'rgba(16, 185, 129, 0.1)', color: '#10b981' }}>
                            <CheckCircle2 size={24} />
                        </div>
                        <div className="stat-content">
                            <span className="stat-label">Excellent (5⭐)</span>
                            <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                                <span className="stat-value">{stats.excellent}</span>
                                <span style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
                                    ({stats.total > 0 ? Math.round((stats.excellent / stats.total) * 100) : 0}%)
                                </span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Reviews List */}
            <section>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
                        Recent Reviews <span style={{ fontSize: '0.9rem', color: 'var(--text-muted)', fontWeight: 400 }}>({filteredReviews.length})</span>
                    </h2>
                    <button className="filter-btn">
                        <Filter size={16} /> Filter
                    </button>
                </div>

                <div className="reviews-grid">
                    {filteredReviews.length > 0 ? (
                        filteredReviews.map((r) => (
                            <div key={r.review_id} className="review-card glass-hover">
                                <div className="review-header">
                                    <div className="reviewer-info">
                                        <div className="reviewer-avatar">
                                            {r.reviewer_name?.charAt(0).toUpperCase()}
                                        </div>
                                        <div>
                                            <h4 className="reviewer-name">{r.reviewer_name}</h4>
                                            <div className="review-meta">
                                                <Calendar size={12} />
                                                {new Date(r.created_at).toLocaleDateString("th-TH")}
                                            </div>
                                        </div>
                                    </div>
                                    <div className="rating-badge">
                                        <Star size={14} fill="#fbbf24" stroke="#fbbf24" />
                                        <span>{r.rating}.0</span>
                                    </div>
                                </div>

                                <div className="review-body">
                                    <div className="booking-chip">
                                        <TrendingUp size={12} />
                                        <span>{r.model}</span>
                                        <span className="booking-id">#{r.booking_id}</span>
                                    </div>
                                    <p className="review-comment">
                                        "{r.comment || "The customer did not leave a specific comment."}"
                                    </p>
                                </div>

                                <div className="review-footer">
                                    <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                                        Booking Date: {new Date(r.date).toLocaleDateString("th-TH")}
                                    </div>
                                    <button className="action-btn-mini">
                                        <MoreVertical size={16} />
                                    </button>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="empty-state glass">
                            <MessageSquare size={48} style={{ opacity: 0.2, marginBottom: 16 }} />
                            <h3>No reviews found</h3>
                            <p>Change your search or wait for some customer feedback.</p>
                        </div>
                    )}
                </div>
            </section>

            <style dangerouslySetInnerHTML={{
                __html: `
        .admin-reviews-redesign {
          animation: slideUp 0.6s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes slideUp {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        .glass {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
        }

        .glass-hover {
          background: rgba(255, 255, 255, 0.03);
          backdrop-filter: blur(12px);
          border: 1px solid rgba(255, 255, 255, 0.05);
          border-radius: 20px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .glass-hover:hover {
          background: rgba(255, 255, 255, 0.06);
          border-color: rgba(255, 255, 255, 0.1);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
        }

        .stat-card {
          padding: 24px;
          display: flex;
          align-items: center;
          gap: 20px;
          position: relative;
          overflow: hidden;
        }

        .stat-icon {
          width: 56px;
          height: 56px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .stat-label {
          display: block;
          font-size: 0.85rem;
          font-weight: 600;
          color: var(--text-muted);
          margin-bottom: 4px;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-value {
          font-size: 1.75rem;
          font-weight: 800;
          color: #fff;
        }

        .search-box {
          display: flex;
          align-items: center;
          gap: 12px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          border-radius: 14px;
          padding: 0 16px;
          height: 48px;
          width: 300px;
          transition: all 0.2s;
        }

        .search-box:focus-within {
          background: rgba(255, 255, 255, 0.08);
          border-color: #fbbf24;
          box-shadow: 0 0 0 4px rgba(251, 191, 36, 0.1);
        }

        .search-box input {
          background: none;
          border: none;
          color: #fff;
          font-size: 0.95rem;
          width: 100%;
          outline: none;
        }

        .filter-btn {
          display: flex;
          align-items: center;
          gap: 8px;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid rgba(255, 255, 255, 0.1);
          color: #fff;
          padding: 8px 16px;
          border-radius: 10px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s;
        }

        .filter-btn:hover {
          background: rgba(255, 255, 255, 0.1);
        }

        .reviews-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
          gap: 24px;
        }

        .review-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .review-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
        }

        .reviewer-info {
          display: flex;
          gap: 12px;
          align-items: center;
        }

        .reviewer-avatar {
          width: 44px;
          height: 44px;
          border-radius: 12px;
          background: linear-gradient(135deg, #fbbf24, #d97706);
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          color: #000;
          font-size: 1.2rem;
        }

        .reviewer-name {
          margin: 0;
          font-size: 1rem;
          font-weight: 700;
          color: #fff;
        }

        .review-meta {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 0.75rem;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .rating-badge {
          background: rgba(251, 191, 36, 0.1);
          color: #fbbf24;
          padding: 4px 10px;
          border-radius: 8px;
          font-size: 0.85rem;
          font-weight: 700;
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .booking-chip {
          display: inline-flex;
          align-items: center;
          gap: 6px;
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 10px;
          border-radius: 6px;
          font-size: 0.75rem;
          font-weight: 600;
          color: var(--text-accent, #fbbf24);
          margin-bottom: 12px;
        }

        .booking-id {
          color: var(--text-muted);
          margin-left: 4px;
          border-left: 1px solid rgba(255, 255, 255, 0.1);
          padding-left: 6px;
        }

        .review-comment {
          margin: 0;
          font-size: 0.95rem;
          line-height: 1.6;
          color: var(--text-secondary);
          font-style: italic;
          display: -webkit-box;
          -webkit-line-clamp: 3;
          -webkit-box-orient: vertical;
          overflow: hidden;
        }

        .review-footer {
          margin-top: auto;
          padding-top: 16px;
          border-top: 1px solid rgba(255, 255, 255, 0.05);
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .action-btn-mini {
          background: none;
          border: none;
          color: var(--text-muted);
          cursor: pointer;
          padding: 4px;
          border-radius: 6px;
          transition: all 0.2s;
        }

        .action-btn-mini:hover {
          background: rgba(255, 255, 255, 0.05);
          color: #fff;
        }

        .empty-state {
          grid-column: 1 / -1;
          padding: 80px 20px;
          text-align: center;
          display: flex;
          flex-direction: column;
          align-items: center;
        }

        .empty-state h3 {
          margin: 0;
          font-size: 1.5rem;
          color: #fff;
        }

        .empty-state p {
          color: var(--text-muted);
          margin-top: 8px;
        }

        .spinner {
          width: 30px;
          height: 30px;
          border: 3px solid rgba(251, 191, 36, 0.1);
          border-top-color: #fbbf24;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @media (max-width: 768px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .search-box {
            width: 100%;
          }
          .reviews-grid {
            grid-template-columns: 1fr;
          }
        }
      ` }} />
        </div>
    );
}
