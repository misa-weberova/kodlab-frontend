import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLessonDetail, markLessonComplete } from '../api/courses';
import type { LessonDetail } from '../api/courses';
import Logo from '../components/Logo';

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    if (token && id) {
      loadLesson();
    }
  }, [token, id]);

  const loadLesson = async () => {
    if (!token || !id) return;
    setIsLoading(true);
    try {
      const data = await getLessonDetail(token, parseInt(id));
      setLesson(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání');
    } finally {
      setIsLoading(false);
    }
  };

  const handleComplete = async () => {
    if (!token || !id || !lesson) return;
    setIsCompleting(true);
    try {
      await markLessonComplete(token, parseInt(id));
      setLesson({ ...lesson, completed: true });
      if (lesson.nextLessonId) {
        navigate(`/lekce/${lesson.nextLessonId}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba');
    } finally {
      setIsCompleting(false);
    }
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <Logo />
        <nav className="header-nav">
          <Link to="/" className="nav-link">Domů</Link>
          {isTeacher && <Link to="/kurzy" className="nav-link">Kurzy</Link>}
        </nav>
        <div className="user-info">
          <span>{isTeacher ? 'Učitel' : 'Žák'}</span>
          <button onClick={logout} className="btn-secondary">
            Odhlásit se
          </button>
        </div>
      </header>

      <main className="home-content lesson-page">
        {isLoading ? (
          <p>Načítání...</p>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : lesson ? (
          <>
            <div className="lesson-breadcrumb">
              <Link to={`/kurzy/${lesson.courseId}`}>{lesson.courseTitle}</Link>
              <span> / </span>
              <span>{lesson.chapterTitle}</span>
            </div>

            <div className="lesson-content">
              <h2>{lesson.title}</h2>
              {lesson.content ? (
                <div
                  className="lesson-body"
                  dangerouslySetInnerHTML={{ __html: lesson.content }}
                />
              ) : (
                <p className="empty-content">Tato lekce zatím nemá obsah.</p>
              )}
            </div>

            <div className="lesson-nav">
              <div className="nav-left">
                {lesson.prevLessonId && (
                  <Link to={`/lekce/${lesson.prevLessonId}`} className="btn-secondary">
                    ← Předchozí
                  </Link>
                )}
              </div>
              <div className="nav-center">
                {!isTeacher && !lesson.completed && (
                  <button
                    className="btn-primary"
                    onClick={handleComplete}
                    disabled={isCompleting}
                  >
                    {isCompleting ? 'Ukládání...' : 'Označit jako dokončené'}
                  </button>
                )}
                {!isTeacher && lesson.completed && (
                  <span className="completed-badge">✓ Dokončeno</span>
                )}
              </div>
              <div className="nav-right">
                {lesson.nextLessonId && (
                  <Link to={`/lekce/${lesson.nextLessonId}`} className="btn-secondary">
                    Další →
                  </Link>
                )}
              </div>
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
