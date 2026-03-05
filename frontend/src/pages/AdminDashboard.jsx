import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, DollarSign, BookOpen, Clock, ChevronRight, Search, CreditCard, Calendar } from 'lucide-react';

const AdminDashboard = () => {
    const { apiCall } = useAuth();
    const [stats, setStats] = useState(null);
    const [users, setUsers] = useState([]);
    const [payments, setPayments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [activeTab, setActiveTab] = useState('users');

    useEffect(() => {
        const fetchAdminData = async () => {
            try {
                const [statsData, usersData, paymentsData] = await Promise.all([
                    apiCall('/api/admin/stats'),
                    apiCall('/api/admin/users'),
                    apiCall('/api/admin/payments')
                ]);
                setStats(statsData);
                setUsers(usersData);
                setPayments(paymentsData);
            } catch (err) {
                console.error('Failed to fetch admin data', err);
            } finally {
                setLoading(false);
            }
        };
        fetchAdminData();
    }, []);

    const filteredUsers = users.filter(user =>
        user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const filteredPayments = payments.filter(payment =>
        payment.user?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        payment.course?.title.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) return <div className="container" style={{ padding: '4rem', textAlign: 'center' }}>Loading Admin Panel...</div>;

    return (
        <div className="container" style={{ padding: '2rem 0' }}>
            <div style={{ marginBottom: '2rem' }}>
                <h1 style={{ fontSize: '2.5rem', fontWeight: 800, marginBottom: '0.5rem' }}>Admin Dashboard</h1>
                <p style={{ color: 'var(--text-muted)' }}>Manage your platform, users, and track performance.</p>
            </div>

            {/* Stats Overview */}
            <div style={styles.statsGrid}>
                <div style={styles.statCard}>
                    <div style={{ ...styles.iconBox, background: '#e0e7ff', color: '#4338ca' }}>
                        <Users size={24} />
                    </div>
                    <div>
                        <p style={styles.statLabel}>Total Users</p>
                        <h3 style={styles.statValue}>{stats?.totalUsers || 0}</h3>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.iconBox, background: '#dcfce7', color: '#15803d' }}>
                        <DollarSign size={24} />
                    </div>
                    <div>
                        <p style={styles.statLabel}>Total Earnings</p>
                        <h3 style={styles.statValue}>${stats?.totalEarnings?.toFixed(2) || '0.00'}</h3>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.iconBox, background: '#fef3c7', color: '#b45309' }}>
                        <BookOpen size={24} />
                    </div>
                    <div>
                        <p style={styles.statLabel}>Total Courses</p>
                        <h3 style={styles.statValue}>{stats?.totalCourses || 0}</h3>
                    </div>
                </div>
                <div style={styles.statCard}>
                    <div style={{ ...styles.iconBox, background: '#f3e8ff', color: '#7e22ce' }}>
                        <Clock size={24} />
                    </div>
                    <div>
                        <p style={styles.statLabel}>Recent Logins (24h)</p>
                        <h3 style={styles.statValue}>{stats?.recentLogins?.length || 0}</h3>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={styles.tabBar}>
                <button
                    onClick={() => setActiveTab('users')}
                    style={{ ...styles.tab, ...(activeTab === 'users' ? styles.activeTab : {}) }}
                >
                    <Users size={18} /> Users
                </button>
                <button
                    onClick={() => setActiveTab('payments')}
                    style={{ ...styles.tab, ...(activeTab === 'payments' ? styles.activeTab : {}) }}
                >
                    <CreditCard size={18} /> Payments
                </button>
            </div>

            {/* Content Card */}
            <div style={styles.card}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>
                        {activeTab === 'users' ? 'User Management' : 'Transaction History'}
                    </h2>
                    <div style={styles.searchContainer}>
                        <Search size={18} color="var(--text-muted)" />
                        <input
                            type="text"
                            placeholder={activeTab === 'users' ? "Search users..." : "Search course or user..."}
                            style={styles.searchInput}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                    </div>
                </div>

                <div style={{ overflowX: 'auto' }}>
                    {activeTab === 'users' ? (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>User Details</th>
                                    <th style={styles.th}>Joined Date</th>
                                    <th style={styles.th}>Last Login</th>
                                    <th style={styles.th}>Courses</th>
                                    <th style={styles.th}>Total Paid</th>
                                    <th style={styles.th}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(user => (
                                    <tr key={user._id} style={styles.tr}>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                                <div style={styles.avatar}>{user.name.charAt(0)}</div>
                                                <div>
                                                    <div style={{ fontWeight: 600 }}>{user.name}</div>
                                                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{user.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td style={styles.td}>{new Date(user.createdAt).toLocaleDateString()}</td>
                                        <td style={styles.td}>
                                            {user.loginHistory?.length > 0
                                                ? new Date(user.loginHistory[user.loginHistory.length - 1]).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })
                                                : 'Never'}
                                        </td>
                                        <td style={styles.td}>
                                            <span style={styles.badge}>{user.enrolledCourses?.length || 0} Enrolled</span>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: 600, color: '#15803d' }}>
                                                ${user.paymentHistory?.reduce((sum, p) => sum + p.amount, 0).toFixed(2) || '0.00'}
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                ...styles.statusDot,
                                                background: user.role === 'admin' ? '#4f46e5' : '#10b981'
                                            }}></span>
                                            {user.role}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table style={styles.table}>
                            <thead>
                                <tr>
                                    <th style={styles.th}>Transaction ID</th>
                                    <th style={styles.th}>User</th>
                                    <th style={styles.th}>Course</th>
                                    <th style={styles.th}>Date</th>
                                    <th style={styles.th}>Amount</th>
                                    <th style={styles.th}>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredPayments.map(payment => (
                                    <tr key={payment._id} style={styles.tr}>
                                        <td style={styles.td}><code style={{ fontSize: '0.8rem' }}>{payment._id}</code></td>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: 600 }}>{payment.user?.name}</div>
                                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{payment.user?.email}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: 500 }}>{payment.course?.title}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Calendar size={14} color="var(--text-muted)" />
                                                {new Date(payment.createdAt).toLocaleDateString()}
                                            </div>
                                        </td>
                                        <td style={styles.td}>
                                            <div style={{ fontWeight: 700, color: '#15803d' }}>${payment.amount?.toFixed(2)}</div>
                                        </td>
                                        <td style={styles.td}>
                                            <span style={{
                                                padding: '0.25rem 0.5rem',
                                                borderRadius: '6px',
                                                fontSize: '0.75rem',
                                                fontWeight: 700,
                                                background: payment.status === 'Completed' ? '#dcfce7' : '#fee2e2',
                                                color: payment.status === 'Completed' ? '#166534' : '#991b1b'
                                            }}>
                                                {payment.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            </div>
        </div>
    );
};

const styles = {
    statsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem'
    },
    statCard: {
        background: 'white',
        padding: '1.5rem',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: '1.25rem',
        border: '1px solid var(--border)'
    },
    iconBox: {
        width: '48px',
        height: '48px',
        borderRadius: '12px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
    },
    statLabel: {
        color: 'var(--text-muted)',
        fontSize: '0.875rem',
        margin: 0
    },
    statValue: {
        fontSize: '1.5rem',
        fontWeight: 800,
        margin: 0
    },
    tabBar: {
        display: 'flex',
        gap: '1rem',
        marginBottom: '1.5rem',
        borderBottom: '1px solid var(--border)',
        paddingBottom: '0.5rem'
    },
    tab: {
        padding: '0.75rem 1.5rem',
        borderRadius: '10px',
        background: 'transparent',
        border: 'none',
        color: 'var(--text-muted)',
        fontWeight: 600,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        transition: 'var(--transition)'
    },
    activeTab: {
        background: 'white',
        color: 'var(--primary)',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border)'
    },
    card: {
        background: 'white',
        padding: '2rem',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)'
    },
    searchContainer: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'var(--background)',
        padding: '0.5rem 1rem',
        borderRadius: '10px',
        width: '100%',
        maxWidth: '300px',
        border: '1px solid var(--border)'
    },
    searchInput: {
        background: 'transparent',
        border: 'none',
        outline: 'none',
        width: '100%',
        fontSize: '0.9rem'
    },
    table: {
        width: '100%',
        borderCollapse: 'collapse',
        marginTop: '1rem'
    },
    th: {
        textAlign: 'left',
        padding: '1rem',
        borderBottom: '2px solid var(--border)',
        color: 'var(--text-muted)',
        fontSize: '0.85rem',
        textTransform: 'uppercase',
        letterSpacing: '0.05em'
    },
    td: {
        padding: '1.25rem 1rem',
        borderBottom: '1px solid var(--border)',
        fontSize: '0.95rem'
    },
    tr: {
        transition: 'background 0.2s',
        '&:hover': {
            background: 'var(--background)'
        }
    },
    avatar: {
        width: '40px',
        height: '40px',
        borderRadius: '10px',
        background: 'linear-gradient(135deg, var(--primary), #4f46e5)',
        color: 'white',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 700,
        fontSize: '1.25rem'
    },
    badge: {
        background: '#eff6ff',
        color: '#2563eb',
        padding: '0.25rem 0.75rem',
        borderRadius: '99px',
        fontSize: '0.8rem',
        fontWeight: 600
    },
    statusDot: {
        display: 'inline-block',
        width: '8px',
        height: '8px',
        borderRadius: '50%',
        marginRight: '0.5rem'
    }
};

export default AdminDashboard;
