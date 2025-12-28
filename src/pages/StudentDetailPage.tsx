import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStudentDetail } from '../api/courses';
import type { StudentDetail } from '../api/courses';
import Logo from '../components/Logo';
import { getAvatarEmoji } from '../components/AvatarPicker';

export default function StudentDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();

  const [student, setStudent] = useState<StudentDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedCourses, setExpandedCourses] = useState<Set<number>>(new Set());

  const isTeacher = user?.role === 'TEACHER';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isTeacher) {
      navigate('/');
      return;
    }
    if (token && id) {
      loadStudentDetail();
    }
  }, [isTeacher, token, id]);

  const loadStudentDetail = async () => {
    if (!token || !id) return;
    setIsLoading(true);
    try {
      const data = await getStudentDetail(token, parseInt(id));
      setStudent(data);
      // Auto-expand courses with progress
      const coursesWithProgress = new Set(
        data.courses.filter(c => c.completedExercises > 0).map(c => c.courseId)
      );
      setExpandedCourses(coursesWithProgress);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba');
    } finally {
      setIsLoading(false);
    }
  };

  const toggleCourse = (courseId: number) => {
    setExpandedCourses(prev => {
      const next = new Set(prev);
      if (next.has(courseId)) {
        next.delete(courseId);
      } else {
        next.add(courseId);
      }
      return next;
    });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'short',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getScoreClass = (score: number): string => {
    if (score >= 80) return 'score-good';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  };

  const getExerciseTypeLabel = (type: string): string => {
    switch (type) {
      case 'CODE': return 'Kód';
      case 'MATCHING': return 'Spojování';
      case 'GAPFILL': return 'Doplňování';
      case 'CROSSWORD': return 'Křížovka';
      case 'SORTING': return 'Řazení';
      case 'CATEGORY': return 'Třídění';
      default: return type;
    }
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <Logo />
        <nav className="header-nav">
          <Link to="/" className="nav-link">Domů</Link>
          {isTeacher && <Link to="/prehled" className="nav-link">Přehled</Link>}
          {isTeacher && <Link to="/skupiny" className="nav-link">Skupiny</Link>}
          {isTeacher && <Link to="/kurzy" className="nav-link">Kurzy</Link>}
          {isAdmin && <Link to="/admin" className="nav-link">Admin</Link>}
        </nav>
        <div className="user-info">
          <span>Učitel</span>
          <button onClick={logout} className="btn-secondary">
            Odhlásit se
          </button>
        </div>
      </header>

      <main className="home-content student-detail-page">
        <Link to="/prehled" className="back-link">← Zpět na přehled</Link>

        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <p>Načítání...</p>
        ) : student ? (
          <>
            {/* Student Header */}
            <div className="student-header">
              <div className="student-avatar-large">
                {getAvatarEmoji(student.studentAvatar)}
              </div>
              <div className="student-info">
                <h2>{student.studentEmail}</h2>
                <div className="student-stats">
                  <span className={`score-badge large ${getScoreClass(student.overallScore)}`}>
                    Skóre: {student.overallScore.toFixed(0)}%
                  </span>
                  <span className="completion-badge">
                    Dokončeno: {student.overallCompletion.toFixed(0)}%
                  </span>
                  <span className="activity-info">
                    Poslední aktivita: {formatDate(student.lastActivity)}
                  </span>
                </div>
              </div>
            </div>

            {/* Course Progress */}
            <section className="dashboard-section">
              <h3>Pokrok v kurzech</h3>
              {student.courses.length === 0 ? (
                <p className="empty-hint">Žák nemá přiřazeny žádné kurzy.</p>
              ) : (
                <div className="courses-progress-list">
                  {student.courses.map(course => (
                    <div key={course.courseId} className="course-progress-card">
                      <button
                        className="course-header"
                        onClick={() => toggleCourse(course.courseId)}
                      >
                        <div className="course-info">
                          <span className="course-title">{course.courseTitle}</span>
                          <span className="course-stats">
                            {course.completedExercises}/{course.totalExercises} cvičení
                          </span>
                        </div>
                        <div className="course-score">
                          {course.completedExercises > 0 && (
                            <span className={`score-badge ${getScoreClass(course.averageScore)}`}>
                              {course.averageScore.toFixed(0)}%
                            </span>
                          )}
                          <span className="expand-icon">
                            {expandedCourses.has(course.courseId) ? '▼' : '▶'}
                          </span>
                        </div>
                      </button>

                      {expandedCourses.has(course.courseId) && (
                        <div className="exercises-list">
                          {course.exercises.map(ex => (
                            <div
                              key={ex.exerciseId}
                              className={`exercise-row ${ex.score !== null ? 'completed' : 'pending'}`}
                            >
                              <div className="exercise-info">
                                <span className="exercise-type-badge small">
                                  {getExerciseTypeLabel(ex.exerciseType)}
                                </span>
                                <span className="exercise-title">{ex.exerciseTitle}</span>
                                <span className="exercise-lesson">{ex.lessonTitle}</span>
                              </div>
                              <div className="exercise-result">
                                {ex.score !== null ? (
                                  <>
                                    <span className={`score-badge small ${getScoreClass(ex.scorePercent)}`}>
                                      {ex.score}/{ex.maxScore}
                                    </span>
                                    {ex.attempts && ex.attempts > 1 && (
                                      <span className="attempts-badge">{ex.attempts}x</span>
                                    )}
                                    <span className="completed-date">{formatDate(ex.completedAt)}</span>
                                  </>
                                ) : (
                                  <span className="pending-badge">Nedokončeno</span>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </section>
          </>
        ) : null}
      </main>
    </div>
  );
}
