import React, { useState, useEffect } from 'react';
import { Routes, Route, Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, Book, TrendingUp, Award, User, LogOut, PlayCircle } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function Dashboard() {
    const location = useLocation();
    const path = location.pathname;
    const { user, logout } = useAuth();

    const links = [
        { name: 'My Courses', path: '/dashboard', icon: <LayoutDashboard size={20} /> },
        { name: 'All Courses', path: '/dashboard/all', icon: <Book size={20} /> },
        { name: 'Progress', path: '/dashboard/progress', icon: <TrendingUp size={20} /> },
        { name: 'Certificates', path: '/dashboard/certificates', icon: <Award size={20} /> },
        { name: 'Profile', path: '/dashboard/profile', icon: <User size={20} /> },
    ];

    return (
        <div className="container animate-fade-in" style={styles.layout}>
            <aside style={styles.sidebar}>
                <div style={styles.sidebarSticky}>
                    <h3 style={styles.sidebarTitle}>Navigation</h3>
                    <ul style={styles.navList}>
                        {links.map(link => {
                            const isActive = (path === link.path);
                            return (
                                <li key={link.name}>
                                    <Link
                                        to={link.path}
                                        style={{ ...styles.navLink, ...(isActive ? styles.navLinkActive : {}) }}
                                    >
                                        {link.icon} <span>{link.name}</span>
                                    </Link>
                                </li>
                            );
                        })}
                        <li style={{ marginTop: '2rem' }}>
                            <button onClick={logout} style={{ ...styles.navLink, color: '#ef4444', width: '100%', border: 'none', background: 'none', cursor: 'pointer' }}>
                                <LogOut size={20} /> <span>Logout</span>
                            </button>
                        </li>
                    </ul>
                </div>
            </aside>
            <main style={styles.main}>
                <div style={styles.header}>
                    <h1 style={{ fontSize: '2rem', fontWeight: 'bold' }}>
                        {links.find(l => path === l.path)?.name || 'Dashboard'}
                    </h1>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <div style={{ textAlign: 'right', display: 'none' }}>
                            <div style={{ fontWeight: 700 }}>{user?.name}</div>
                            <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{user?.email}</div>
                        </div>
                        <img src={`https://ui-avatars.com/api/?name=${user?.name}&background=2563eb&color=fff`} alt="User" style={styles.avatar} />
                    </div>
                </div>

                <div style={styles.content}>
                    <Routes>
                        <Route path="/" element={<MyCourses />} />
                        <Route path="/all" element={<AllCourses />} />
                        <Route path="/progress" element={<Progress />} />
                        <Route path="/certificates" element={<Certificates />} />
                        <Route path="/profile" element={<Profile />} />
                    </Routes>
                </div>
            </main>
        </div>
    );
}

// Subcomponents
function MyCourses() {
    const { apiCall, user } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchEnrolled = async () => {
            try {
                // In a real app, you'd have a specific endpoint or the user object would have nested courses
                // For now, let's fetch all and filter by user's enrolled list
                const all = await apiCall('/api/courses');
                const enrolledIds = user.enrolledCourses?.map(c => typeof c === 'string' ? c : c._id) || [];
                setCourses(all.filter(c => enrolledIds.includes(c._id)));
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchEnrolled();
    }, [user]);

    if (loading) return <div>Loading your courses...</div>;
    if (courses.length === 0) return (
        <div style={{ textAlign: 'center', padding: '4rem', background: 'white', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <Book size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
            <h3>No courses yet</h3>
            <p style={{ color: 'var(--text-muted)' }}>You haven't enrolled in any courses yet.</p>
            <Link to="/dashboard/all" className="btn btn-primary mt-4">Browse Catalog</Link>
        </div>
    );

    return (
        <div style={styles.grid}>
            {courses.map(course => (
                <div key={course._id} style={styles.card}>
                    <img src={course.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'} alt={course.title} style={styles.cardImg} />
                    <div style={styles.cardBody}>
                        <h3 style={styles.cardTitle}>{course.title}</h3>
                        <div style={styles.progressBarBg}>
                            <div style={{ ...styles.progressBarFill, width: `0%` }}></div>
                        </div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>0% Completed</p>
                        <Link to={`/course/${course._id}`} className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>
                            <PlayCircle size={18} /> Continue Learning
                        </Link>
                    </div>
                </div>
            ))}
        </div>
    );
}

function AllCourses() {
    const { apiCall } = useAuth();
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAll = async () => {
            try {
                const data = await apiCall('/api/courses');
                setCourses(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchAll();
    }, []);

    if (loading) return <div>Loading catalog...</div>;

    return (
        <div style={styles.grid}>
            {courses.map(course => (
                <div key={course._id} style={styles.card}>
                    <div style={{ position: 'relative' }}>
                        <img src={course.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'} alt={course.title} style={styles.cardImg} />
                        {course.isPaid && <span style={styles.paidBadge}>PAID</span>}
                    </div>
                    <div style={styles.cardBody}>
                        <h3 style={styles.cardTitle}>{course.title}</h3>
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginBottom: '1rem' }}>{course.instructor}</p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontWeight: 800, fontSize: '1.2rem' }}>{course.isPaid ? `$${course.price}` : 'Free'}</span>
                            <Link to={`/course/${course._id}`} className="btn btn-outline" style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>View Details</Link>
                        </div>
                    </div>
                </div>
            ))}
        </div>
    );
}

function Progress() {
    return (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Learning Stats</h3>
            <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
                <div style={styles.statBox}>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Hours Learned</p>
                    <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>0.0h</h2>
                </div>
                <div style={styles.statBox}>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Courses Completed</p>
                    <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>0</h2>
                </div>
                <div style={styles.statBox}>
                    <p style={{ color: 'var(--text-muted)', margin: 0 }}>Certificates Earned</p>
                    <h2 style={{ fontSize: '2rem', margin: '0.5rem 0' }}>0</h2>
                </div>
            </div>
        </div>
    );
}

function Certificates() {
    return (
        <div style={{ background: 'white', padding: '4rem 2rem', borderRadius: '16px', border: '1px solid var(--border)', textAlign: 'center' }}>
            <Award size={64} color="var(--border)" style={{ margin: '0 auto 1.5rem' }} />
            <h3>Your Certificates</h3>
            <p style={{ color: 'var(--text-muted)', maxWidth: '400px', margin: '0.5rem auto 1.5rem' }}>
                Complete courses to earn professional certificates. You haven't earned any yet.
            </p>
            <Link to="/dashboard/all" className="btn btn-outline">Start Learning</Link>
        </div>
    );
}

function Profile() {
    const { user } = useAuth();
    return (
        <div style={{ background: 'white', padding: '2rem', borderRadius: '16px', border: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '1.5rem' }}>Your Profile</h3>
            <div style={{ display: 'grid', gap: '1.5rem', maxWidth: '500px' }}>
                <div>
                    <label style={styles.label}>Full Name</label>
                    <div style={styles.valueBox}>{user?.name}</div>
                </div>
                <div>
                    <label style={styles.label}>Email Address</label>
                    <div style={styles.valueBox}>{user?.email}</div>
                </div>
                <div>
                    <label style={styles.label}>Account Type</label>
                    <div style={{ ...styles.valueBox, textTransform: 'capitalize' }}>{user?.role}</div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    layout: {
        display: 'flex',
        paddingTop: '2rem',
        paddingBottom: '4rem',
        gap: '2rem',
        minHeight: 'calc(100vh - 72px)'
    },
    sidebar: {
        width: '280px',
        flexShrink: 0,
    },
    sidebarSticky: {
        position: 'sticky',
        top: '100px',
        background: 'white',
        padding: '2rem',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)'
    },
    sidebarTitle: {
        fontSize: '0.75rem',
        textTransform: 'uppercase',
        letterSpacing: '0.1em',
        color: 'var(--text-muted)',
        marginBottom: '2rem',
        fontWeight: '800'
    },
    navList: {
        display: 'flex',
        flexDirection: 'column',
        gap: '0.75rem',
        listStyle: 'none',
        padding: 0
    },
    navLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '0.85rem 1.25rem',
        borderRadius: '12px',
        color: 'var(--text-muted)',
        fontWeight: '600',
        transition: 'var(--transition)',
        textDecoration: 'none'
    },
    navLinkActive: {
        background: 'var(--secondary)',
        color: 'var(--primary)'
    },
    main: {
        flex: 1,
        minWidth: 0
    },
    header: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2.5rem'
    },
    avatar: {
        width: '48px',
        height: '48px',
        borderRadius: '14px',
        boxShadow: 'var(--shadow-sm)'
    },
    content: {
        minHeight: '400px'
    },
    grid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
        gap: '2rem'
    },
    card: {
        background: 'white',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
        transition: 'var(--transition)',
        display: 'flex',
        flexDirection: 'column'
    },
    cardImg: {
        width: '100%',
        height: '180px',
        objectFit: 'cover'
    },
    cardBody: {
        padding: '1.5rem',
        flex: 1,
        display: 'flex',
        flexDirection: 'column'
    },
    cardTitle: {
        fontSize: '1.1rem',
        fontWeight: '700',
        marginBottom: '1rem',
        lineHeight: 1.4,
        color: 'var(--text-main)'
    },
    progressBarBg: {
        height: '6px',
        background: 'var(--secondary)',
        borderRadius: '3px',
        overflow: 'hidden'
    },
    progressBarFill: {
        height: '100%',
        background: 'var(--primary)',
        borderRadius: '3px'
    },
    paidBadge: {
        position: 'absolute',
        top: '1rem',
        right: '1rem',
        background: '#ef4444',
        color: 'white',
        padding: '0.25rem 0.5rem',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: '800'
    },
    statBox: {
        minWidth: '180px',
        padding: '1.5rem',
        background: 'var(--background)',
        borderRadius: '12px',
        border: '1px solid var(--border)'
    },
    label: {
        display: 'block',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        marginBottom: '0.5rem',
        fontWeight: 600
    },
    valueBox: {
        padding: '0.75rem 1rem',
        background: 'var(--background)',
        borderRadius: '8px',
        border: '1px solid var(--border)',
        fontWeight: 600
    }
};
