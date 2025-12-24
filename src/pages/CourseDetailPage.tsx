import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCourseDetail } from '../api/courses';
import type { CourseDetail, ChapterSummary } from '../api/courses';
import Logo from '../components/Logo';

function ChapterAccordion({ chapter, isTeacher }: { chapter: ChapterSummary; isTeacher: boolean }) {
  const [isOpen, setIsOpen] = useState(true);
  const completedCount = chapter.lessons.filter((l) => l.completed).length;

  return (
    <div className="chapter">
      <button className="chapter-header" onClick={() => setIsOpen(!isOpen)}>
        <h4>
          {chapter.title}
          {!isTeacher && (
            <span className="chapter-progress">
              ({completedCount}/{chapter.lessons.length})
            </span>
          )}
        </h4>
        <span className="chapter-toggle">{isOpen ? '▼' : '▶'}</span>
      </button>
      {isOpen && (
        <ul className="lesson-list">
          {chapter.lessons.map((lesson) => (
            <li key={lesson.id}>
              <Link to={`/lekce/${lesson.id}`} className="lesson-item">
                <span className={`lesson-check ${lesson.completed ? 'completed' : ''}`}>
                  {lesson.completed ? '✓' : ''}
                </span>
                <span className="lesson-title">{lesson.title}</span>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function CourseDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token, logout } = useAuth();
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    if (token && id) {
      loadCourse();
    }
  }, [token, id]);

  const loadCourse = async () => {
    if (!token || !id) return;
    setIsLoading(true);
    try {
      const data = await getCourseDetail(token, parseInt(id));
      setCourse(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání');
    } finally {
      setIsLoading(false);
    }
  };

  const totalLessons = course?.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0) || 0;
  const completedLessons = course?.chapters.reduce(
    (sum, ch) => sum + ch.lessons.filter((l) => l.completed).length,
    0
  ) || 0;

  return (
    <div className="home-page">
      <header className="home-header">
        <Logo />
        <nav className="header-nav">
          <Link to="/" className="nav-link">Domů</Link>
          {isTeacher && <Link to="/skupiny" className="nav-link">Skupiny</Link>}
          {isTeacher && <Link to="/kurzy" className="nav-link">Kurzy</Link>}
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
              <Link to="/kurzy" className="back-link">← Zpět na kurzy</Link>
              <h2>{course.title}</h2>
              {course.description && <p className="course-description">{course.description}</p>}
              {!isTeacher && (
                <div className="course-stats">
                  <span>Dokončeno: {completedLessons} z {totalLessons} lekcí</span>
                </div>
              )}
            </div>

            <div className="chapters-container">
              {course.chapters.length === 0 ? (
                <div className="empty-state">
                  <p>Tento kurz zatím nemá žádné kapitoly.</p>
                </div>
              ) : (
                course.chapters.map((chapter) => (
                  <ChapterAccordion
                    key={chapter.id}
                    chapter={chapter}
                    isTeacher={isTeacher}
                  />
                ))
              )}
            </div>
          </>
        ) : null}
      </main>
    </div>
  );
}
