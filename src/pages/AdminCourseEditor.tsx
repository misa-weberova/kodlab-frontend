import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getAllCourses,
  updateCourse,
  createChapter,
  deleteChapter,
  createLesson,
  deleteLesson,
} from '../api/admin';
import type { Course } from '../api/admin';
import Logo from '../components/Logo';

export default function AdminCourseEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Edit state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  // New chapter form
  const [showNewChapter, setShowNewChapter] = useState(false);
  const [newChapterTitle, setNewChapterTitle] = useState('');

  // New lesson form
  const [showNewLesson, setShowNewLesson] = useState<number | null>(null);
  const [newLessonTitle, setNewLessonTitle] = useState('');

  // Expanded chapters
  const [expandedChapters, setExpandedChapters] = useState<Set<number>>(new Set());

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    if (token && id) {
      loadCourse();
    }
  }, [token, id, isAdmin]);

  const loadCourse = async () => {
    if (!token || !id) return;
    setIsLoading(true);
    try {
      const courses = await getAllCourses(token);
      const found = courses.find((c) => c.id === parseInt(id));
      if (found) {
        setCourse(found);
        setTitle(found.title);
        setDescription(found.description || '');
        // Expand all chapters by default
        setExpandedChapters(new Set(found.chapters.map((c) => c.id)));
      } else {
        setError('Kurz nenalezen');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveCourse = async () => {
    if (!token || !course) return;
    setIsSaving(true);
    try {
      await updateCourse(token, course.id, {
        title: title.trim(),
        description: description.trim() || null,
      });
      await loadCourse();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při ukládání');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateChapter = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !course || !newChapterTitle.trim()) return;
    try {
      const newChapter = await createChapter(token, course.id, newChapterTitle.trim());
      setNewChapterTitle('');
      setShowNewChapter(false);
      setExpandedChapters((prev) => new Set([...prev, newChapter.id]));
      await loadCourse();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při vytváření kapitoly');
    }
  };

  const handleDeleteChapter = async (chapterId: number, chapterTitle: string) => {
    if (!token) return;
    if (!confirm(`Opravdu chcete smazat kapitolu "${chapterTitle}"? Tím se smažou i všechny lekce v ní.`)) return;
    try {
      await deleteChapter(token, chapterId);
      await loadCourse();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při mazání kapitoly');
    }
  };

  const handleCreateLesson = async (e: React.FormEvent, chapterId: number) => {
    e.preventDefault();
    if (!token || !newLessonTitle.trim()) return;
    try {
      await createLesson(token, chapterId, newLessonTitle.trim(), null);
      setNewLessonTitle('');
      setShowNewLesson(null);
      await loadCourse();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při vytváření lekce');
    }
  };

  const handleDeleteLesson = async (lessonId: number, lessonTitle: string) => {
    if (!token) return;
    if (!confirm(`Opravdu chcete smazat lekci "${lessonTitle}"?`)) return;
    try {
      await deleteLesson(token, lessonId);
      await loadCourse();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při mazání lekce');
    }
  };

  const toggleChapter = (chapterId: number) => {
    setExpandedChapters((prev) => {
      const next = new Set(prev);
      if (next.has(chapterId)) {
        next.delete(chapterId);
      } else {
        next.add(chapterId);
      }
      return next;
    });
  };

  if (!isAdmin) return null;

  return (
    <div className="home-page">
      <header className="home-header">
        <Logo />
        <nav className="header-nav">
          <Link to="/" className="nav-link">Domů</Link>
          <Link to="/admin" className="nav-link">Admin</Link>
        </nav>
        <div className="user-info">
          <span>Admin</span>
          <button onClick={logout} className="btn-secondary">
            Odhlásit se
          </button>
        </div>
      </header>

      <main className="home-content admin-editor">
        <div className="admin-editor-header">
          <Link to="/admin" className="back-link">← Zpět na seznam kurzů</Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <p>Načítání...</p>
        ) : course ? (
          <>
            {/* Course Info Section */}
            <div className="admin-form-card">
              <h2>Informace o kurzu</h2>
              <div className="form-group">
                <label htmlFor="courseTitle">Název kurzu *</label>
                <input
                  id="courseTitle"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="courseDescription">Popis</label>
                <textarea
                  id="courseDescription"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                />
              </div>
              <div className="form-actions">
                <button
                  className="btn-primary"
                  onClick={handleSaveCourse}
                  disabled={isSaving || !title.trim()}
                >
                  {isSaving ? 'Ukládám...' : 'Uložit změny'}
                </button>
              </div>
            </div>

            {/* Chapters Section */}
            <div className="admin-chapters-section">
              <div className="section-header">
                <h2>Kapitoly a lekce</h2>
                <button
                  className="btn-primary"
                  onClick={() => setShowNewChapter(true)}
                >
                  + Přidat kapitolu
                </button>
              </div>

              {showNewChapter && (
                <form onSubmit={handleCreateChapter} className="inline-form">
                  <input
                    type="text"
                    value={newChapterTitle}
                    onChange={(e) => setNewChapterTitle(e.target.value)}
                    placeholder="Název kapitoly"
                    autoFocus
                  />
                  <button type="submit" className="btn-primary" disabled={!newChapterTitle.trim()}>
                    Vytvořit
                  </button>
                  <button
                    type="button"
                    className="btn-secondary"
                    onClick={() => {
                      setShowNewChapter(false);
                      setNewChapterTitle('');
                    }}
                  >
                    Zrušit
                  </button>
                </form>
              )}

              {course.chapters.length === 0 ? (
                <div className="empty-state">
                  <p>Tento kurz zatím nemá žádné kapitoly.</p>
                </div>
              ) : (
                <div className="admin-chapters-list">
                  {course.chapters.map((chapter) => (
                    <div key={chapter.id} className="admin-chapter-card">
                      <div
                        className="admin-chapter-header"
                        onClick={() => toggleChapter(chapter.id)}
                      >
                        <span className={`expand-icon ${expandedChapters.has(chapter.id) ? 'expanded' : ''}`}>
                          ▶
                        </span>
                        <h3>{chapter.title}</h3>
                        <span className="chapter-lesson-count">
                          {chapter.lessons.length} lekcí
                        </span>
                        <div className="chapter-actions" onClick={(e) => e.stopPropagation()}>
                          <button
                            className="btn-danger btn-small"
                            onClick={() => handleDeleteChapter(chapter.id, chapter.title)}
                          >
                            Smazat
                          </button>
                        </div>
                      </div>

                      {expandedChapters.has(chapter.id) && (
                        <div className="admin-lessons-list">
                          {chapter.lessons.map((lesson) => (
                            <div key={lesson.id} className="admin-lesson-item">
                              <span className="lesson-title">{lesson.title}</span>
                              <span className="lesson-exercises">
                                {lesson.exercises.length} cvičení
                              </span>
                              <div className="lesson-actions">
                                <Link
                                  to={`/admin/lekce/${lesson.id}`}
                                  className="btn-secondary btn-small"
                                >
                                  Upravit
                                </Link>
                                <button
                                  className="btn-danger btn-small"
                                  onClick={() => handleDeleteLesson(lesson.id, lesson.title)}
                                >
                                  Smazat
                                </button>
                              </div>
                            </div>
                          ))}

                          {showNewLesson === chapter.id ? (
                            <form
                              onSubmit={(e) => handleCreateLesson(e, chapter.id)}
                              className="inline-form"
                            >
                              <input
                                type="text"
                                value={newLessonTitle}
                                onChange={(e) => setNewLessonTitle(e.target.value)}
                                placeholder="Název lekce"
                                autoFocus
                              />
                              <button
                                type="submit"
                                className="btn-primary btn-small"
                                disabled={!newLessonTitle.trim()}
                              >
                                Vytvořit
                              </button>
                              <button
                                type="button"
                                className="btn-secondary btn-small"
                                onClick={() => {
                                  setShowNewLesson(null);
                                  setNewLessonTitle('');
                                }}
                              >
                                Zrušit
                              </button>
                            </form>
                          ) : (
                            <button
                              className="btn-add-lesson"
                              onClick={() => setShowNewLesson(chapter.id)}
                            >
                              + Přidat lekci
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="error-message">Kurz nenalezen</div>
        )}
      </main>
    </div>
  );
}
