import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getLessonDetail, markLessonComplete } from '../api/courses';
import type { LessonDetail } from '../api/courses';
import Logo from '../components/Logo';
import CodeEditor from '../components/CodeEditor';
import MatchingExercise from '../components/MatchingExercise';
import GapFillExercise from '../components/GapFillExercise';
import CrosswordExercise from '../components/CrosswordExercise';
import SortingExercise from '../components/SortingExercise';
import CategorySortExercise from '../components/CategorySortExercise';
import ExerciseCarousel from '../components/ExerciseCarousel';

// Demo data for the crossword - valid intersecting words
// Grid layout:
//     0   1   2   3   4
// 0   P   R   I   N   T
// 1   Y
// 2   T   R   U   E
// 3   H
// 4   O
// 5   N
const demoCrosswordWords = [
  { id: '1', word: 'PRINT', clue: 'Příkaz pro výpis textu na obrazovku', row: 0, col: 0, direction: 'across' as const },
  { id: '2', word: 'PYTHON', clue: 'Populární programovací jazyk pro začátečníky', row: 0, col: 0, direction: 'down' as const },
  { id: '3', word: 'TRUE', clue: 'Logická hodnota "pravda"', row: 2, col: 0, direction: 'across' as const },
  { id: '4', word: 'INPUT', clue: 'Příkaz pro vstup od uživatele', row: 0, col: 2, direction: 'down' as const },
];

// Demo data for the category sort exercise
const demoCategoryBoxes = [
  { id: 'hardware', title: 'Hardware', color: 'teal' },
  { id: 'software', title: 'Software', color: 'orange' },
  { id: 'data', title: 'Data', color: 'indigo' },
];
const demoCategoryItems = [
  { id: '1', text: 'Procesor', correctCategoryId: 'hardware' },
  { id: '2', text: 'Operační systém', correctCategoryId: 'software' },
  { id: '3', text: 'Obrázek', correctCategoryId: 'data' },
  { id: '4', text: 'Monitor', correctCategoryId: 'hardware' },
  { id: '5', text: 'Webový prohlížeč', correctCategoryId: 'software' },
  { id: '6', text: 'Textový dokument', correctCategoryId: 'data' },
  { id: '7', text: 'Klávesnice', correctCategoryId: 'hardware' },
  { id: '8', text: 'Antivirový program', correctCategoryId: 'software' },
  { id: '9', text: 'Video', correctCategoryId: 'data' },
];

// Demo data for the sorting exercise - data types by size (smallest to largest)
const demoSortingItems = [
  { id: 'bit', text: 'bit', displayValue: '1 bit' },
  { id: 'byte', text: 'byte', displayValue: '8 bitů' },
  { id: 'kb', text: 'kilobyte (KB)', displayValue: '1 024 B' },
  { id: 'mb', text: 'megabyte (MB)', displayValue: '1 024 KB' },
  { id: 'gb', text: 'gigabyte (GB)', displayValue: '1 024 MB' },
];
// Correct order from smallest to largest
const demoSortingOrder = ['bit', 'byte', 'kb', 'mb', 'gb'];

// Demo data for the matching exercise
const demoMatchingPairs = [
  { id: '1', left: 'print()', right: 'Výpis na obrazovku' },
  { id: '2', left: 'input()', right: 'Vstup od uživatele' },
  { id: '3', left: 'for', right: 'Cyklus' },
  { id: '4', left: 'if', right: 'Podmínka' },
  { id: '5', left: 'def', right: 'Definice funkce' },
];

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
              titles={[
                'Obsah lekce',
                'Napiš kód',
                'Spoj příkazy',
                'Doplň slova',
                'Křížovka',
                'Seřaď jednotky',
                'Roztřiď pojmy',
              ]}
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
                      <p>V této lekci se naučíš základy programování v Pythonu.</p>
                      <ul>
                        <li><strong>print()</strong> - příkaz pro výpis textu na obrazovku</li>
                        <li><strong>input()</strong> - příkaz pro získání vstupu od uživatele</li>
                        <li><strong>proměnné</strong> - místa pro ukládání dat</li>
                      </ul>
                      <p>Až si přečteš obsah, klikni na šipku vpravo nebo vyber další cvičení nahoře.</p>
                    </div>
                  )}
                </div>
                <div className="lesson-content-footer">
                  <span className="lesson-content-hint">Pokračuj na další cvičení →</span>
                </div>
              </div>

              <CodeEditor
                title="Tvůj první program"
                instruction="Napiš kód v Pythonu, který vypíše pozdrav."
                task="Napiš program, který vypíše 'Ahoj, světe!' na obrazovku."
                expectedOutput="Ahoj, světe!"
                initialCode="# Napiš svůj kód zde\n"
              />

              <MatchingExercise
                pairs={demoMatchingPairs}
                title="Spoj příkazy s jejich významem"
                instruction="Klikni na příkaz vlevo a pak na jeho význam vpravo."
              />

              <GapFillExercise
                sentence="Příkaz ___ slouží k vypsání textu na obrazovku. Pro získání vstupu od uživatele použijeme ___."
                answers={['print()', 'input()']}
                distractors={['for', 'while']}
                title="Doplň správná slova"
                instruction="Vyber slovo z nabídky a klikni na mezeru, kam patří."
              />

              <CrosswordExercise
                words={demoCrosswordWords}
                title="Programátorská křížovka"
                instruction="Vyplň křížovku podle nápověd. Klikni na políčko a piš."
              />

              <SortingExercise
                items={demoSortingItems}
                correctOrder={demoSortingOrder}
                title="Seřaď jednotky podle velikosti"
                instruction="Seřaď datové jednotky od nejmenší po největší. Přetáhni položky nebo použij šipky."
                startLabel="Nejmenší"
                endLabel="Největší"
              />

              <CategorySortExercise
                categories={demoCategoryBoxes}
                items={demoCategoryItems}
                title="Roztřiď pojmy do kategorií"
                instruction="Přetáhni každou položku do správné kategorie."
              />
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
