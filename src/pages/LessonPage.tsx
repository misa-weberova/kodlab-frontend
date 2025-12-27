import { useState, useEffect, useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLessonDetail, markLessonComplete } from '../api/courses';
import type { LessonDetail, ExerciseData } from '../api/courses';
import Logo from '../components/Logo';
import CodeEditor from '../components/CodeEditor';
import MatchingExercise from '../components/MatchingExercise';
import GapFillExercise from '../components/GapFillExercise';
import CrosswordExercise from '../components/CrosswordExercise';
import SortingExercise from '../components/SortingExercise';
import CategorySortExercise from '../components/CategorySortExercise';
import ExerciseCarousel from '../components/ExerciseCarousel';

// Parse exercise config safely
function parseConfig(configStr: string | null): Record<string, unknown> {
  if (!configStr) return {};
  try {
    return JSON.parse(configStr);
  } catch {
    return {};
  }
}

// Render an exercise based on its type
function renderExercise(exercise: ExerciseData): React.ReactNode {
  const config = parseConfig(exercise.config);

  switch (exercise.type) {
    case 'CODE':
      return (
        <CodeEditor
          key={exercise.id}
          title={exercise.title || 'Naprogramuj'}
          instruction={exercise.instruction || 'Napiš kód podle zadání.'}
          task={exercise.instruction || 'Napiš program.'}
          expectedOutput={(config.expectedOutput as string) || ''}
          initialCode={(config.initialCode as string) || '# Napiš svůj kód zde\n'}
        />
      );

    case 'MATCHING':
      return (
        <MatchingExercise
          key={exercise.id}
          pairs={(config.pairs as { id: string; left: string; right: string }[]) || []}
          title={exercise.title || 'Spoj páry'}
          instruction={exercise.instruction || 'Spoj odpovídající položky.'}
        />
      );

    case 'GAPFILL':
      return (
        <GapFillExercise
          key={exercise.id}
          sentence={(config.sentence as string) || ''}
          answers={(config.answers as string[]) || []}
          distractors={(config.distractors as string[]) || []}
          title={exercise.title || 'Doplň slova'}
          instruction={exercise.instruction || 'Doplň chybějící slova.'}
        />
      );

    case 'CROSSWORD':
      return (
        <CrosswordExercise
          key={exercise.id}
          words={
            (config.words as {
              id: string;
              word: string;
              clue: string;
              row: number;
              col: number;
              direction: 'across' | 'down';
            }[]) || []
          }
          title={exercise.title || 'Křížovka'}
          instruction={exercise.instruction || 'Vyplň křížovku podle nápověd.'}
        />
      );

    case 'SORTING':
      return (
        <SortingExercise
          key={exercise.id}
          items={
            (config.items as { id: string; text: string; displayValue?: string }[]) || []
          }
          correctOrder={(config.correctOrder as string[]) || []}
          title={exercise.title || 'Seřaď položky'}
          instruction={exercise.instruction || 'Seřaď položky ve správném pořadí.'}
          startLabel={(config.startLabel as string) || undefined}
          endLabel={(config.endLabel as string) || undefined}
        />
      );

    case 'CATEGORY':
      return (
        <CategorySortExercise
          key={exercise.id}
          categories={
            (config.categories as { id: string; title: string; color?: string }[]) || []
          }
          items={
            (config.categoryItems as {
              id: string;
              text: string;
              correctCategoryId: string;
            }[]) || []
          }
          title={exercise.title || 'Roztřiď do kategorií'}
          instruction={exercise.instruction || 'Roztřiď položky do správných kategorií.'}
        />
      );

    default:
      return (
        <div key={exercise.id} className="unknown-exercise">
          <p>Neznámý typ cvičení: {exercise.type}</p>
        </div>
      );
  }
}

export default function LessonPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isCompleting, setIsCompleting] = useState(false);

  const isTeacher = user?.role === 'TEACHER';
  const isAdmin = user?.role === 'ADMIN';

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

  // Memoize exercise titles for the carousel
  const exerciseTitles = useMemo(() => {
    if (!lesson) return ['Obsah lekce'];
    return [
      'Obsah lekce',
      ...lesson.exercises.map((ex) => ex.title || getDefaultTitle(ex.type)),
    ];
  }, [lesson]);

  return (
    <div className="home-page">
      <header className="home-header">
        <Logo />
        <nav className="header-nav">
          <Link to="/" className="nav-link">Domů</Link>
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

            <ExerciseCarousel
              titles={exerciseTitles}
              onAllComplete={(totalScore, totalPossible) => {
                console.log(`Všechna cvičení dokončena! Skóre: ${totalScore}/${totalPossible}`);
              }}
            >
              {/* Lesson Content as first "exercise" */}
              <div className="lesson-content-card">
                <div className="lesson-content-header">
                  <h3>{lesson.title}</h3>
                  <p>Přečti si obsah lekce a pak pokračuj na cvičení.</p>
                </div>
                <div className="lesson-content-body">
                  {lesson.content ? (
                    <div
                      className="lesson-body"
                      dangerouslySetInnerHTML={{ __html: lesson.content }}
                    />
                  ) : (
                    <div className="lesson-placeholder">
                      <h4>Vítej v lekci!</h4>
                      <p>Obsah lekce zatím nebyl přidán.</p>
                      <p>Až si přečteš obsah, klikni na šipku vpravo nebo vyber další cvičení nahoře.</p>
                    </div>
                  )}
                </div>
                <div className="lesson-content-footer">
                  {lesson.exercises.length > 0 ? (
                    <span className="lesson-content-hint">Pokračuj na další cvičení →</span>
                  ) : (
                    <span className="lesson-content-hint">Tato lekce nemá žádná cvičení.</span>
                  )}
                </div>
              </div>

              {/* Render exercises dynamically */}
              {lesson.exercises.map((exercise) => renderExercise(exercise))}
            </ExerciseCarousel>

            <div className="lesson-nav">
              <div className="nav-left">
                {lesson.prevLessonId && (
                  <Link to={`/lekce/${lesson.prevLessonId}`} className="btn-secondary">
                    ← Předchozí
                  </Link>
                )}
              </div>
              <div className="nav-center">
                {!isTeacher && !isAdmin && !lesson.completed && (
                  <button
                    className="btn-primary"
                    onClick={handleComplete}
                    disabled={isCompleting}
                  >
                    {isCompleting ? 'Ukládání...' : 'Označit jako dokončené'}
                  </button>
                )}
                {!isTeacher && !isAdmin && lesson.completed && (
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

// Helper function to get default title based on exercise type
function getDefaultTitle(type: string): string {
  switch (type) {
    case 'CODE':
      return 'Programování';
    case 'MATCHING':
      return 'Spojování';
    case 'GAPFILL':
      return 'Doplňování';
    case 'CROSSWORD':
      return 'Křížovka';
    case 'SORTING':
      return 'Řazení';
    case 'CATEGORY':
      return 'Třídění';
    default:
      return 'Cvičení';
  }
}
