import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Search, Star, Clock, BookOpen, Users, BarChart, ChevronRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function LandingPage() {
    const { apiCall } = useAuth();
    const [courses, setCourses] = useState([]);
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);
    const coursesRef = useRef(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                const data = await apiCall('/api/courses');
                setCourses(data);
            } catch (err) {
                console.error('Failed to fetch courses', err);
            } finally {
                setLoading(false);
            }
        };
        fetchCourses();
    }, []);

    const filteredCourses = courses.filter(course =>
        course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        course.instructor?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleSearch = (e) => {
        e.preventDefault();
        if (coursesRef.current) {
            coursesRef.current.scrollIntoView({ behavior: 'smooth' });
        }
    };

    return (
        <div className="animate-fade-in" style={{ backgroundColor: 'var(--background)' }}>
            {/* HERO SECTION */}
            <section style={styles.hero}>
                <div style={styles.heroOverlay}></div>
                <div className="container" style={styles.heroInner}>
                    <div style={styles.heroContent}>
                        <div style={styles.badge}>
                            <Star size={14} color="#f59e0b" fill="#f59e0b" />
                            <span>Trusted by over 5 million students worldwide</span>
                        </div>
                        <h1 style={styles.heroTitle}>Master your craft with <br /><span style={styles.gradientText}>world-class learning</span></h1>
                        <p style={styles.heroSubtitle}>
                            Accelerate your career with interactive courses led by top industry experts.
                            From coding to design, unlock your limitless potential starting today.
                        </p>

                        {/* SEARCH BAR */}
                        <form onSubmit={handleSearch} style={styles.searchContainer}>
                            <Search color="var(--text-muted)" style={styles.searchIcon} />
                            <input
                                type="text"
                                placeholder="Search for courses, skills, or instructors..."
                                style={styles.searchInput}
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                            <button type="submit" className="btn btn-primary" style={styles.searchButton}>Find Courses</button>
                        </form>

                        <div style={styles.statsRow}>
                            <div style={styles.stat}><BookOpen size={20} color="var(--primary)" /> <span><b>10k+</b> Premium Courses</span></div>
                            <div style={styles.stat}><Users size={20} color="var(--primary)" /> <span><b>5M+</b> Active Students</span></div>
                        </div>
                    </div>
                </div>
            </section>

            {/* COURSES SECTION */}
            <section ref={coursesRef} className="container" style={{ paddingTop: '5rem', paddingBottom: '6rem' }}>
                <div style={styles.sectionHeader}>
                    <div>
                        <h2 style={styles.sectionTitle}>
                            {searchQuery ? `Search Results for "${searchQuery}"` : 'Top Rated Courses'}
                        </h2>
                        <p style={styles.sectionSubtitle}>
                            {searchQuery ? `Found ${filteredCourses.length} courses matching your search.` : 'Explore our most popular and highly-rated programs handpicked for you.'}
                        </p>
                    </div>
                    {!searchQuery && (
                        <Link to="/dashboard/all" style={styles.exploreLink}>
                            Explore All Categories <ChevronRight size={18} />
                        </Link>
                    )}
                </div>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '4rem' }}>Loading courses...</div>
                ) : filteredCourses.length === 0 ? (
                    <div style={styles.emptyState}>
                        <Search size={48} color="var(--border)" style={{ marginBottom: '1rem' }} />
                        <h3>No courses found</h3>
                        <p>Try adjusting your search query or browse our categories.</p>
                        <button className="btn btn-outline mt-4" onClick={() => setSearchQuery('')}>Clear Search</button>
                    </div>
                ) : (
                    <div style={styles.courseGrid}>
                        {filteredCourses.map(course => (
                            <Link to={`/course/${course._id}`} key={course._id} style={styles.courseCard}>
                                <div style={styles.imgWrapper}>
                                    <img src={course.image || 'https://images.unsplash.com/photo-1498050108023-c5249f4df085'} alt={course.title} style={styles.courseImg} />
                                    <span style={styles.categoryBadge}>{course.category || 'General'}</span>
                                    {course.isPaid && <span style={styles.paidBadge}>PAID</span>}
                                </div>
                                <div style={styles.courseBody}>
                                    <h3 style={styles.courseTitle}>{course.title}</h3>
                                    <p style={styles.instructor}>By {course.instructor}</p>

                                    <div style={styles.courseMeta}>
                                        <div style={styles.metaItem}>
                                            <BarChart size={14} /> {course.level || 'All Levels'}
                                        </div>
                                        <div style={styles.metaItem}>
                                            <Users size={14} /> {course.studentsEnrolled || 0} Students
                                        </div>
                                    </div>

                                    <div style={styles.priceRow}>
                                        <span style={styles.price}>{course.isPaid ? `$${course.price}` : 'Free'}</span>
                                        <span style={styles.enrollText}>Enroll Now</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </div>
    );
}

const styles = {
    hero: {
        position: 'relative',
        padding: '8rem 0 6rem',
        background: 'linear-gradient(145deg, #0f172a 0%, #1e3a8a 100%)',
        overflow: 'hidden',
        color: 'white',
        borderBottom: '1px solid var(--border)'
    },
    heroOverlay: {
        position: 'absolute',
        top: 0, left: 0, right: 0, bottom: 0,
        backgroundImage: 'radial-gradient(circle at 20% 150%, rgba(37, 99, 235, 0.4) 0%, transparent 50%), radial-gradient(circle at 80% -20%, rgba(56, 189, 248, 0.3) 0%, transparent 40%)',
        zIndex: 1
    },
    heroInner: {
        position: 'relative',
        zIndex: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
    },
    heroContent: {
        maxWidth: '860px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    badge: {
        display: 'inline-flex',
        alignItems: 'center',
        gap: '0.5rem',
        background: 'rgba(255, 255, 255, 0.1)',
        padding: '0.5rem 1rem',
        borderRadius: '999px',
        fontSize: '0.875rem',
        fontWeight: '500',
        backdropFilter: 'blur(10px)',
        border: '1px solid rgba(255, 255, 255, 0.2)',
        marginBottom: '2rem',
        color: '#f8fafc'
    },
    heroTitle: {
        fontSize: '4.5rem',
        fontWeight: '800',
        lineHeight: 1.1,
        marginBottom: '1.5rem',
        letterSpacing: '-1.5px',
        color: '#ffffff'
    },
    gradientText: {
        background: 'linear-gradient(to right, #60a5fa, #38bdf8)',
        WebkitBackgroundClip: 'text',
        WebkitTextFillColor: 'transparent',
    },
    heroSubtitle: {
        fontSize: '1.25rem',
        color: '#cbd5e1',
        marginBottom: '3rem',
        maxWidth: '700px',
        lineHeight: 1.6
    },
    searchContainer: {
        display: 'flex',
        width: '100%',
        maxWidth: '680px',
        margin: '0 auto',
        boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.3)',
        borderRadius: '12px',
        background: 'white',
        position: 'relative',
        marginBottom: '3rem',
        transition: 'transform 0.3s ease',
    },
    searchIcon: {
        position: 'absolute',
        left: '1.25rem',
        top: '50%',
        transform: 'translateY(-50%)'
    },
    searchInput: {
        flex: 1,
        padding: '1.25rem 1rem 1.25rem 3.5rem',
        border: 'none',
        borderRadius: '12px 0 0 12px',
        fontSize: '1.1rem',
        outline: 'none',
        color: 'var(--text-main)',
        background: 'transparent'
    },
    searchButton: {
        borderRadius: '0 12px 12px 0',
        padding: '0 2rem',
        fontSize: '1.1rem'
    },
    statsRow: {
        display: 'flex',
        justifyContent: 'center',
        gap: '4rem',
        color: '#e2e8f0'
    },
    stat: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.75rem',
        fontSize: '1.1rem',
    },
    sectionHeader: {
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
        marginBottom: '3rem'
    },
    sectionTitle: {
        fontSize: '2.25rem',
        color: 'var(--text-main)',
        fontWeight: '800',
        letterSpacing: '-0.5px',
        marginBottom: '0.5rem'
    },
    sectionSubtitle: {
        color: 'var(--text-muted)',
        fontSize: '1.1rem'
    },
    exploreLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.25rem',
        color: 'var(--primary)',
        fontWeight: '600',
        fontSize: '1.05rem',
        paddingBottom: '0.5rem'
    },
    courseGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
        gap: '2.5rem 2rem'
    },
    courseCard: {
        background: 'white',
        borderRadius: '16px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow)',
        border: '1px solid var(--border)',
        transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
        display: 'flex',
        flexDirection: 'column',
    },
    imgWrapper: {
        position: 'relative',
        overflow: 'hidden'
    },
    courseImg: {
        width: '100%',
        height: '180px',
        objectFit: 'cover',
    },
    categoryBadge: {
        position: 'absolute',
        top: '1rem',
        left: '1rem',
        background: 'rgba(255, 255, 255, 0.95)',
        color: 'var(--text-main)',
        padding: '0.25rem 0.75rem',
        borderRadius: '6px',
        fontSize: '0.75rem',
        fontWeight: '700',
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
    courseBody: {
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        flex: 1
    },
    courseTitle: {
        fontSize: '1.15rem',
        fontWeight: '700',
        color: 'var(--text-main)',
        marginBottom: '0.5rem',
        lineHeight: 1.4,
    },
    instructor: {
        color: 'var(--text-muted)',
        fontSize: '0.9rem',
        marginBottom: '1rem'
    },
    courseMeta: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        marginBottom: '1rem',
        paddingBottom: '1rem',
        borderBottom: '1px solid var(--border)'
    },
    metaItem: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.35rem',
        fontSize: '0.85rem',
        color: 'var(--text-muted)',
        fontWeight: '500'
    },
    priceRow: {
        marginTop: 'auto',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    price: {
        fontSize: '1.35rem',
        fontWeight: '800',
        color: 'var(--text-main)'
    },
    enrollText: {
        fontSize: '0.9rem',
        fontWeight: '700',
        color: 'var(--primary)',
    },
    emptyState: {
        textAlign: 'center',
        padding: '5rem 0',
        color: 'var(--text-muted)'
    }
};
