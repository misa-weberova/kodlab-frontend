import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCourses, assignCourse, unassignCourse } from '../api/courses';
import type { CourseListItem } from '../api/courses';
import Logo from '../components/Logo';
import ProgressBar from '../components/ProgressBar';

export default function CoursesPage() {
  const { user, token, logout } = useAuth();
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    if (token) {
      loadCourses();
    }
  }, [token]);

  const loadCourses = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getCourses(token);
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignToggle = async (course: CourseListItem) => {
    if (!token) return;
    try {
      if (course.assigned) {
        await unassignCourse(token, course.id);
      } else {
        await assignCourse(token, course.id);
      }
      loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba');
    }
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <Logo />
        <nav className="header-nav">
          <Link to="/" className="nav-link">Domů</Link>
          <Link to="/kurzy" className="nav-link active">Kurzy</Link>
        </nav>
        <div className="user-info">
          <span>{isTeacher ? 'Učitel' : 'Žák'}</span>
          <button onClick={logout} className="btn-secondary">
            Odhlásit se
          </button>
        </div>
      </header>

      <main className="home-content">
        <h2>Kurzy</h2>
        <p>
          {isTeacher
            ? 'Přiřaďte kurzy svým žákům kliknutím na tlačítko.'
            : 'Zde najdete kurzy přiřazené vaší třídou.'}
        </p>

        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <p>Načítání...</p>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <p>Žádné kurzy k zobrazení.</p>
            {!isTeacher && <p>Váš učitel vám zatím nepřiřadil žádné kurzy.</p>}
          </div>
        ) : (
          <div className="course-list">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-card-header">
                  <h3>{course.title}</h3>
                  {isTeacher && (
                    <button
                      className={`assign-btn ${course.assigned ? 'assigned' : 'unassigned'}`}
                      onClick={() => handleAssignToggle(course)}
                    >
                      {course.assigned ? 'Přiřazeno' : 'Přiřadit'}
                    </button>
                  )}
                </div>
                {course.description && <p>{course.description}</p>}
                <div className="course-card-footer">
                  {!isTeacher && (
                    <ProgressBar
                      completed={course.completedLessons}
                      total={course.totalLessons}
                    />
                  )}
                  {isTeacher && (
                    <span className="lesson-count">{course.totalLessons} lekcí</span>
                  )}
                  <div className="course-actions">
                    <Link to={`/kurzy/${course.id}`} className="btn-secondary">
                      Zobrazit
                    </Link>
                    {isTeacher && course.assigned && (
                      <Link to={`/kurzy/${course.id}/pokrok`} className="btn-secondary">
                        Pokrok žáků
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
