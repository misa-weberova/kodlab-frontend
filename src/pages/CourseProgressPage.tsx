import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCourseProgress, getCourseDetail } from '../api/courses';
import type { StudentProgress, CourseDetail } from '../api/courses';
import Logo from '../components/Logo';
import ProgressBar from '../components/ProgressBar';

export default function CourseProgressPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token, logout } = useAuth();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [students, setStudents] = useState<StudentProgress[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    if (token && id) {
      loadData();
    }
  }, [token, id]);

  const loadData = async () => {
    if (!token || !id) return;
    setIsLoading(true);
    try {
      const [courseData, progressData] = await Promise.all([
        getCourseDetail(token, parseInt(id)),
        getCourseProgress(token, parseInt(id)),
      ]);
      setCourse(courseData);
      setStudents(progressData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '—';
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <Logo />
        <nav className="header-nav">
          <Link to="/" className="nav-link">Domů</Link>
          <Link to="/kurzy" className="nav-link">Kurzy</Link>
        </nav>
        <div className="user-info">
          <span>{isTeacher ? 'Učitel' : 'Žák'}</span>
          <button onClick={logout} className="btn-secondary">
            Odhlásit se
          </button>
        </div>
      </header>

      <main className="home-content">
        {isLoading ? (
          <p>Načítání...</p>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : course ? (
          <>
            <div className="course-header">
              <Link to={`/kurzy/${id}`} className="back-link">← Zpět na kurz</Link>
              <h2>Pokrok žáků: {course.title}</h2>
            </div>

            {students.length === 0 ? (
              <div className="empty-state">
                <p>Zatím nemáte žádné žáky.</p>
                <p>Sdílejte kód školy se svými žáky, aby se mohli připojit.</p>
              </div>
            ) : (
              <div className="progress-table-container">
                <table className="progress-table">
                  <thead>
                    <tr>
                      <th>Žák</th>
                      <th>Pokrok</th>
                      <th>Poslední aktivita</th>
                    </tr>
                  </thead>
                  <tbody>
                    {students.map((student) => (
                      <tr key={student.studentId}>
                        <td className="student-email">{student.studentEmail}</td>
                        <td>
                          <ProgressBar
                            completed={student.completedLessons}
                            total={student.totalLessons}
                          />
                        </td>
                        <td className="last-activity">
                          {formatDate(student.lastActivity)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
