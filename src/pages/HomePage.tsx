import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStudents } from '../api/auth';
import { getCourses } from '../api/courses';
import type { Student } from '../api/auth';
import type { CourseListItem } from '../api/courses';
import Logo from '../components/Logo';
import ProgressBar from '../components/ProgressBar';

export default function HomePage() {
  const { user, token, logout } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isTeacher = user?.role === 'TEACHER';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      if (isTeacher) {
        getStudents(token)
          .then(setStudents)
          .catch((err) => setError(err.message))
          .finally(() => setIsLoading(false));
      } else {
        getCourses(token)
          .then(setCourses)
          .catch((err) => setError(err.message))
          .finally(() => setIsLoading(false));
      }
    }
  }, [isTeacher, token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <Logo />
        <nav className="header-nav">
          <Link to="/" className="nav-link active">Domů</Link>
          {isTeacher && <Link to="/skupiny" className="nav-link">Skupiny</Link>}
          {isTeacher && <Link to="/kurzy" className="nav-link">Kurzy</Link>}
          {isAdmin && <Link to="/admin" className="nav-link">Admin</Link>}
        </nav>
        <div className="user-info">
          <span>{isAdmin ? 'Admin' : isTeacher ? 'Učitel' : 'Žák'}</span>
          <button onClick={logout} className="btn-secondary">
            Odhlásit se
          </button>
        </div>
      </header>

      <main className="home-content">
        <h2>Vítejte v KodLabu!</h2>
        <p>Platforma pro výuku programování a digitální gramotnosti.</p>

        {error && <div className="error-message">{error}</div>}

        {isTeacher ? (
          <div className="students-section">
            <h3>
              Moji žáci
              <span className="student-count">({students.length})</span>
            </h3>

            {isLoading ? (
              <p>Načítání...</p>
            ) : students.length === 0 ? (
              <div className="empty-state">
                <p>Zatím nemáte žádné žáky.</p>
                <p>Sdílejte kód školy se svými žáky, aby se mohli připojit.</p>
              </div>
            ) : (
              <ul className="students-list">
                {students.map((student) => (
                  <li key={student.id} className="student-item">
                    <span className="student-email">{student.email}</span>
                    <span className="student-date">
                      Registrován: {formatDate(student.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="courses-section">
            <h3>Moje kurzy</h3>

            {isLoading ? (
              <p>Načítání...</p>
            ) : courses.length === 0 ? (
              <div className="empty-state">
                <p>Zatím nemáte přiřazené žádné kurzy.</p>
                <p>Váš učitel vám brzy přiřadí kurzy k výuce.</p>
              </div>
            ) : (
              <div className="course-list">
                {courses.map((course) => (
                  <Link
                    key={course.id}
                    to={`/kurzy/${course.id}`}
                    className="course-card course-card-link"
                  >
                    <div className="course-card-header">
                      <h4>{course.title}</h4>
                    </div>
                    {course.description && (
                      <p className="course-card-desc">{course.description}</p>
                    )}
                    <div className="course-card-progress">
                      <ProgressBar
                        completed={course.completedLessons}
                        total={course.totalLessons}
                      />
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
