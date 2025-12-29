import { useState } from 'react';

interface DataRow {
  [key: string]: string | number;
}

interface Question {
  id: string;
  question: string;
  type: 'choice' | 'number';
  options?: string[];
  correctAnswer: string | number;
  hint?: string;
}

interface DatasetConfig {
  title: string;
  description?: string;
  columns: string[];
  data: DataRow[];
  questions: Question[];
}

interface DataDetectiveExerciseProps {
  config: {
    datasets?: DatasetConfig[];
    requiredCorrect?: number;
  };
  onComplete: () => void;
}

const defaultDatasets: DatasetConfig[] = [
  {
    title: 'Třídní výlet',
    description: 'Tabulka ukazuje, kam chtějí spolužáci jet na výlet a kolik jsou ochotni zaplatit.',
    columns: ['Jméno', 'Destinace', 'Částka (Kč)'],
    data: [
      { Jméno: 'Anna', Destinace: 'Zoo', 'Částka (Kč)': 200 },
      { Jméno: 'Petr', Destinace: 'Hrad', 'Částka (Kč)': 150 },
      { Jméno: 'Eva', Destinace: 'Zoo', 'Částka (Kč)': 250 },
      { Jméno: 'Tomáš', Destinace: 'Aquapark', 'Částka (Kč)': 300 },
      { Jméno: 'Marie', Destinace: 'Zoo', 'Částka (Kč)': 200 },
      { Jméno: 'Jan', Destinace: 'Hrad', 'Částka (Kč)': 180 },
    ],
    questions: [
      {
        id: '1',
        question: 'Kolik dětí chce jet do Zoo?',
        type: 'number',
        correctAnswer: 3,
        hint: 'Spočítej řádky, kde je v sloupci "Destinace" napsáno "Zoo".',
      },
      {
        id: '2',
        question: 'Která destinace je nejoblíbenější?',
        type: 'choice',
        options: ['Zoo', 'Hrad', 'Aquapark'],
        correctAnswer: 'Zoo',
        hint: 'Která destinace se vyskytuje nejčastěji?',
      },
      {
        id: '3',
        question: 'Kolik je celková částka od všech dětí?',
        type: 'choice',
        options: ['1080 Kč', '1280 Kč', '1180 Kč'],
        correctAnswer: '1280 Kč',
        hint: 'Sečti všechny částky v posledním sloupci.',
      },
    ],
  },
  {
    title: 'Oblíbené sporty',
    description: 'Anketa o oblíbených sportech ve třídě.',
    columns: ['Sport', 'Počet hlasů', 'Kategorie'],
    data: [
      { Sport: 'Fotbal', 'Počet hlasů': 8, Kategorie: 'Týmový' },
      { Sport: 'Plavání', 'Počet hlasů': 5, Kategorie: 'Individuální' },
      { Sport: 'Basketbal', 'Počet hlasů': 6, Kategorie: 'Týmový' },
      { Sport: 'Tenis', 'Počet hlasů': 3, Kategorie: 'Individuální' },
      { Sport: 'Volejbal', 'Počet hlasů': 4, Kategorie: 'Týmový' },
    ],
    questions: [
      {
        id: '1',
        question: 'Který sport má nejvíce hlasů?',
        type: 'choice',
        options: ['Fotbal', 'Basketbal', 'Plavání'],
        correctAnswer: 'Fotbal',
      },
      {
        id: '2',
        question: 'Kolik hlasů mají dohromady týmové sporty?',
        type: 'number',
        correctAnswer: 18,
        hint: 'Sečti hlasy u sportů, které mají kategorii "Týmový".',
      },
      {
        id: '3',
        question: 'Kolik sportů je individuálních?',
        type: 'number',
        correctAnswer: 2,
      },
    ],
  },
  {
    title: 'Počasí v týdnu',
    description: 'Záznamy teploty a počasí za poslední týden.',
    columns: ['Den', 'Teplota (°C)', 'Počasí', 'Srážky (mm)'],
    data: [
      { Den: 'Pondělí', 'Teplota (°C)': 18, Počasí: 'Slunečno', 'Srážky (mm)': 0 },
      { Den: 'Úterý', 'Teplota (°C)': 15, Počasí: 'Oblačno', 'Srážky (mm)': 0 },
      { Den: 'Středa', 'Teplota (°C)': 12, Počasí: 'Déšť', 'Srážky (mm)': 8 },
      { Den: 'Čtvrtek', 'Teplota (°C)': 14, Počasí: 'Oblačno', 'Srážky (mm)': 2 },
      { Den: 'Pátek', 'Teplota (°C)': 20, Počasí: 'Slunečno', 'Srážky (mm)': 0 },
      { Den: 'Sobota', 'Teplota (°C)': 22, Počasí: 'Slunečno', 'Srážky (mm)': 0 },
      { Den: 'Neděle', 'Teplota (°C)': 19, Počasí: 'Oblačno', 'Srážky (mm)': 1 },
    ],
    questions: [
      {
        id: '1',
        question: 'Který den byl nejteplejší?',
        type: 'choice',
        options: ['Pátek', 'Sobota', 'Pondělí'],
        correctAnswer: 'Sobota',
      },
      {
        id: '2',
        question: 'Kolik dní bylo slunečno?',
        type: 'number',
        correctAnswer: 3,
      },
      {
        id: '3',
        question: 'Jaké byly celkové srážky za týden?',
        type: 'choice',
        options: ['10 mm', '11 mm', '12 mm'],
        correctAnswer: '11 mm',
        hint: 'Sečti všechny hodnoty ve sloupci "Srážky (mm)".',
      },
      {
        id: '4',
        question: 'Jaká byla průměrná teplota? (zaokrouhli na celé číslo)',
        type: 'choice',
        options: ['16 °C', '17 °C', '18 °C'],
        correctAnswer: '17 °C',
        hint: 'Sečti všechny teploty a vyděl počtem dní (7).',
      },
    ],
  },
];

export default function DataDetectiveExercise({ config, onComplete }: DataDetectiveExerciseProps) {
  const datasets = config.datasets || defaultDatasets;
  const requiredCorrect = config.requiredCorrect || Math.ceil(
    datasets.reduce((sum, d) => sum + d.questions.length, 0) * 0.8
  );

  const [currentDatasetIndex, setCurrentDatasetIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, string | number>>({});
  const [showResult, setShowResult] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentDataset = datasets[currentDatasetIndex];
  const currentQuestion = currentDataset.questions[currentQuestionIndex];
  const answerKey = `${currentDatasetIndex}-${currentQuestion.id}`;
  const currentAnswer = answers[answerKey];
  const isAnswered = currentAnswer !== undefined;

  const totalQuestions = datasets.reduce((sum, d) => sum + d.questions.length, 0);
  const totalAnswered = Object.keys(answers).length;
  const correctCount = datasets.reduce((sum, dataset, dIndex) => {
    return sum + dataset.questions.filter((q) => {
      const key = `${dIndex}-${q.id}`;
      return answers[key] !== undefined && String(answers[key]) === String(q.correctAnswer);
    }).length;
  }, 0);

  const handleAnswer = (answer: string | number) => {
    if (isAnswered) return;

    setAnswers({ ...answers, [answerKey]: answer });
    setShowResult(true);
    setShowHint(false);

    // Check completion
    const newAnswerCount = totalAnswered + 1;
    if (newAnswerCount === totalQuestions) {
      const newCorrectCount = datasets.reduce((sum, dataset, dIndex) => {
        return sum + dataset.questions.filter((q) => {
          const key = `${dIndex}-${q.id}`;
          const ans = key === answerKey ? answer : answers[key];
          return ans !== undefined && String(ans) === String(q.correctAnswer);
        }).length;
      }, 0);

      if (newCorrectCount >= requiredCorrect && !completed) {
        setCompleted(true);
        onComplete();
      }
    }
  };

  const handleNumberSubmit = () => {
    const num = parseInt(inputValue);
    if (!isNaN(num)) {
      handleAnswer(num);
      setInputValue('');
    }
  };

  const nextQuestion = () => {
    setShowResult(false);
    setShowHint(false);

    if (currentQuestionIndex < currentDataset.questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else if (currentDatasetIndex < datasets.length - 1) {
      setCurrentDatasetIndex(currentDatasetIndex + 1);
      setCurrentQuestionIndex(0);
    }
  };

  const isCorrect = String(currentAnswer) === String(currentQuestion.correctAnswer);
  const isLastQuestion =
    currentDatasetIndex === datasets.length - 1 &&
    currentQuestionIndex === currentDataset.questions.length - 1;

  return (
    <div className="data-detective-exercise">
      <div className="detective-header">
        <div className="detective-progress">
          <span>Dataset {currentDatasetIndex + 1}/{datasets.length}</span>
          <span className="score">Správně: {correctCount}/{totalAnswered}</span>
        </div>
      </div>

      <div className="dataset-container">
        <div className="dataset-info">
          <h3>📊 {currentDataset.title}</h3>
          {currentDataset.description && <p>{currentDataset.description}</p>}
        </div>

        <div className="data-table-wrapper">
          <table className="data-table">
            <thead>
              <tr>
                {currentDataset.columns.map((col) => (
                  <th key={col}>{col}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentDataset.data.map((row, i) => (
                <tr key={i}>
                  {currentDataset.columns.map((col) => (
                    <td key={col}>{row[col]}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <div className="question-container">
        <div className="question-number">
          Otázka {currentQuestionIndex + 1} z {currentDataset.questions.length}
        </div>

        <h4 className="question-text">🔍 {currentQuestion.question}</h4>

        {!showResult ? (
          <>
            {currentQuestion.type === 'choice' && currentQuestion.options ? (
              <div className="choice-buttons">
                {currentQuestion.options.map((option) => (
                  <button
                    key={option}
                    onClick={() => handleAnswer(option)}
                    className="btn-choice"
                  >
                    {option}
                  </button>
                ))}
              </div>
            ) : (
              <div className="number-input">
                <input
                  type="number"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Zadej číslo"
                  onKeyDown={(e) => e.key === 'Enter' && handleNumberSubmit()}
                />
                <button onClick={handleNumberSubmit} className="btn-submit">
                  Odpovědět
                </button>
              </div>
            )}

            {currentQuestion.hint && (
              <div className="hint-section">
                <button onClick={() => setShowHint(!showHint)} className="btn-hint">
                  💡 {showHint ? 'Skrýt nápovědu' : 'Zobrazit nápovědu'}
                </button>
                {showHint && <p className="hint-text">{currentQuestion.hint}</p>}
              </div>
            )}
          </>
        ) : (
          <div className={`result-container ${isCorrect ? 'correct' : 'incorrect'}`}>
            <div className="result-header">
              {isCorrect ? (
                <>
                  <span className="result-icon">🎉</span>
                  <span>Správně!</span>
                </>
              ) : (
                <>
                  <span className="result-icon">😔</span>
                  <span>Bohužel špatně</span>
                </>
              )}
            </div>

            {!isCorrect && (
              <p className="correct-answer">
                Správná odpověď: <strong>{currentQuestion.correctAnswer}</strong>
              </p>
            )}

            {!isLastQuestion ? (
              <button className="btn-next" onClick={nextQuestion}>
                Další otázka →
              </button>
            ) : (
              <div className="final-results">
                <h3>Výsledky</h3>
                <div className="final-score">
                  <span className="score-number">{correctCount}</span>
                  <span className="score-divider">/</span>
                  <span className="score-total">{totalQuestions}</span>
                </div>
                <p className="score-message">
                  {correctCount === totalQuestions
                    ? '🏆 Perfektní! Jsi pravý datový detektiv!'
                    : correctCount >= totalQuestions * 0.8
                    ? '👍 Výborně! Většinu otázek jsi zodpověděl/a správně.'
                    : correctCount >= totalQuestions * 0.6
                    ? '📚 Dobrá práce, zkus si procvičit čtení z tabulek.'
                    : '⚠️ Zkus si ještě procvičit práci s daty!'}
                </p>
                {completed && (
                  <div className="completion-badge">
                    ✅ Cvičení splněno!
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <div className="detective-tips">
        <h4>💡 Tipy pro práci s daty:</h4>
        <ul>
          <li>Nejprve si přečti názvy sloupců</li>
          <li>Pro sčítání projdi sloupec řádek po řádku</li>
          <li>Průměr = součet všech hodnot ÷ počet hodnot</li>
          <li>Při hledání maxima/minima porovnávej čísla</li>
        </ul>
      </div>
    </div>
  );
}
