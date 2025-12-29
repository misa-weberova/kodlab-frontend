import { useState } from 'react';

type ChallengeType = 'binary_to_decimal' | 'decimal_to_binary' | 'binary_to_letter' | 'decode_message';

interface Challenge {
  id: string;
  type: ChallengeType;
  question: string;
  correctAnswer: string;
  hint?: string;
}

interface BinaryDecoderExerciseProps {
  config: {
    challenges?: Challenge[];
    requiredCorrect?: number;
  };
  onComplete: () => void;
}

const defaultChallenges: Challenge[] = [
  // Binary to decimal conversions (easy)
  {
    id: '1',
    type: 'binary_to_decimal',
    question: '0101',
    correctAnswer: '5',
    hint: 'Spočítej: 0×8 + 1×4 + 0×2 + 1×1',
  },
  {
    id: '2',
    type: 'binary_to_decimal',
    question: '1010',
    correctAnswer: '10',
    hint: 'Spočítej: 1×8 + 0×4 + 1×2 + 0×1',
  },
  {
    id: '3',
    type: 'binary_to_decimal',
    question: '1111',
    correctAnswer: '15',
    hint: 'Spočítej: 1×8 + 1×4 + 1×2 + 1×1',
  },
  // Decimal to binary
  {
    id: '4',
    type: 'decimal_to_binary',
    question: '7',
    correctAnswer: '0111',
    hint: '7 = 4 + 2 + 1 = 0×8 + 1×4 + 1×2 + 1×1',
  },
  {
    id: '5',
    type: 'decimal_to_binary',
    question: '12',
    correctAnswer: '1100',
    hint: '12 = 8 + 4 = 1×8 + 1×4 + 0×2 + 0×1',
  },
  // Binary to letter (ASCII simplified - A=1, B=2, etc.)
  {
    id: '6',
    type: 'binary_to_letter',
    question: '00001',
    correctAnswer: 'A',
    hint: '00001 v desítkové = 1, a 1. písmeno abecedy je A',
  },
  {
    id: '7',
    type: 'binary_to_letter',
    question: '00011',
    correctAnswer: 'C',
    hint: '00011 v desítkové = 3, a 3. písmeno abecedy je C',
  },
  // Decode secret message
  {
    id: '8',
    type: 'decode_message',
    question: '00001 01000 01111 01010',
    correctAnswer: 'AHOJ',
    hint: 'Každá skupina je jedno písmeno: A=1, H=8, O=15, J=10',
  },
];

const typeLabels: Record<ChallengeType, string> = {
  binary_to_decimal: 'Binární → Desítkově',
  decimal_to_binary: 'Desítkově → Binárně',
  binary_to_letter: 'Binární → Písmeno',
  decode_message: 'Dekóduj zprávu',
};

const typeIcons: Record<ChallengeType, string> = {
  binary_to_decimal: '🔢',
  decimal_to_binary: '💻',
  binary_to_letter: '🔤',
  decode_message: '📨',
};

export default function BinaryDecoderExercise({ config, onComplete }: BinaryDecoderExerciseProps) {
  const challenges = config.challenges || defaultChallenges;
  const requiredCorrect = config.requiredCorrect || Math.ceil(challenges.length * 0.8);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [inputValue, setInputValue] = useState('');
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentChallenge = challenges[currentIndex];
  const isAnswered = answers[currentChallenge.id] !== undefined;
  const correctCount = Object.values(answers).filter(Boolean).length;
  const answeredCount = Object.keys(answers).length;

  const handleSubmit = () => {
    if (!inputValue.trim() || isAnswered) return;

    const userAnswer = inputValue.trim().toUpperCase();
    const correctAnswer = currentChallenge.correctAnswer.toUpperCase();

    // Normalize binary answers (remove leading zeros for comparison)
    let isCorrect = false;
    if (currentChallenge.type === 'decimal_to_binary') {
      // For binary answers, compare without leading zeros
      const normalizedUser = userAnswer.replace(/^0+/, '') || '0';
      const normalizedCorrect = correctAnswer.replace(/^0+/, '') || '0';
      isCorrect = normalizedUser === normalizedCorrect;
    } else {
      isCorrect = userAnswer === correctAnswer;
    }

    setAnswers({ ...answers, [currentChallenge.id]: isCorrect });
    setShowResult(true);

    // Check completion
    const newCorrectCount = correctCount + (isCorrect ? 1 : 0);
    if (answeredCount + 1 === challenges.length && newCorrectCount >= requiredCorrect && !completed) {
      setCompleted(true);
      onComplete();
    }
  };

  const nextChallenge = () => {
    setShowResult(false);
    setShowHint(false);
    setInputValue('');

    if (currentIndex < challenges.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const isCorrect = answers[currentChallenge.id];
  const isLastChallenge = currentIndex === challenges.length - 1;

  // Helper to render binary visualization
  const renderBinaryVisualization = (binary: string) => {
    const bits = binary.replace(/\s/g, '').split('');
    const powers = bits.map((_, i) => Math.pow(2, bits.length - 1 - i));

    return (
      <div className="binary-visualization">
        <div className="binary-row powers">
          {powers.map((p, i) => (
            <span key={i} className="power-cell">{p}</span>
          ))}
        </div>
        <div className="binary-row bits">
          {bits.map((bit, i) => (
            <span key={i} className={`bit-cell ${bit === '1' ? 'on' : 'off'}`}>{bit}</span>
          ))}
        </div>
      </div>
    );
  };

  // Helper to convert binary to decimal for explanation
  const binaryToDecimal = (binary: string): number => {
    return parseInt(binary.replace(/\s/g, ''), 2);
  };

  // Letter lookup (1=A, 2=B, ...)
  const numberToLetter = (num: number): string => {
    if (num >= 1 && num <= 26) {
      return String.fromCharCode(64 + num);
    }
    return '?';
  };

  return (
    <div className="binary-decoder-exercise">
      <div className="binary-progress">
        <span>Úkol {currentIndex + 1} z {challenges.length}</span>
        <span className="score">Správně: {correctCount}/{answeredCount}</span>
      </div>

      <div className="binary-challenge">
        <div className="challenge-type">
          <span className="type-icon">{typeIcons[currentChallenge.type]}</span>
          <span className="type-label">{typeLabels[currentChallenge.type]}</span>
        </div>

        <div className="challenge-content">
          {currentChallenge.type === 'binary_to_decimal' && (
            <>
              <p className="challenge-instruction">Převeď binární číslo na desítkové:</p>
              <div className="binary-number">{currentChallenge.question}</div>
              {renderBinaryVisualization(currentChallenge.question)}
            </>
          )}

          {currentChallenge.type === 'decimal_to_binary' && (
            <>
              <p className="challenge-instruction">Převeď desítkové číslo na binární (4 bity):</p>
              <div className="decimal-number">{currentChallenge.question}</div>
            </>
          )}

          {currentChallenge.type === 'binary_to_letter' && (
            <>
              <p className="challenge-instruction">Převeď binární číslo na písmeno (A=1, B=2, ...):</p>
              <div className="binary-number">{currentChallenge.question}</div>
              <p className="sub-hint">Číslo {binaryToDecimal(currentChallenge.question)} = {binaryToDecimal(currentChallenge.question)}. písmeno abecedy</p>
            </>
          )}

          {currentChallenge.type === 'decode_message' && (
            <>
              <p className="challenge-instruction">Dekóduj tajnou zprávu (A=1, B=2, ...):</p>
              <div className="binary-message">{currentChallenge.question}</div>
              <p className="sub-hint">Každá skupina binárních čísel = jedno písmeno</p>
            </>
          )}
        </div>

        {!showResult && (
          <>
            <div className="answer-input">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={
                  currentChallenge.type === 'decimal_to_binary'
                    ? 'Napiš binární číslo (např. 0101)'
                    : currentChallenge.type === 'decode_message'
                    ? 'Napiš dekódovanou zprávu'
                    : currentChallenge.type === 'binary_to_letter'
                    ? 'Napiš písmeno'
                    : 'Napiš číslo'
                }
                onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
              />
              <button onClick={handleSubmit} className="btn-submit" disabled={!inputValue.trim()}>
                Zkontrolovat
              </button>
            </div>

            {currentChallenge.hint && (
              <div className="hint-section">
                <button onClick={() => setShowHint(!showHint)} className="btn-hint">
                  💡 {showHint ? 'Skrýt nápovědu' : 'Nápověda'}
                </button>
                {showHint && <p className="hint-text">{currentChallenge.hint}</p>}
              </div>
            )}
          </>
        )}

        {showResult && (
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

            <div className="correct-answer">
              <span>Správná odpověď: </span>
              <strong>{currentChallenge.correctAnswer}</strong>
            </div>

            {!isLastChallenge ? (
              <button className="btn-next" onClick={nextChallenge}>
                Další úkol →
              </button>
            ) : (
              <div className="final-results">
                <h3>Výsledky</h3>
                <div className="final-score">
                  <span className="score-number">{correctCount}</span>
                  <span className="score-divider">/</span>
                  <span className="score-total">{challenges.length}</span>
                </div>
                <p className="score-message">
                  {correctCount === challenges.length
                    ? '🏆 Perfektní! Jsi expert na binární kód!'
                    : correctCount >= challenges.length * 0.8
                    ? '👍 Výborně! Binární čísla ti jdou skvěle.'
                    : correctCount >= challenges.length * 0.6
                    ? '📚 Dobrý začátek, zkus si binární převody procvičit.'
                    : '⚠️ Binární kód potřebuje trochu více cviku!'}
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

      <div className="binary-reference">
        <h4>💡 Binární systém:</h4>
        <div className="reference-content">
          <div className="reference-table">
            <div className="ref-header">
              <span>Pozice</span>
              <span>8</span>
              <span>4</span>
              <span>2</span>
              <span>1</span>
            </div>
            <div className="ref-example">
              <span>Např. 1010</span>
              <span>1</span>
              <span>0</span>
              <span>1</span>
              <span>0</span>
            </div>
            <div className="ref-calc">
              <span>= 8+2 = 10</span>
            </div>
          </div>
          <div className="letter-reference">
            <p>Písmena: A=1, B=2, C=3, ... Z=26</p>
          </div>
        </div>
      </div>
    </div>
  );
}
