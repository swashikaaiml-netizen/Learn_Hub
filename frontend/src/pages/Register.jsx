import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export default function Register() {
    const [name, setName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const { register } = useAuth();
    const [error, setError] = useState('');
    const navigate = useNavigate();

    const handleRegister = async (e) => {
        e.preventDefault();
        setError('');
        try {
            await register(name, email, password);
            navigate('/dashboard');
        } catch (err) {
            setError(err.message || 'Failed to register');
        }
    };

    return (
        <div className="animate-fade-in" style={styles.container}>
            <div style={styles.card}>
                <h2 style={styles.title}>Create an account</h2>
                <p style={styles.subtitle}>Start discovering new skills today</p>

                {error && <div style={{ color: 'red', marginBottom: '1rem', textAlign: 'center' }}>{error}</div>}

                <form onSubmit={handleRegister}>
                    <div className="form-group">
                        <label className="form-label">Full Name</label>
                        <input
                            type="text"
                            className="form-control"
                            value={name}
                            onChange={e => setName(e.target.value)}
                            required
                            placeholder="John Doe"
                        />
                    </div>
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
                            placeholder="Create a strong password"
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem' }}>Create Account</button>
                </form>
                <p style={{ marginTop: '1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    Already have an account? <Link to="/login" className="text-primary font-bold">Log in</Link>
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
