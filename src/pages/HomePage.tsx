import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getStudents, updateAvatar } from '../api/auth';
import { getCourses } from '../api/courses';
import { getAdminStats } from '../api/admin';
import type { Student } from '../api/auth';
import type { CourseListItem } from '../api/courses';
import type { AdminStats } from '../api/admin';
import Logo from '../components/Logo';
import ProgressBar from '../components/ProgressBar';
import AvatarPicker, { getAvatarEmoji } from '../components/AvatarPicker';

export default function HomePage() {
  const { user, token, logout, updateAvatar: updateAvatarContext } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [adminStats, setAdminStats] = useState<AdminStats | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showAvatarPicker, setShowAvatarPicker] = useState(false);

  const isTeacher = user?.role === 'TEACHER';
  const isAdmin = user?.role === 'ADMIN';
  const isStudent = user?.role === 'STUDENT';

  const handleAvatarSelect = async (avatarId: string) => {
    if (!token) return;
    try {
      await updateAvatar(token, avatarId);
      updateAvatarContext(avatarId);
      setShowAvatarPicker(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se uložit avatar');
    }
  };

  useEffect(() => {
    if (token) {
      setIsLoading(true);
      if (isAdmin) {
        getAdminStats(token)
          .then(setAdminStats)
          .catch((err) => setError(err.message))
          .finally(() => setIsLoading(false));
      } else if (isTeacher) {
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
  }, [isTeacher, isAdmin, token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <Logo />
        <nav className="header-nav">
          <Link to="/" className="nav-link active">Domů</Link>
          {isTeacher && <Link to="/prehled" className="nav-link">Přehled</Link>}
          {isTeacher && <Link to="/rvp" className="nav-link">RVP</Link>}
          {isTeacher && <Link to="/skupiny" className="nav-link">Skupiny</Link>}
          {isTeacher && <Link to="/kurzy" className="nav-link">Kurzy</Link>}
          {isAdmin && <Link to="/admin" className="nav-link">Kurzy</Link>}
          {isAdmin && <Link to="/admin/blog" className="nav-link">Blog</Link>}
        </nav>
        <div className="user-info">
          {isStudent && (
            <button
              className="avatar-button"
              onClick={() => setShowAvatarPicker(true)}
              title="Změnit avatar"
            >
              <span className="avatar-emoji">{getAvatarEmoji(user?.avatar || null)}</span>
            </button>
          )}
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

        {isAdmin ? (
          <div className="admin-dashboard">
            <h3>Přehled platformy</h3>
            {isLoading ? (
              <p>Načítání...</p>
            ) : adminStats ? (
              <div className="stats-grid-admin">
                <div className="stat-card stat-card-users">
                  <div className="stat-card-icon">👥</div>
                  <div className="stat-card-content">
                    <div className="stat-card-value">{adminStats.totalUsers}</div>
                    <div className="stat-card-label">Celkem uživatelů</div>
                    <div className="stat-card-detail">
                      {adminStats.students} žáků • {adminStats.teachers} učitelů
                    </div>
                  </div>
                </div>

                <div className="stat-card stat-card-schools">
                  <div className="stat-card-icon">🏫</div>
                  <div className="stat-card-content">
                    <div className="stat-card-value">{adminStats.organizations}</div>
                    <div className="stat-card-label">Škol</div>
                    <div className="stat-card-detail">registrovaných organizací</div>
                  </div>
                </div>

                <div className="stat-card stat-card-courses">
                  <div className="stat-card-icon">📚</div>
                  <div className="stat-card-content">
                    <div className="stat-card-value">{adminStats.totalCourses}</div>
                    <div className="stat-card-label">Kurzů</div>
                    <div className="stat-card-detail">
                      {adminStats.publishedCourses} publikovaných
                    </div>
                  </div>
                </div>

                <div className="stat-card stat-card-exercises">
                  <div className="stat-card-icon">✏️</div>
                  <div className="stat-card-content">
                    <div className="stat-card-value">{adminStats.totalExercises}</div>
                    <div className="stat-card-label">Cvičení</div>
                    <div className="stat-card-detail">ve všech kurzech</div>
                  </div>
                </div>

                <div className="stat-card stat-card-progress">
                  <div className="stat-card-icon">✅</div>
                  <div className="stat-card-content">
                    <div className="stat-card-value">{adminStats.completedLessons}</div>
                    <div className="stat-card-label">Dokončených lekcí</div>
                    <div className="stat-card-detail">
                      {adminStats.completedExercises} dokončených cvičení
                    </div>
                  </div>
                </div>

                <div className="stat-card stat-card-blog">
                  <div className="stat-card-icon">📝</div>
                  <div className="stat-card-content">
                    <div className="stat-card-value">{adminStats.totalBlogPosts}</div>
                    <div className="stat-card-label">Blog článků</div>
                    <div className="stat-card-detail">
                      {adminStats.publishedBlogPosts} publikovaných
                    </div>
                  </div>
                </div>
              </div>
            ) : null}

            <div className="admin-quick-actions">
              <h4>Rychlé akce</h4>
              <div className="quick-actions-grid">
                <Link to="/admin" className="quick-action-card">
                  <span className="quick-action-icon">📚</span>
                  <span>Spravovat kurzy</span>
                </Link>
                <Link to="/admin/blog" className="quick-action-card">
                  <span className="quick-action-icon">📝</span>
                  <span>Spravovat blog</span>
                </Link>
                <Link to="/admin/blog/new" className="quick-action-card">
                  <span className="quick-action-icon">➕</span>
                  <span>Nový článek</span>
                </Link>
              </div>
            </div>
          </div>
        ) : isTeacher ? (
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

      {showAvatarPicker && (
        <AvatarPicker
          currentAvatar={user?.avatar || null}
          onSelect={handleAvatarSelect}
          onClose={() => setShowAvatarPicker(false)}
        />
      )}
    </div>
  );
}
