import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { PlayCircle, CheckCircle, Lock, ArrowLeft, Download, Award, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

export default function CoursePage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const { user, apiCall } = useAuth();

    const [course, setCourse] = useState(null);
    const [lessons, setLessons] = useState([]);
    const [activeLesson, setActiveLesson] = useState(null);
    const [loading, setLoading] = useState(true);
    const [isEnrolled, setIsEnrolled] = useState(false);
    const [showCertificate, setShowCertificate] = useState(false);
    const [completedDate, setCompletedDate] = useState(null);
    const [showAssignment, setShowAssignment] = useState(false);
    const [assignmentQuestions, setAssignmentQuestions] = useState([]);
    const [assignmentAnswers, setAssignmentAnswers] = useState({});
    const [assignmentResult, setAssignmentResult] = useState(null);

    useEffect(() => {
        const fetchCourseData = async () => {
            try {
                const courseData = await apiCall(`/api/courses/${id}`);
                setCourse(courseData);

                // For demo/simplicity, lessons might be in the course object
                const courseLessons = courseData.lessons || [];
                setLessons(courseLessons.map((l, index) => ({
                    ...l,
                    id: index + 1, // Add internal sequential ID for UI logic
                    completed: false, // In a real app, this would come from User's progress in DB
                    locked: index > 0 // First lesson unlocked by default
                })));

                if (courseLessons.length > 0) {
                    setActiveLesson({ ...courseLessons[0], id: 1, completed: false, locked: false });
                }

                // Check enrollment
                if (user.enrolledCourses?.some(c => (typeof c === 'string' ? c : c._id) === id)) {
                    setIsEnrolled(true);
                } else if (courseData.isPaid) {
                    // Redirect to payment if paid and not enrolled
                    navigate(`/payment/${id}`);
                } else {
                    // If free, auto-enroll or just allow viewing?
                    // Let's assume free courses need no enrollment check for now or auto-enroll
                    setIsEnrolled(true);
                }

                // Fetch questions
                const questions = await apiCall(`/api/assignments/${id}`);
                setAssignmentQuestions(questions);

            } catch (err) {
                console.error('Error fetching course:', err);
            } finally {
                setLoading(false);
            }
        };

        fetchCourseData();
    }, [id, user, navigate, apiCall]);

    const completedCount = lessons.filter(l => l.completed).length;
    const isCurriculumDone = lessons.length > 0 && completedCount === lessons.length;
    const progress = lessons.length > 0 ? Math.round((completedCount / lessons.length) * 100) : 0;

    // Removed the useEffect that set completedDate based on progress,
    // as completedDate is now set after passing the assignment.

    const handleAssignmentSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await apiCall('/api/assignments/submit', {
                method: 'POST',
                body: JSON.stringify({
                    courseId: id,
                    answers: assignmentAnswers
                })
            });
            setAssignmentResult(res);
            if (res.passed) {
                setCompletedDate(new Date().toLocaleDateString('en-US', {
                    year: 'numeric', month: 'long', day: 'numeric'
                }));
            }
        } catch (err) {
            alert('Failed to submit assignment');
        }
    };

    const markComplete = () => {
        setLessons(prev => {
            const newLessons = prev.map(l => {
                if (l.id === activeLesson.id) {
                    return { ...l, completed: true };
                }
                // Unlock next
                if (l.id === activeLesson.id + 1) {
                    return { ...l, locked: false };
                }
                return l;
            });

            // Update active lesson state too
            setActiveLesson(prevActive => ({ ...prevActive, completed: true }));

            return newLessons;
        });
    };

    const handleNextLesson = () => {
        const next = lessons.find(l => l.id === activeLesson.id + 1);
        if (next && !next.locked) {
            setActiveLesson(next);
        } else if (isCurriculumDone) {
            setShowAssignment(true);
        }
    };

    const downloadCertificate = () => {
        if (!assignmentResult?.passed) {
            alert('You must pass the assignment with at least 60% to get your certificate.');
            return;
        }
        setShowCertificate(true);
    };

    if (loading) return <div style={styles.loadingContainer}>Loading Course...</div>;
    if (!course) return <div style={styles.loadingContainer}>Course not found</div>;

    return (
        <div className="animate-fade-in" style={{ background: 'var(--background)', minHeight: 'calc(100vh - 72px)' }}>
            {/* Header */}
            <div style={styles.courseHeader}>
                <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem 0' }}>
                    <Link to="/dashboard" style={styles.backLink}>
                        <ArrowLeft size={20} /> Back to Dashboard
                    </Link>
                    <div style={styles.headerProgress}>
                        <span style={{ fontWeight: '600', minWidth: '120px' }}>{progress}% Completed</span>
                        <div style={styles.progressBarBg}>
                            <div style={{ ...styles.progressBarFill, width: `${progress}%` }}></div>
                        </div>
                        {assignmentResult?.passed && (
                            <button className="btn btn-secondary" style={{ marginLeft: '1.5rem', padding: '0.5rem 1rem' }} onClick={downloadCertificate}>
                                <Download size={18} /> Get Certificate
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="container" style={styles.layout}>
                {/* Video Area / Assignment Area */}
                <div style={styles.main}>
                    {showAssignment ? (
                        <div style={styles.assignmentBox}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                                <h1 style={{ margin: 0 }}>Course Assignment</h1>
                                <button className="btn btn-outline btn-sm" onClick={() => setShowAssignment(false)}>Back to Lessons</button>
                            </div>

                            {assignmentResult ? (
                                <div style={{ ...styles.resultCard, borderColor: assignmentResult.passed ? '#10b981' : '#ef4444' }}>
                                    <h2 style={{ color: assignmentResult.passed ? '#10b981' : '#ef4444' }}>
                                        {assignmentResult.passed ? 'Congratulation! You Passed' : 'Assessment Failed'}
                                    </h2>
                                    <div style={{ fontSize: '3rem', fontWeight: 800, margin: '1rem 0' }}>{assignmentResult.percentage}%</div>
                                    <p>You got {assignmentResult.score} out of {assignmentResult.totalQuestions} questions correct.</p>
                                    {assignmentResult.passed ? (
                                        <div style={{ marginTop: '2rem' }}>
                                            <p style={{ color: 'var(--text-muted)', marginBottom: '1rem' }}>Your certificate is now ready for download.</p>
                                            <button className="btn btn-primary" onClick={downloadCertificate}>Claim Certificate</button>
                                        </div>
                                    ) : (
                                        <button className="btn btn-outline mt-4" onClick={() => setAssignmentResult(null)}>Try Again</button>
                                    )}
                                </div>
                            ) : (
                                <form onSubmit={handleAssignmentSubmit}>
                                    {assignmentQuestions.length > 0 ? (
                                        assignmentQuestions.map((q, idx) => (
                                            <div key={q._id} style={styles.questionItem}>
                                                <p style={styles.questionText}><b>{idx + 1}.</b> {q.questionText}</p>
                                                <div style={styles.optionsGrid}>
                                                    {['a', 'b', 'c', 'd'].map(opt => (
                                                        <label key={opt} style={{
                                                            ...styles.optionLabel,
                                                            ...(assignmentAnswers[q._id] === opt ? styles.optionSelected : {})
                                                        }}>
                                                            <input
                                                                type="radio"
                                                                name={q._id}
                                                                value={opt}
                                                                checked={assignmentAnswers[q._id] === opt}
                                                                onChange={() => setAssignmentAnswers({ ...assignmentAnswers, [q._id]: opt })}
                                                                required
                                                                style={{ display: 'none' }}
                                                            />
                                                            <span style={styles.optionLetter}>{opt.toUpperCase()}</span>
                                                            <span>{q.options[opt]}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                                            No questions have been added for this course yet.
                                        </div>
                                    )}
                                    {assignmentQuestions.length > 0 && (
                                        <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: '2rem', height: '50px' }}>
                                            Submit Final Assignment
                                        </button>
                                    )}
                                </form>
                            )}
                        </div>
                    ) : (
                        <>
                            <div style={styles.videoPlayer}>
                                {activeLesson?.videoUrl ? (
                                    <iframe
                                        key={activeLesson.id}
                                        src={`${activeLesson.videoUrl.replace('watch?v=', 'embed/')}?autoplay=0&rel=0`}
                                        title={activeLesson.title}
                                        style={{ width: '100%', height: '100%', border: 'none', backgroundColor: 'black' }}
                                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                        allowFullScreen
                                    ></iframe>
                                ) : (
                                    <div style={styles.videoPlaceholder}>
                                        <PlayCircle size={64} color="white" />
                                        <p style={{ marginTop: '1rem', color: 'white', fontWeight: '500' }}>Video loading or unavailable</p>
                                    </div>
                                )}
                            </div>

                            <div style={styles.lessonInfo}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
                                    <div>
                                        <h1 style={styles.lessonTitle}>{activeLesson?.title}</h1>
                                        <p style={{ color: 'var(--text-muted)' }}>Duration: {activeLesson?.duration}</p>
                                    </div>
                                    <div style={{ background: 'var(--secondary)', color: 'var(--primary)', padding: '0.5rem 1rem', borderRadius: '8px', fontWeight: 600 }}>
                                        Lesson {activeLesson?.id} of {lessons.length}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                                    <button
                                        className="btn btn-primary"
                                        onClick={markComplete}
                                        disabled={activeLesson?.completed}
                                        style={{ flex: 1, maxWidth: '250px' }}
                                    >
                                        <CheckCircle size={20} />
                                        {activeLesson?.completed ? 'Completed' : 'Mark as Complete'}
                                    </button>
                                    <button
                                        className="btn btn-outline"
                                        onClick={handleNextLesson}
                                        disabled={!lessons.find(l => l.id === activeLesson?.id + 1) && !isCurriculumDone || (lessons.find(l => l.id === activeLesson?.id + 1)?.locked && !isCurriculumDone)}
                                        style={{ flex: 1, maxWidth: '150px' }}
                                    >
                                        {isCurriculumDone ? 'Go to Assignment' : 'Next Lesson'}
                                    </button>
                                </div>
                            </div>
                        </>
                    )}
                </div>

                {/* Sidebar */}
                <div style={styles.sidebar}>
                    <div style={styles.sidebarContent}>
                        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--border)' }}>
                            <h3 style={{ margin: 0, fontSize: '1.1rem' }}>Course Curriculum</h3>
                        </div>
                        <ul style={styles.lessonList}>
                            {lessons.map(lesson => (
                                <li key={lesson.id}>
                                    <button
                                        style={{
                                            ...styles.lessonItem,
                                            ...(activeLesson?.id === lesson.id ? styles.lessonActive : {}),
                                            ...(lesson.locked ? styles.lessonLocked : {})
                                        }}
                                        disabled={lesson.locked}
                                        onClick={() => setActiveLesson(lesson)}
                                    >
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                            {lesson.completed ? (
                                                <CheckCircle size={20} color="#10b981" />
                                            ) : lesson.locked ? (
                                                <Lock size={20} color="var(--text-muted)" />
                                            ) : (
                                                <PlayCircle size={20} color={activeLesson?.id === lesson.id ? 'var(--primary)' : 'var(--text-muted)'} />
                                            )}
                                            <div style={{ textAlign: 'left' }}>
                                                <div style={{
                                                    fontWeight: '600',
                                                    color: lesson.locked ? 'var(--text-muted)' : 'var(--text-main)',
                                                    marginBottom: '0.25rem',
                                                    fontSize: '0.9rem'
                                                }}>
                                                    {lesson.id}. {lesson.title}
                                                </div>
                                                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{lesson.duration}</div>
                                            </div>
                                        </div>
                                    </button>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Certificate Modal */}
            {showCertificate && (
                <div style={styles.modalOverlay}>
                    <div style={styles.modalContent}>
                        <button style={styles.closeBtn} onClick={() => setShowCertificate(false)}>
                            <X size={24} />
                        </button>

                        <div id="certificate" style={styles.certificateBody}>
                            <div style={styles.certBorder}>
                                <div style={styles.certOrnament}>
                                    <Award size={80} color="#d4af37" />
                                </div>
                                <h1 style={styles.certTitle}>CERTIFICATE</h1>
                                <p style={styles.certSubtitle}>OF COMPLETION</p>

                                <div style={styles.divider}></div>

                                <p style={styles.certPresented}>This is to certify that</p>
                                <h2 style={styles.certName}>{user?.name}</h2>
                                <p style={styles.certPresented}>has successfully completed the course</p>
                                <h3 style={styles.certCourseName}>{course.title}</h3>

                                <div style={styles.certFooter}>
                                    <div style={styles.certDateBox}>
                                        <div style={{ fontWeight: 700 }}>{completedDate}</div>
                                        <div style={styles.certLabel}>DATE</div>
                                    </div>
                                    <div style={styles.certSignature}>
                                        <div style={{ fontFamily: 'cursive', fontSize: '1.5rem', borderBottom: '2px solid #333', marginBottom: '5px' }}>Team LearnHub</div>
                                        <div style={styles.certLabel}>AUTHORIZED SIGNATURE</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div style={{ textAlign: 'center', marginTop: '2rem' }}>
                            <button className="btn btn-primary" onClick={() => window.print()}>
                                <Download size={20} /> Download PDF
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const styles = {
    loadingContainer: {
        height: '80vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontSize: '1.25rem',
        fontWeight: 600,
        color: 'var(--text-muted)'
    },
    courseHeader: {
        background: 'white',
        borderBottom: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        position: 'sticky',
        top: '72px',
        zIndex: 10
    },
    backLink: {
        display: 'flex',
        alignItems: 'center',
        gap: '0.5rem',
        color: 'var(--text-muted)',
        fontWeight: '600',
        transition: 'var(--transition)'
    },
    headerProgress: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        width: '450px'
    },
    progressBarBg: {
        flex: 1,
        height: '10px',
        background: 'var(--secondary)',
        borderRadius: '5px',
        overflow: 'hidden'
    },
    progressBarFill: {
        height: '100%',
        background: 'var(--primary)',
        borderRadius: '3px',
        transition: 'width 0.5s ease-out'
    },
    assignmentBox: {
        background: 'white',
        padding: '3rem',
        borderRadius: '24px',
        boxShadow: 'var(--shadow-lg)',
        border: '1px solid var(--border)'
    },
    questionItem: {
        marginBottom: '2.5rem',
        padding: '1.5rem',
        background: 'var(--background)',
        borderRadius: '16px',
        border: '1px solid var(--border)'
    },
    questionText: {
        fontSize: '1.25rem',
        fontWeight: '600',
        marginBottom: '1.5rem',
        color: 'var(--text-main)'
    },
    optionsGrid: {
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1rem'
    },
    optionLabel: {
        display: 'flex',
        alignItems: 'center',
        gap: '1rem',
        padding: '1rem 1.5rem',
        background: 'white',
        borderRadius: '12px',
        border: '1px solid var(--border)',
        cursor: 'pointer',
        transition: 'var(--transition)',
        fontWeight: '500'
    },
    optionSelected: {
        borderColor: 'var(--primary)',
        background: 'var(--secondary)',
        color: 'var(--primary)',
        boxShadow: '0 0 0 1px var(--primary)'
    },
    optionLetter: {
        width: '32px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'var(--background)',
        borderRadius: '8px',
        fontSize: '0.85rem',
        fontWeight: '800'
    },
    resultCard: {
        textAlign: 'center',
        padding: '4rem 2rem',
        background: 'white',
        borderRadius: '24px',
        border: '4px solid',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center'
    },
    layout: {
        display: 'flex',
        paddingTop: '2.5rem',
        paddingBottom: '4rem',
        gap: '2.5rem'
    },
    main: {
        flex: 1,
        minWidth: 0
    },
    videoPlayer: {
        width: '100%',
        aspectRatio: '16/9',
        background: '#000',
        borderRadius: '20px',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-lg)'
    },
    videoPlaceholder: {
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'linear-gradient(45deg, #1e293b, #0f172a)'
    },
    lessonInfo: {
        background: 'white',
        padding: '2.5rem',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        marginTop: '2rem',
        boxShadow: 'var(--shadow-sm)'
    },
    lessonTitle: {
        fontSize: '1.875rem',
        fontWeight: '800',
        color: 'var(--text-main)',
        marginBottom: '0.25rem',
        letterSpacing: '-0.025em'
    },
    sidebar: {
        width: '380px',
        flexShrink: 0
    },
    sidebarContent: {
        background: 'white',
        borderRadius: '20px',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-sm)',
        overflow: 'hidden',
        position: 'sticky',
        top: '160px',
        maxHeight: 'calc(100vh - 200px)',
        display: 'flex',
        flexDirection: 'column'
    },
    lessonList: {
        overflowY: 'auto',
        listStyle: 'none',
        padding: 0,
        margin: 0
    },
    lessonItem: {
        width: '100%',
        padding: '1.5rem',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: 'white',
        transition: 'var(--transition)',
        borderLeft: '4px solid transparent',
        cursor: 'pointer',
        textAlign: 'left'
    },
    lessonActive: {
        background: 'var(--secondary)',
        borderLeftColor: 'var(--primary)',
        pointerEvents: 'none'
    },
    lessonLocked: {
        opacity: 0.5,
        cursor: 'not-allowed'
    },
    // Modal Styles
    modalOverlay: {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: 'rgba(0,0,0,0.85)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 2000,
        padding: '2rem'
    },
    modalContent: {
        background: 'white',
        borderRadius: '24px',
        padding: '3rem',
        width: '100%',
        maxWidth: '1000px',
        position: 'relative',
        animation: 'fadeIn 0.4s ease-out'
    },
    closeBtn: {
        position: 'absolute',
        top: '1.5rem',
        right: '1.5rem',
        background: 'none',
        border: 'none',
        cursor: 'pointer',
        color: 'var(--text-muted)'
    },
    certificateBody: {
        background: 'white',
        padding: '2rem',
        border: '15px solid #1e293b',
        borderRadius: '4px'
    },
    certBorder: {
        border: '2px solid #d4af37',
        padding: '3rem',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        textAlign: 'center',
        position: 'relative'
    },
    certOrnament: {
        marginBottom: '1rem'
    },
    certTitle: {
        fontSize: '4rem',
        fontWeight: '900',
        color: '#1e293b',
        margin: 0,
        letterSpacing: '10px'
    },
    certSubtitle: {
        fontSize: '1.25rem',
        fontWeight: '600',
        color: '#d4af37',
        letterSpacing: '5px',
        marginBottom: '2rem'
    },
    divider: {
        height: '2px',
        width: '100px',
        background: '#d4af37',
        marginBottom: '2rem'
    },
    certPresented: {
        fontSize: '1.1rem',
        fontStyle: 'italic',
        color: '#64748b',
        margin: '0.5rem 0'
    },
    certName: {
        fontSize: '3.5rem',
        fontWeight: '800',
        color: '#1e293b',
        margin: '1rem 0',
        fontFamily: 'Georgia, serif'
    },
    certCourseName: {
        fontSize: '1.75rem',
        fontWeight: '700',
        color: 'var(--primary)',
        margin: '1rem 0'
    },
    certFooter: {
        marginTop: '4rem',
        display: 'flex',
        justifyContent: 'space-between',
        width: '100%',
        padding: '0 2rem'
    },
    certLabel: {
        fontSize: '0.75rem',
        fontWeight: '700',
        color: '#64748b',
        letterSpacing: '1px'
    },
    certDateBox: {
        borderTop: '2px solid #333',
        paddingTop: '10px',
        width: '200px'
    },
    certSignature: {
        width: '250px'
    }
};
