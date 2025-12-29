import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCourseDetail } from '../api/courses';
import type { CourseDetail, ChapterSummary } from '../api/courses';
import Logo from '../components/Logo';

const CHAPTER_ICONS = ['🚀', '⭐', '🎯', '💡', '🔥', '🎨', '🧩', '🏆', '💎', '🌟'];
const CHAPTER_COLORS = [
  'var(--color-teal)',
  'var(--color-orange)',
  'var(--color-yellow)',
  '#6366f1',
  '#ec4899',
  '#8b5cf6',
  '#14b8a6',
  '#f59e0b',
  '#ef4444',
  '#22c55e'
];

function ProgressRing({ progress, size = 80 }: { progress: number; size?: number }) {
  const strokeWidth = 8;
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;

  return (
    <div className="progress-ring-container">
      <svg width={size} height={size} className="progress-ring">
        <circle
          className="progress-ring-bg"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        <circle
          className="progress-ring-fill"
          strokeWidth={strokeWidth}
          fill="transparent"
          r={radius}
          cx={size / 2}
          cy={size / 2}
          style={{
            strokeDasharray: circumference,
            strokeDashoffset: offset,
          }}
        />
      </svg>
      <div className="progress-ring-text">
        <span className="progress-ring-value">{Math.round(progress)}%</span>
      </div>
    </div>
  );
}

function ChapterAccordion({ chapter, isTeacher, index }: { chapter: ChapterSummary; isTeacher: boolean; index: number }) {
  const [isOpen, setIsOpen] = useState(true);
  const completedCount = chapter.lessons.filter((l) => l.completed).length;
  const isChapterComplete = completedCount === chapter.lessons.length && chapter.lessons.length > 0;
  const chapterIcon = CHAPTER_ICONS[index % CHAPTER_ICONS.length];
  const chapterColor = CHAPTER_COLORS[index % CHAPTER_COLORS.length];

  return (
    <div className={`chapter-fun ${isChapterComplete ? 'chapter-complete' : ''}`} style={{ '--chapter-color': chapterColor } as React.CSSProperties}>
      <button className="chapter-header-fun" onClick={() => setIsOpen(!isOpen)}>
        <div className="chapter-icon-badge">
          {isChapterComplete ? '✅' : chapterIcon}
        </div>
        <div className="chapter-info">
          <h4>{chapter.title}</h4>
          {!isTeacher && (
            <div className="chapter-progress-bar">
              <div
                className="chapter-progress-fill"
                style={{ width: `${chapter.lessons.length > 0 ? (completedCount / chapter.lessons.length) * 100 : 0}%` }}
              />
              <span className="chapter-progress-text">
                {completedCount}/{chapter.lessons.length} lekcí
              </span>
            </div>
          )}
        </div>
        <span className={`chapter-toggle-fun ${isOpen ? 'open' : ''}`}>
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
            <path d="M5 7.5L10 12.5L15 7.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </span>
      </button>
      {isOpen && (
        <ul className="lesson-list-fun">
          {chapter.lessons.map((lesson, lessonIndex) => (
            <li key={lesson.id} style={{ animationDelay: `${lessonIndex * 50}ms` }}>
              <Link to={`/lekce/${lesson.id}`} className={`lesson-item-fun ${lesson.completed ? 'completed' : ''}`}>
                <span className="lesson-number">{lessonIndex + 1}</span>
                <span className="lesson-title-fun">{lesson.title}</span>
                <span className={`lesson-status ${lesson.completed ? 'completed' : ''}`}>
                  {lesson.completed ? (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" fill="var(--color-teal)"/>
                      <path d="M6 10L9 13L14 7" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                      <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2"/>
                    </svg>
                  )}
                </span>
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
          <div className="loading-fun">
            <div className="loading-spinner"></div>
            <p>Načítání kurzu...</p>
          </div>
        ) : error ? (
          <div className="error-message">{error}</div>
        ) : course ? (
          <div className="course-detail-fun">
            <div className="course-header-fun">
              <Link to="/kurzy" className="back-link-fun">
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <path d="M12.5 15L7.5 10L12.5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Zpět na kurzy
              </Link>
              <div className="course-title-section">
                <div className="course-title-content">
                  <h1>{course.title}</h1>
                  {course.description && <p className="course-description-fun">{course.description}</p>}
                </div>
                {!isTeacher && totalLessons > 0 && (
                  <div className="course-progress-section">
                    <ProgressRing progress={(completedLessons / totalLessons) * 100} />
                    <div className="course-progress-label">
                      <span className="progress-count">{completedLessons} z {totalLessons}</span>
                      <span className="progress-text">lekcí hotovo</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="chapters-container-fun">
              {course.chapters.length === 0 ? (
                <div className="empty-state-fun">
                  <span className="empty-icon">📚</span>
                  <p>Tento kurz zatím nemá žádné kapitoly.</p>
                </div>
              ) : (
                course.chapters.map((chapter, index) => (
                  <ChapterAccordion
                    key={chapter.id}
                    chapter={chapter}
                    isTeacher={isTeacher}
                    index={index}
                  />
                ))
              )}
            </div>
          </div>
        ) : null}
      </main>
    </div>
  );
}
