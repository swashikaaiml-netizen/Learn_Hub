import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { login } = useAuth();
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await login(email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to login');
        }
    };

    return (
        <div className="animate-fade-in" style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Welcome back</h2>
                <p style={styles.subtitle}>Log in to your account to continue</p>

                {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleLogin}>
                    <div className="form-group">
                        <label className="form-label">Email address</label>
                        <input
                            type="email"
                            className="form-control"
                            value={email}
                            onChange={e => setEmail(e.target.value)}
                            required
                            placeholder="name@example.com"
                        />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <input
                            type="password"
                            className="form-control"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                            placeholder="••••••••"
                        />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
                        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
                            <input type="checkbox" /> Remember me
                        </label>
                        <a href="#" className="text-primary font-bold">Forgot password?</a>
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Log In</button>
                </form>
                <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Don't have an account? <Link to="/register" className="text-primary font-bold">Sign up</Link>
                </p>
            </div>
        </div>
    );
}

const styles = {
    container: {
        minHeight: 'calc(100vh - 144px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
        background: 'var(--background)'
    },
    card: {
        width: '100%',
        maxWidth: '440px',
        background: 'white',
        padding: '3rem',
        borderRadius: '16px',
        boxShadow: 'var(--shadow-lg)'
    },
    title: {
        fontSize: '1.875rem',
        fontWeight: '800',
        marginBottom: '0.5rem',
        color: 'var(--text-main)',
        textAlign: 'center',
        letterSpacing: '-0.5px'
    },
    subtitle: {
        color: 'var(--text-muted)',
        marginBottom: '2.5rem',
        textAlign: 'center'
    }
};
