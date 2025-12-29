import { useState } from 'react';

interface PrivacyItem {
  id: string;
  text: string;
  isSafeToShare: boolean;
  explanation: string;
  category: 'personal' | 'location' | 'financial' | 'social';
}

interface PrivacyQuizExerciseProps {
  config: {
    items?: PrivacyItem[];
    requiredCorrect?: number;
  };
  onComplete: () => void;
}

const defaultItems: PrivacyItem[] = [
  {
    id: '1',
    text: 'Tvoje oblíbená barva',
    isSafeToShare: true,
    explanation: 'Oblíbená barva je neškodná informace, kterou můžeš sdílet.',
    category: 'personal',
  },
  {
    id: '2',
    text: 'Heslo k emailu',
    isSafeToShare: false,
    explanation: 'Hesla NIKDY nesdílej s nikým, ani s kamarády!',
    category: 'personal',
  },
  {
    id: '3',
    text: 'Adresa tvého bydliště',
    isSafeToShare: false,
    explanation: 'Domácí adresu nesdílej online - cizí lidé by mohli zjistit, kde bydlíš.',
    category: 'location',
  },
  {
    id: '4',
    text: 'Jméno tvého mazlíčka',
    isSafeToShare: true,
    explanation: 'Jméno mazlíčka je většinou bezpečné, ale pozor - nepoužívej ho jako heslo!',
    category: 'personal',
  },
  {
    id: '5',
    text: 'Číslo kreditní karty rodičů',
    isSafeToShare: false,
    explanation: 'Finanční údaje jsou přísně soukromé! Nikdy je nesdílej.',
    category: 'financial',
  },
  {
    id: '6',
    text: 'Tvoje oblíbená hra',
    isSafeToShare: true,
    explanation: 'Informace o koníčcích a hrách jsou bezpečné ke sdílení.',
    category: 'social',
  },
  {
    id: '7',
    text: 'Název školy, kterou navštěvuješ',
    isSafeToShare: false,
    explanation: 'Název školy může pomoci cizím lidem tě najít. Buď opatrný/á!',
    category: 'location',
  },
  {
    id: '8',
    text: 'Datum narození',
    isSafeToShare: false,
    explanation: 'Datum narození je osobní údaj používaný k ověření identity. Nesdílej ho veřejně.',
    category: 'personal',
  },
  {
    id: '9',
    text: 'Oblíbený film nebo seriál',
    isSafeToShare: true,
    explanation: 'Kulturní preference jsou bezpečné ke sdílení.',
    category: 'social',
  },
  {
    id: '10',
    text: 'Telefonní číslo',
    isSafeToShare: false,
    explanation: 'Telefonní číslo je soukromé. Sdílej ho pouze s rodiči a blízkými.',
    category: 'personal',
  },
  {
    id: '11',
    text: 'Fotka tvého pokoje s adresou na dopise',
    isSafeToShare: false,
    explanation: 'Fotky mohou obsahovat citlivé informace jako adresy nebo osobní věci!',
    category: 'location',
  },
  {
    id: '12',
    text: 'Tvůj oblíbený sport',
    isSafeToShare: true,
    explanation: 'Sportovní preference jsou bezpečné ke sdílení.',
    category: 'social',
  },
];

const categoryIcons: Record<string, string> = {
  personal: '👤',
  location: '📍',
  financial: '💳',
  social: '💬',
};

const categoryNames: Record<string, string> = {
  personal: 'Osobní údaje',
  location: 'Poloha',
  financial: 'Finance',
  social: 'Sociální',
};

export default function PrivacyQuizExercise({ config, onComplete }: PrivacyQuizExerciseProps) {
  const items = config.items || defaultItems;
  const requiredCorrect = config.requiredCorrect || Math.ceil(items.length * 0.8);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentItem = items[currentIndex];
  const currentAnswer = answers[currentItem.id];
  const isAnswered = currentAnswer !== undefined && currentAnswer !== null;

  const handleAnswer = (isSafe: boolean) => {
    if (isAnswered) return;
    setAnswers({ ...answers, [currentItem.id]: isSafe });
    setShowResult(true);
  };

  const handleNext = () => {
    setShowResult(false);

    if (currentIndex < items.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const correctCount = items.filter(item => answers[item.id] === item.isSafeToShare).length;
      if (correctCount >= requiredCorrect && !completed) {
        setCompleted(true);
        onComplete();
      }
    }
  };

  const isCorrect = currentAnswer === currentItem.isSafeToShare;
  const answeredCount = Object.keys(answers).length;
  const correctCount = items.filter(item => answers[item.id] === item.isSafeToShare).length;
  const isLastQuestion = currentIndex === items.length - 1;

  return (
    <div className="privacy-quiz-exercise">
      <div className="quiz-progress">
        <span>Otázka {currentIndex + 1} z {items.length}</span>
        <span className="score">Správně: {correctCount}/{answeredCount}</span>
      </div>

      <div className="privacy-question">
        <div className="question-category">
          <span className="category-icon">{categoryIcons[currentItem.category]}</span>
          <span className="category-name">{categoryNames[currentItem.category]}</span>
        </div>

        <h3 className="question-text">
          Je bezpečné sdílet online:
        </h3>

        <div className="privacy-item">
          "{currentItem.text}"
        </div>
      </div>

      {!showResult ? (
        <div className="answer-buttons">
          <button className="btn-safe" onClick={() => handleAnswer(true)}>
            ✅ Ano, můžu sdílet
          </button>
          <button className="btn-private" onClick={() => handleAnswer(false)}>
            🔒 Ne, je to soukromé
          </button>
        </div>
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
                <span>Špatná odpověď</span>
              </>
            )}
          </div>

          <div className="result-explanation">
            <p className={currentItem.isSafeToShare ? 'safe-text' : 'private-text'}>
              {currentItem.isSafeToShare
                ? '✅ Tuto informaci můžeš bezpečně sdílet.'
                : '🔒 Tato informace je soukromá!'}
            </p>
            <p className="explanation-text">{currentItem.explanation}</p>
          </div>

          <button className="btn-next" onClick={handleNext}>
            {!isLastQuestion ? 'Další otázka →' : 'Zobrazit výsledky'}
          </button>
        </div>
      )}

      {isLastQuestion && isAnswered && !showResult && (
        <div className="final-results">
          <h3>Výsledky</h3>
          <div className="final-score">
            <span className="score-number">{correctCount}</span>
            <span className="score-divider">/</span>
            <span className="score-total">{items.length}</span>
          </div>
          <p className="score-message">
            {correctCount === items.length
              ? '🏆 Perfektní! Víš přesně, co sdílet a co ne!'
              : correctCount >= items.length * 0.8
              ? '👍 Výborně! Máš dobré povědomí o soukromí.'
              : correctCount >= items.length * 0.6
              ? '📚 Dobrý začátek, ale ještě si procvič pravidla soukromí.'
              : '⚠️ Buď opatrnější s tím, co sdílíš online!'}
          </p>
          {completed && (
            <div className="completion-badge">
              ✅ Cvičení splněno!
            </div>
          )}
        </div>
      )}

      <div className="privacy-tips">
        <h4>💡 Pravidla online soukromí:</h4>
        <ul>
          <li><strong>🔒 Hesla</strong> - nikdy nesdílej, ani s kamarády</li>
          <li><strong>📍 Adresa a škola</strong> - cizí lidé by tě mohli najít</li>
          <li><strong>💳 Peníze</strong> - čísla karet a účtů jsou tajné</li>
          <li><strong>📸 Fotky</strong> - pozor co je na nich vidět</li>
          <li><strong>✅ Koníčky</strong> - ty sdílet můžeš!</li>
        </ul>
      </div>
    </div>
  );
}
