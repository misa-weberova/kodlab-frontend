import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  getExercises,
  updateLesson,
  createExercise,
  updateExercise,
  deleteExercise,
} from '../api/admin';
import type { Exercise, ExerciseConfig } from '../api/admin';
import { getLessonDetail } from '../api/courses';
import type { LessonDetail } from '../api/courses';
import Logo from '../components/Logo';

type ExerciseType = 'CODE' | 'MATCHING' | 'GAPFILL' | 'CROSSWORD' | 'SORTING' | 'CATEGORY';

const exerciseTypeLabels: Record<ExerciseType, string> = {
  CODE: 'Programování',
  MATCHING: 'Spojování párů',
  GAPFILL: 'Doplňování',
  CROSSWORD: 'Křížovka',
  SORTING: 'Řazení',
  CATEGORY: 'Třídění do kategorií',
};

export default function AdminLessonEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user, token, logout } = useAuth();
  const [lesson, setLesson] = useState<LessonDetail | null>(null);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Edit state
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');

  // Exercise editing
  const [editingExercise, setEditingExercise] = useState<number | null>(null);
  const [showNewExercise, setShowNewExercise] = useState(false);
  const [newExerciseType, setNewExerciseType] = useState<ExerciseType>('CODE');

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isAdmin) {
      navigate('/');
      return;
    }
    if (token && id) {
      loadLesson();
    }
  }, [token, id, isAdmin]);

  const loadLesson = async () => {
    if (!token || !id) return;
    setIsLoading(true);
    try {
      const lessonData = await getLessonDetail(token, parseInt(id));
      setLesson(lessonData);
      setTitle(lessonData.title);
      setContent(lessonData.content || '');

      const exercisesData = await getExercises(token, parseInt(id));
      setExercises(exercisesData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSaveLesson = async () => {
    if (!token || !lesson) return;
    setIsSaving(true);
    try {
      await updateLesson(token, lesson.id, {
        title: title.trim(),
        content: content.trim() || null,
      });
      await loadLesson();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při ukládání');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCreateExercise = async () => {
    if (!token || !lesson) return;
    try {
      const defaultConfig = getDefaultConfig(newExerciseType);
      await createExercise(token, lesson.id, {
        type: newExerciseType,
        title: `Nové cvičení`,
        instruction: 'Zadání cvičení...',
        config: JSON.stringify(defaultConfig),
      });
      setShowNewExercise(false);
      await loadLesson();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při vytváření cvičení');
    }
  };

  const handleDeleteExercise = async (exerciseId: number) => {
    if (!token) return;
    if (!confirm('Opravdu chcete smazat toto cvičení?')) return;
    try {
      await deleteExercise(token, exerciseId);
      await loadLesson();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při mazání cvičení');
    }
  };

  const handleSaveExercise = async (exercise: Exercise, updates: Partial<Exercise>) => {
    if (!token) return;
    try {
      await updateExercise(token, exercise.id, {
        type: updates.type || exercise.type,
        title: updates.title !== undefined ? (updates.title || undefined) : (exercise.title || undefined),
        instruction: updates.instruction !== undefined ? (updates.instruction || undefined) : (exercise.instruction || undefined),
        config: updates.config !== undefined ? (updates.config || undefined) : (exercise.config || undefined),
      });
      setEditingExercise(null);
      await loadLesson();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při ukládání cvičení');
    }
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
        {lesson && (
          <div className="admin-editor-header">
            <Link to={`/admin/kurzy/${lesson.courseId}`} className="back-link">
              ← Zpět na {lesson.courseTitle}
            </Link>
          </div>
        )}

        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <p>Načítání...</p>
        ) : lesson ? (
          <>
            {/* Lesson Info Section */}
            <div className="admin-form-card">
              <h2>Informace o lekci</h2>
              <div className="form-group">
                <label htmlFor="lessonTitle">Název lekce *</label>
                <input
                  id="lessonTitle"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>
              <div className="form-group">
                <label htmlFor="lessonContent">Obsah lekce (Markdown)</label>
                <textarea
                  id="lessonContent"
                  value={content}
                  onChange={(e) => setContent(e.target.value)}
                  rows={10}
                  className="lesson-content-textarea"
                />
              </div>
              <div className="form-actions">
                <button
                  className="btn-primary"
                  onClick={handleSaveLesson}
                  disabled={isSaving || !title.trim()}
                >
                  {isSaving ? 'Ukládám...' : 'Uložit změny'}
                </button>
              </div>
            </div>

            {/* Exercises Section */}
            <div className="admin-exercises-section">
              <div className="section-header">
                <h2>Cvičení ({exercises.length})</h2>
                <button
                  className="btn-primary"
                  onClick={() => setShowNewExercise(true)}
                >
                  + Přidat cvičení
                </button>
              </div>

              {showNewExercise && (
                <div className="admin-form-card">
                  <h3>Nové cvičení</h3>
                  <div className="form-group">
                    <label>Typ cvičení</label>
                    <div className="exercise-type-grid">
                      {(Object.entries(exerciseTypeLabels) as [ExerciseType, string][]).map(
                        ([type, label]) => (
                          <button
                            key={type}
                            className={`exercise-type-btn ${newExerciseType === type ? 'selected' : ''}`}
                            onClick={() => setNewExerciseType(type)}
                          >
                            {label}
                          </button>
                        )
                      )}
                    </div>
                  </div>
                  <div className="form-actions">
                    <button
                      type="button"
                      className="btn-secondary"
                      onClick={() => setShowNewExercise(false)}
                    >
                      Zrušit
                    </button>
                    <button className="btn-primary" onClick={handleCreateExercise}>
                      Vytvořit cvičení
                    </button>
                  </div>
                </div>
              )}

              {exercises.length === 0 ? (
                <div className="empty-state">
                  <p>Tato lekce zatím nemá žádná cvičení.</p>
                </div>
              ) : (
                <div className="admin-exercises-list">
                  {exercises.map((exercise) => (
                    <ExerciseEditor
                      key={exercise.id}
                      exercise={exercise}
                      isEditing={editingExercise === exercise.id}
                      onEdit={() => setEditingExercise(exercise.id)}
                      onCancel={() => setEditingExercise(null)}
                      onSave={(updates) => handleSaveExercise(exercise, updates)}
                      onDelete={() => handleDeleteExercise(exercise.id)}
                    />
                  ))}
                </div>
              )}
            </div>
          </>
        ) : (
          <div className="error-message">Lekce nenalezena</div>
        )}
      </main>
    </div>
  );
}

// Helper to get default config for each exercise type
function getDefaultConfig(type: ExerciseType): ExerciseConfig {
  switch (type) {
    case 'CODE':
      return {
        initialCode: '# Napiš svůj kód zde\n',
        expectedOutput: 'Hello, World!',
      };
    case 'MATCHING':
      return {
        pairs: [
          { id: '1', left: 'Levá strana 1', right: 'Pravá strana 1' },
          { id: '2', left: 'Levá strana 2', right: 'Pravá strana 2' },
        ],
      };
    case 'GAPFILL':
      return {
        sentence: 'Doplň [___] do věty.',
        answers: ['slovo'],
        distractors: ['jiné'],
      };
    case 'CROSSWORD':
      return {
        words: [
          { id: '1', word: 'SLOVO', clue: 'Nápověda ke slovu', row: 0, col: 0, direction: 'across' as const },
        ],
      };
    case 'SORTING':
      return {
        items: [
          { id: '1', text: 'První' },
          { id: '2', text: 'Druhý' },
          { id: '3', text: 'Třetí' },
        ],
        correctOrder: ['1', '2', '3'],
      };
    case 'CATEGORY':
      return {
        categories: [
          { id: '1', title: 'Kategorie A' },
          { id: '2', title: 'Kategorie B' },
        ],
        categoryItems: [
          { id: '1', text: 'Položka 1', correctCategoryId: '1' },
          { id: '2', text: 'Položka 2', correctCategoryId: '2' },
        ],
      };
    default:
      return {};
  }
}

// Exercise Editor Component
interface ExerciseEditorProps {
  exercise: Exercise;
  isEditing: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onSave: (updates: Partial<Exercise>) => void;
  onDelete: () => void;
}

function ExerciseEditor({
  exercise,
  isEditing,
  onEdit,
  onCancel,
  onSave,
  onDelete,
}: ExerciseEditorProps) {
  const [title, setTitle] = useState(exercise.title || '');
  const [instruction, setInstruction] = useState(exercise.instruction || '');
  const [config, setConfig] = useState<ExerciseConfig>(() => {
    try {
      return exercise.config ? JSON.parse(exercise.config) : {};
    } catch {
      return {};
    }
  });

  const handleSave = () => {
    onSave({
      title: title.trim() || null,
      instruction: instruction.trim() || null,
      config: JSON.stringify(config),
    });
  };

  if (!isEditing) {
    return (
      <div className="admin-exercise-card">
        <div className="admin-exercise-header">
          <div className="exercise-info">
            <span className="exercise-type-badge">
              {exerciseTypeLabels[exercise.type as ExerciseType] || exercise.type}
            </span>
            <h4>{exercise.title || 'Bez názvu'}</h4>
          </div>
          <div className="exercise-actions">
            <button className="btn-secondary btn-small" onClick={onEdit}>
              Upravit
            </button>
            <button className="btn-danger btn-small" onClick={onDelete}>
              Smazat
            </button>
          </div>
        </div>
        {exercise.instruction && (
          <p className="exercise-instruction-preview">{exercise.instruction}</p>
        )}
      </div>
    );
  }

  return (
    <div className="admin-exercise-card editing">
      <div className="form-group">
        <label>Název cvičení</label>
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Volitelný název cvičení"
        />
      </div>
      <div className="form-group">
        <label>Zadání</label>
        <textarea
          value={instruction}
          onChange={(e) => setInstruction(e.target.value)}
          placeholder="Instrukce pro studenta..."
          rows={2}
        />
      </div>

      {/* Exercise-specific configurator */}
      <ExerciseConfigurator
        type={exercise.type as ExerciseType}
        config={config}
        onChange={setConfig}
      />

      <div className="form-actions">
        <button className="btn-secondary" onClick={onCancel}>
          Zrušit
        </button>
        <button className="btn-primary" onClick={handleSave}>
          Uložit cvičení
        </button>
      </div>
    </div>
  );
}

// Exercise Configurator - renders different forms based on type
interface ExerciseConfiguratorProps {
  type: ExerciseType;
  config: ExerciseConfig;
  onChange: (config: ExerciseConfig) => void;
}

function ExerciseConfigurator({ type, config, onChange }: ExerciseConfiguratorProps) {
  switch (type) {
    case 'CODE':
      return <CodeExerciseConfig config={config} onChange={onChange} />;
    case 'MATCHING':
      return <MatchingExerciseConfig config={config} onChange={onChange} />;
    case 'GAPFILL':
      return <GapFillExerciseConfig config={config} onChange={onChange} />;
    case 'CROSSWORD':
      return <CrosswordExerciseConfig config={config} onChange={onChange} />;
    case 'SORTING':
      return <SortingExerciseConfig config={config} onChange={onChange} />;
    case 'CATEGORY':
      return <CategoryExerciseConfig config={config} onChange={onChange} />;
    default:
      return <div>Neznámý typ cvičení</div>;
  }
}

// Code Exercise Config
function CodeExerciseConfig({
  config,
  onChange,
}: {
  config: ExerciseConfig;
  onChange: (c: ExerciseConfig) => void;
}) {
  return (
    <div className="exercise-config">
      <div className="form-group">
        <label>Výchozí kód</label>
        <textarea
          value={config.initialCode || ''}
          onChange={(e) => onChange({ ...config, initialCode: e.target.value })}
          rows={5}
          className="code-textarea"
        />
      </div>
      <div className="form-group">
        <label>Očekávaný výstup</label>
        <textarea
          value={config.expectedOutput || ''}
          onChange={(e) => onChange({ ...config, expectedOutput: e.target.value })}
          rows={3}
          className="code-textarea"
        />
      </div>
    </div>
  );
}

// Matching Exercise Config
function MatchingExerciseConfig({
  config,
  onChange,
}: {
  config: ExerciseConfig;
  onChange: (c: ExerciseConfig) => void;
}) {
  const pairs = config.pairs || [];

  const addPair = () => {
    const newId = String(Date.now());
    onChange({
      ...config,
      pairs: [...pairs, { id: newId, left: '', right: '' }],
    });
  };

  const updatePair = (index: number, field: 'left' | 'right', value: string) => {
    const newPairs = [...pairs];
    newPairs[index] = { ...newPairs[index], [field]: value };
    onChange({ ...config, pairs: newPairs });
  };

  const removePair = (index: number) => {
    onChange({ ...config, pairs: pairs.filter((_, i) => i !== index) });
  };

  return (
    <div className="exercise-config">
      <label>Páry k spojení</label>
      <div className="pairs-list">
        {pairs.map((pair, index) => (
          <div key={pair.id} className="pair-row">
            <input
              type="text"
              value={pair.left}
              onChange={(e) => updatePair(index, 'left', e.target.value)}
              placeholder="Levá strana"
            />
            <span className="pair-arrow">↔</span>
            <input
              type="text"
              value={pair.right}
              onChange={(e) => updatePair(index, 'right', e.target.value)}
              placeholder="Pravá strana"
            />
            <button
              type="button"
              className="btn-danger btn-small"
              onClick={() => removePair(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn-secondary btn-small" onClick={addPair}>
        + Přidat pár
      </button>
    </div>
  );
}

// Gap Fill Exercise Config
function GapFillExerciseConfig({
  config,
  onChange,
}: {
  config: ExerciseConfig;
  onChange: (c: ExerciseConfig) => void;
}) {
  const answers = config.answers || [];
  const distractors = config.distractors || [];

  return (
    <div className="exercise-config">
      <div className="form-group">
        <label>Věta s mezerami (použijte [___] pro mezeru)</label>
        <textarea
          value={config.sentence || ''}
          onChange={(e) => onChange({ ...config, sentence: e.target.value })}
          rows={3}
          placeholder="Příklad: Python je [___] jazyk."
        />
      </div>
      <div className="form-group">
        <label>Správné odpovědi (oddělené čárkou)</label>
        <input
          type="text"
          value={answers.join(', ')}
          onChange={(e) =>
            onChange({
              ...config,
              answers: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            })
          }
          placeholder="programovací, skriptovací"
        />
      </div>
      <div className="form-group">
        <label>Distraktory (špatné odpovědi, oddělené čárkou)</label>
        <input
          type="text"
          value={distractors.join(', ')}
          onChange={(e) =>
            onChange({
              ...config,
              distractors: e.target.value.split(',').map((s) => s.trim()).filter(Boolean),
            })
          }
          placeholder="mluvený, značkovací"
        />
      </div>
    </div>
  );
}

// Crossword Exercise Config
function CrosswordExerciseConfig({
  config,
  onChange,
}: {
  config: ExerciseConfig;
  onChange: (c: ExerciseConfig) => void;
}) {
  const words = config.words || [];

  const addWord = () => {
    const newId = String(Date.now());
    onChange({
      ...config,
      words: [...words, { id: newId, word: '', clue: '', row: 0, col: 0, direction: 'across' as const }],
    });
  };

  const updateWord = (
    index: number,
    field: keyof (typeof words)[0],
    value: string | number
  ) => {
    const newWords = [...words];
    newWords[index] = { ...newWords[index], [field]: value };
    onChange({ ...config, words: newWords });
  };

  const removeWord = (index: number) => {
    onChange({ ...config, words: words.filter((_, i) => i !== index) });
  };

  return (
    <div className="exercise-config">
      <label>Slova křížovky</label>
      <div className="crossword-words-list">
        {words.map((word, index) => (
          <div key={word.id} className="crossword-word-row">
            <input
              type="text"
              value={word.word}
              onChange={(e) => updateWord(index, 'word', e.target.value.toUpperCase())}
              placeholder="SLOVO"
              className="word-input"
            />
            <input
              type="text"
              value={word.clue}
              onChange={(e) => updateWord(index, 'clue', e.target.value)}
              placeholder="Nápověda"
              className="clue-input"
            />
            <input
              type="number"
              value={word.row}
              onChange={(e) => updateWord(index, 'row', parseInt(e.target.value) || 0)}
              placeholder="Řádek"
              className="position-input"
              min={0}
            />
            <input
              type="number"
              value={word.col}
              onChange={(e) => updateWord(index, 'col', parseInt(e.target.value) || 0)}
              placeholder="Sloupec"
              className="position-input"
              min={0}
            />
            <select
              value={word.direction}
              onChange={(e) => updateWord(index, 'direction', e.target.value)}
            >
              <option value="across">Vodorovně</option>
              <option value="down">Svisle</option>
            </select>
            <button
              type="button"
              className="btn-danger btn-small"
              onClick={() => removeWord(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn-secondary btn-small" onClick={addWord}>
        + Přidat slovo
      </button>
    </div>
  );
}

// Sorting Exercise Config
function SortingExerciseConfig({
  config,
  onChange,
}: {
  config: ExerciseConfig;
  onChange: (c: ExerciseConfig) => void;
}) {
  const items = config.items || [];

  const addItem = () => {
    const newId = String(Date.now());
    const newItems = [...items, { id: newId, text: '' }];
    onChange({
      ...config,
      items: newItems,
      correctOrder: newItems.map((i) => i.id),
    });
  };

  const updateItem = (index: number, value: string) => {
    const newItems = [...items];
    newItems[index] = { ...newItems[index], text: value };
    onChange({ ...config, items: newItems });
  };

  const removeItem = (index: number) => {
    const removedId = items[index].id;
    const newItems = items.filter((_, i) => i !== index);
    const newOrder = (config.correctOrder || []).filter((id) => id !== removedId);
    onChange({ ...config, items: newItems, correctOrder: newOrder });
  };

  return (
    <div className="exercise-config">
      <p className="config-hint">
        Zadejte položky ve správném pořadí. Studentům se zobrazí zamíchané.
      </p>
      <div className="form-group">
        <label>Popisek začátku (volitelné)</label>
        <input
          type="text"
          value={config.startLabel || ''}
          onChange={(e) => onChange({ ...config, startLabel: e.target.value })}
          placeholder="např. První"
        />
      </div>
      <div className="form-group">
        <label>Popisek konce (volitelné)</label>
        <input
          type="text"
          value={config.endLabel || ''}
          onChange={(e) => onChange({ ...config, endLabel: e.target.value })}
          placeholder="např. Poslední"
        />
      </div>
      <label>Položky k seřazení (ve správném pořadí)</label>
      <div className="sorting-items-list">
        {items.map((item, index) => (
          <div key={item.id} className="sorting-item-row">
            <span className="item-number">{index + 1}.</span>
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateItem(index, e.target.value)}
              placeholder="Text položky"
            />
            <button
              type="button"
              className="btn-danger btn-small"
              onClick={() => removeItem(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn-secondary btn-small" onClick={addItem}>
        + Přidat položku
      </button>
    </div>
  );
}

// Category Exercise Config
function CategoryExerciseConfig({
  config,
  onChange,
}: {
  config: ExerciseConfig;
  onChange: (c: ExerciseConfig) => void;
}) {
  const categories = config.categories || [];
  const categoryItems = config.categoryItems || [];

  const addCategory = () => {
    const newId = String(Date.now());
    onChange({
      ...config,
      categories: [...categories, { id: newId, title: '' }],
    });
  };

  const updateCategory = (index: number, value: string) => {
    const newCats = [...categories];
    newCats[index] = { ...newCats[index], title: value };
    onChange({ ...config, categories: newCats });
  };

  const removeCategory = (index: number) => {
    const removedId = categories[index].id;
    onChange({
      ...config,
      categories: categories.filter((_, i) => i !== index),
      categoryItems: categoryItems.filter((item) => item.correctCategoryId !== removedId),
    });
  };

  const addItem = () => {
    const newId = String(Date.now());
    onChange({
      ...config,
      categoryItems: [
        ...categoryItems,
        { id: newId, text: '', correctCategoryId: categories[0]?.id || '' },
      ],
    });
  };

  const updateItem = (index: number, field: 'text' | 'correctCategoryId', value: string) => {
    const newItems = [...categoryItems];
    newItems[index] = { ...newItems[index], [field]: value };
    onChange({ ...config, categoryItems: newItems });
  };

  const removeItem = (index: number) => {
    onChange({
      ...config,
      categoryItems: categoryItems.filter((_, i) => i !== index),
    });
  };

  return (
    <div className="exercise-config">
      <label>Kategorie</label>
      <div className="categories-list">
        {categories.map((cat, index) => (
          <div key={cat.id} className="category-row">
            <input
              type="text"
              value={cat.title}
              onChange={(e) => updateCategory(index, e.target.value)}
              placeholder="Název kategorie"
            />
            <button
              type="button"
              className="btn-danger btn-small"
              onClick={() => removeCategory(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button type="button" className="btn-secondary btn-small" onClick={addCategory}>
        + Přidat kategorii
      </button>

      <label style={{ marginTop: '1rem' }}>Položky k třídění</label>
      <div className="category-items-list">
        {categoryItems.map((item, index) => (
          <div key={item.id} className="category-item-row">
            <input
              type="text"
              value={item.text}
              onChange={(e) => updateItem(index, 'text', e.target.value)}
              placeholder="Text položky"
            />
            <select
              value={item.correctCategoryId}
              onChange={(e) => updateItem(index, 'correctCategoryId', e.target.value)}
            >
              <option value="">Vyberte kategorii</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.title || '(bez názvu)'}
                </option>
              ))}
            </select>
            <button
              type="button"
              className="btn-danger btn-small"
              onClick={() => removeItem(index)}
            >
              ×
            </button>
          </div>
        ))}
      </div>
      <button
        type="button"
        className="btn-secondary btn-small"
        onClick={addItem}
        disabled={categories.length === 0}
      >
        + Přidat položku
      </button>
    </div>
  );
}
