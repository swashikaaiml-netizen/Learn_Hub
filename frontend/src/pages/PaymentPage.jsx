import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CreditCard, ShieldCheck, Lock, ArrowLeft } from 'lucide-react';

export default function PaymentPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { apiCall } = useAuth();

    const [course, setCourse] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);

    const [formData, setFormData] = useState({
        cardHolderName: '',
        cardNumber: '',
        expiry: '',
        cvv: ''
    });

    useEffect(() => {
        const fetchCourse = async () => {
            try {
                const data = await apiCall(`/api/courses/${id}`);
                setCourse(data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourse();
    }, [id]);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        // Basic Validation
        if (!/^\d{16,19}$/.test(formData.cardNumber.replace(/\s/g, ''))) {
            alert('Please enter a valid card number.');
            return;
        }
        if (!/^\d{2}\/\d{2}$/.test(formData.expiry)) {
            alert('Please enter a valid expiry date (MM/YY).');
            return;
        }
        if (!/^\d{3,4}$/.test(formData.cvv)) {
            alert('Please enter a valid CVV.');
            return;
        }

        setProcessing(true);
        try {
            await apiCall('/api/payments', {
                method: 'POST',
                body: JSON.stringify({
                    courseId: id,
                    cardHolderName: formData.cardHolderName,
                    amount: course.price
                })
            });
            navigate(`/course/${id}`);
        } catch (err) {
            alert(err.message || 'Payment failed');
        } finally {
            setProcessing(false);
        }
    };

    if (loading) return <div style={{ padding: '4rem', textAlign: 'center' }}>Loading Course Details...</div>;
    if (!course) return <div style={{ padding: '4rem', textAlign: 'center' }}>Course Not Found</div>;

    return (
        <div className="animate-fade-in" style={styles.container}>
            <div className="container" style={{ maxWidth: '900px' }}>
                <button onClick={() => navigate(-1)} style={styles.backBtn}>
                    <ArrowLeft size={18} /> Back
                </button>

                <div style={styles.layout}>
                    {/* Payment Form */}
                    <div style={styles.formCard}>
                        <h2 style={{ marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <CreditCard color="var(--primary)" /> Secure Payment
                        </h2>

                        <form onSubmit={handleSubmit}>
                            <div className="form-group">
                                <label className="form-label">Cardholder Name</label>
                                <input
                                    type="text"
                                    name="cardHolderName"
                                    className="form-control"
                                    placeholder="John Doe"
                                    required
                                    value={formData.cardHolderName}
                                    onChange={handleInputChange}
                                />
                            </div>
                            <div className="form-group">
                                <label className="form-label">Card Number</label>
                                <div style={{ position: 'relative' }}>
                                    <input
                                        type="text"
                                        name="cardNumber"
                                        className="form-control"
                                        placeholder="0000 0000 0000 0000"
                                        required
                                        value={formData.cardNumber}
                                        onChange={handleInputChange}
                                        maxLength="19"
                                    />
                                    <ShieldCheck size={18} color="#10b981" style={{ position: 'absolute', right: '12px', top: '12px' }} />
                                </div>
                            </div>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                <div className="form-group">
                                    <label className="form-label">Expiry Date</label>
                                    <input
                                        type="text"
                                        name="expiry"
                                        className="form-control"
                                        placeholder="MM/YY"
                                        required
                                        value={formData.expiry}
                                        onChange={handleInputChange}
                                        maxLength="5"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">CVV</label>
                                    <input
                                        type="password"
                                        name="cvv"
                                        className="form-control"
                                        placeholder="123"
                                        required
                                        value={formData.cvv}
                                        onChange={handleInputChange}
                                        maxLength="3"
                                    />
                                </div>
                            </div>

                            <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '1rem', height: '50px' }} disabled={processing}>
                                {processing ? 'Processing...' : `Pay $${course.price?.toFixed(2)} Now`}
                            </button>

                            <p style={{ marginTop: '1rem', textAlign: 'center', fontSize: '0.85rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem' }}>
                                <Lock size={14} /> Your payment is secured and encrypted.
                            </p>
                        </form>
                    </div>

                    {/* Order Summary */}
                    <div style={styles.summaryCard}>
                        <h3 style={{ marginBottom: '1.5rem' }}>Order Summary</h3>
                        <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem' }}>
                            <img src={course.image} alt={course.title} style={styles.courseImg} />
                            <div>
                                <h4 style={{ fontSize: '1rem', marginBottom: '0.25rem' }}>{course.title}</h4>
                                <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Instructor: {course.instructor}</p>
                            </div>
                        </div>
                        <div style={styles.divider}></div>
                        <div style={styles.priceRow}>
                            <span>Course Price</span>
                            <span>${course.price?.toFixed(2)}</span>
                        </div>
                        <div style={styles.priceRow}>
                            <span>Taxes</span>
                            <span>$0.00</span>
                        </div>
                        <div style={styles.divider}></div>
                        <div style={{ ...styles.priceRow, fontWeight: 700, fontSize: '1.1rem', color: 'var(--text-main)' }}>
                            <span>Total</span>
                            <span>${course.price?.toFixed(2)}</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

const styles = {
    container: {
        padding: '4rem 0',
        minHeight: 'calc(100vh - 144px)',
        background: 'var(--background)'
    },
    backBtn: {
        background: 'none',
        border: 'none',
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--text-muted)',
        fontWeight: 600,
        marginBottom: '2rem',
        cursor: 'pointer'
    },
    layout: {
        display: 'grid',
        gridTemplateColumns: '1.5fr 1fr',
        gap: '2.5rem',
        alignItems: 'start'
    },
    formCard: {
        background: 'white',
        padding: '2.5rem',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)'
    },
    summaryCard: {
        background: 'white',
        padding: '2rem',
        borderRadius: '20px',
        boxShadow: 'var(--shadow-sm)',
        border: '1px solid var(--border)'
    },
    courseImg: {
        width: '80px',
        height: '60px',
        objectFit: 'cover',
        borderRadius: '8px'
    },
    divider: {
        height: '1px',
        background: 'var(--border)',
        margin: '1rem 0'
    },
    priceRow: {
        display: 'flex',
        justifyContent: 'space-between',
        marginBottom: '0.5rem',
        color: 'var(--text-muted)',
        fontSize: '0.95rem'
    }
};
