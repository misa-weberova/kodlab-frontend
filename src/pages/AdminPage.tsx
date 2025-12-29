import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getAllCourses, createCourse, deleteCourse, updateCourse } from '../api/admin';
import type { Course } from '../api/admin';
import Logo from '../components/Logo';

export default function AdminPage() {
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // New course form
  const [showNewCourse, setShowNewCourse] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    if (token) {
      loadCourses();
    }
  }, [token, isAdmin]);

  const loadCourses = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getAllCourses(token);
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCourse = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newTitle.trim()) return;

    setIsCreating(true);
    try {
      await createCourse(token, newTitle.trim(), newDescription.trim() || null);
      setNewTitle('');
      setNewDescription('');
      setShowNewCourse(false);
      await loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při vytváření kurzu');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteCourse = async (courseId: number, courseTitle: string) => {
    if (!token) return;
    if (!confirm(`Opravdu chcete smazat kurz "${courseTitle}"? Tato akce je nevratná.`)) return;

    try {
      await deleteCourse(token, courseId);
      await loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při mazání kurzu');
    }
  };

  const handleTogglePublished = async (course: Course) => {
    if (!token) return;
    try {
      await updateCourse(token, course.id, { published: !course.published });
      await loadCourses();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při změně stavu');
    }
  };

  if (!isAdmin) return null;

  return (
    <div className="home-page">
      <header className="home-header">
        <Logo />
        <nav className="header-nav">
          <Link to="/" className="nav-link">Domů</Link>
          <Link to="/admin" className="nav-link active">Kurzy</Link>
          <Link to="/admin/blog" className="nav-link">Blog</Link>
        </nav>
        <div className="user-info">
          <span>Admin</span>
          <button onClick={logout} className="btn-secondary">
            Odhlásit se
          </button>
        </div>
      </header>

      <main className="home-content">
        <div className="admin-header">
          <h1>Správa kurzů</h1>
          <button
            className="btn-primary"
            onClick={() => setShowNewCourse(true)}
          >
            + Nový kurz
          </button>
        </div>

        {error && <div className="error-message">{error}</div>}

        {showNewCourse && (
          <div className="admin-form-card">
            <h2>Vytvořit nový kurz</h2>
            <form onSubmit={handleCreateCourse}>
              <div className="form-group">
                <label htmlFor="title">Název kurzu *</label>
                <input
                  id="title"
                  type="text"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="např. Úvod do programování"
                  required
                />
              </div>
              <div className="form-group">
                <label htmlFor="description">Popis</label>
                <textarea
                  id="description"
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Krátký popis kurzu..."
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => {
                    setShowNewCourse(false);
                    setNewTitle('');
                    setNewDescription('');
                  }}
                >
                  Zrušit
                </button>
                <button
                  type="submit"
                  className="btn-primary"
                  disabled={isCreating || !newTitle.trim()}
                >
                  {isCreating ? 'Vytvářím...' : 'Vytvořit kurz'}
                </button>
              </div>
            </form>
          </div>
        )}

        {isLoading ? (
          <p>Načítání...</p>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <p>Zatím nejsou žádné kurzy.</p>
            <p>Klikněte na "Nový kurz" pro vytvoření prvního kurzu.</p>
          </div>
        ) : (
          <div className="admin-courses-list">
            {courses.map((course) => (
              <div key={course.id} className="admin-course-card">
                <div className="admin-course-header">
                  <div className="admin-course-info">
                    <h3>{course.title}</h3>
                    {course.description && (
                      <p className="admin-course-description">{course.description}</p>
                    )}
                    <div className="admin-course-meta">
                      <span className={`status-badge ${course.published ? 'published' : 'draft'}`}>
                        {course.published ? 'Publikováno' : 'Koncept'}
                      </span>
                      <span className="meta-item">
                        {course.chapters.length} kapitol
                      </span>
                      <span className="meta-item">
                        {course.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)} lekcí
                      </span>
                    </div>
                  </div>
                  <div className="admin-course-actions">
                    <button
                      className={`btn-toggle ${course.published ? 'active' : ''}`}
                      onClick={() => handleTogglePublished(course)}
                      title={course.published ? 'Skrýt kurz' : 'Publikovat kurz'}
                    >
                      {course.published ? 'Skrýt' : 'Publikovat'}
                    </button>
                    <Link
                      to={`/admin/kurzy/${course.id}`}
                      className="btn-secondary"
                    >
                      Upravit
                    </Link>
                    <button
                      className="btn-danger"
                      onClick={() => handleDeleteCourse(course.id, course.title)}
                    >
                      Smazat
                    </button>
                  </div>
                </div>

                {course.chapters.length > 0 && (
                  <div className="admin-course-chapters">
                    {course.chapters.map((chapter) => (
                      <div key={chapter.id} className="admin-chapter-item">
                        <span className="chapter-title">{chapter.title}</span>
                        <span className="chapter-lessons">
                          {chapter.lessons.length} lekcí
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
