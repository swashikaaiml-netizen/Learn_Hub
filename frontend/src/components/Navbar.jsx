import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { BookOpen, LogOut, User, LayoutDashboard, ShieldCheck } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Navbar = () => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav style={styles.nav}>
            <div className="container" style={styles.container}>
                <Link to="/" style={styles.logo}>
                    <BookOpen color="var(--primary)" size={28} />
                    <span style={styles.brand}>LearnHub</span>
                </Link>
                <div style={styles.links}>
                    {user ? (
                        <>
                            <Link to="/home" style={styles.link}>Home</Link>
                            <Link to="/dashboard" style={styles.link}>Dashboard</Link>
                            {user.role === 'admin' && (
                                <Link to="/admin" style={styles.link} className="flex-center gap-1">
                                    <ShieldCheck size={18} /> Admin
                                </Link>
                            )}
                            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
                                <span style={{ color: 'var(--text-main)', fontWeight: 600 }}>Hi, {user.name}</span>
                                <button onClick={handleLogout} className="btn btn-outline flex-center gap-1" style={{ padding: '0.5rem 1rem' }}>
                                    <LogOut size={18} /> Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <>
                            <Link to="/login" className="btn btn-outline" style={{ marginLeft: '1rem' }}>Log In</Link>
                            <Link to="/register" className="btn btn-primary">Sign Up</Link>
                        </>
                    )}
                </div>
            </div>
        </nav>
    );
};

const styles = {
    nav: {
        background: 'rgba(255, 255, 255, 0.9)',
        backdropFilter: 'blur(10px)',
        borderBottom: '1px solid var(--border)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        boxShadow: 'var(--shadow-sm)'
    },
    container: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: '72px'
    },
    logo: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
    },
    brand: {
        fontSize: '1.5rem',
        fontWeight: '700',
        color: 'var(--text-main)'
    },
    links: {
        display: 'flex',
        alignItems: 'center',
        gap: '1.5rem'
    },
    link: {
        fontWeight: 500,
        color: 'var(--text-muted)',
        transition: 'var(--transition)',
        textDecoration: 'none'
    }
};

export default Navbar;
