import { useState, useEffect } from 'react';

export interface MatchPair {
  id: string;
  left: string;
  right: string;
}

interface Connection {
  leftId: string;
  rightId: string;
}

interface MatchingExerciseProps {
  pairs: MatchPair[];
  title?: string;
  instruction?: string;
  onComplete?: (isCorrect: boolean, score: number, total: number) => void;
  showResultImmediately?: boolean;
}

// Colors for connected pairs - each pair gets a unique color
const PAIR_COLORS = [
  { bg: 'rgba(42, 139, 122, 0.15)', border: '#2A8B7A', text: '#2A8B7A' },   // teal
  { bg: 'rgba(232, 112, 74, 0.15)', border: '#E8704A', text: '#E8704A' },   // orange
  { bg: 'rgba(99, 102, 241, 0.15)', border: '#6366F1', text: '#6366F1' },   // indigo
  { bg: 'rgba(245, 194, 67, 0.2)', border: '#D4A012', text: '#B8860B' },    // yellow
  { bg: 'rgba(236, 72, 153, 0.15)', border: '#EC4899', text: '#EC4899' },   // pink
  { bg: 'rgba(16, 185, 129, 0.15)', border: '#10B981', text: '#10B981' },   // emerald
  { bg: 'rgba(139, 92, 246, 0.15)', border: '#8B5CF6', text: '#8B5CF6' },   // violet
  { bg: 'rgba(59, 130, 246, 0.15)', border: '#3B82F6', text: '#3B82F6' },   // blue
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function MatchingExercise({
  pairs,
  title = 'Spoj správné dvojice',
  instruction = 'Klikni na pojem vlevo a pak na odpovídající pojem vpravo.',
  onComplete,
  showResultImmediately = false,
}: MatchingExerciseProps) {
  const [shuffledRight, setShuffledRight] = useState<MatchPair[]>([]);
  const [connections, setConnections] = useState<Connection[]>([]);
  const [selectedLeft, setSelectedLeft] = useState<string | null>(null);
  const [checkedResults, setCheckedResults] = useState<Map<string, boolean> | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Initialize shuffled right side
  useEffect(() => {
    setShuffledRight(shuffleArray(pairs));
  }, [pairs]);

  // Get color for a left item based on when it was connected
  const getColorForLeft = (leftId: string) => {
    const idx = connections.findIndex(c => c.leftId === leftId);
    if (idx === -1) return null;
    return PAIR_COLORS[idx % PAIR_COLORS.length];
  };

  // Get color for a right item - matches the color of its connected left item
  const getColorForRight = (rightId: string) => {
    const conn = connections.find(c => c.rightId === rightId);
    if (!conn) return null;
    const idx = connections.findIndex(c => c.leftId === conn.leftId);
    return PAIR_COLORS[idx % PAIR_COLORS.length];
  };

  const handleLeftClick = (id: string) => {
    if (isComplete) return;

    // If already connected, remove the connection
    const existingConnection = connections.find(c => c.leftId === id);
    if (existingConnection) {
      setConnections(connections.filter(c => c.leftId !== id));
      setSelectedLeft(null);
      return;
    }

    setSelectedLeft(id);
  };

  const handleRightClick = (id: string) => {
    if (isComplete || !selectedLeft) return;

    // If this right item is already connected, remove that connection
    const existingConnection = connections.find(c => c.rightId === id);
    if (existingConnection) {
      setConnections(connections.filter(c => c.rightId !== id));
    }

    // Add new connection
    setConnections([
      ...connections.filter(c => c.leftId !== selectedLeft && c.rightId !== id),
      { leftId: selectedLeft, rightId: id }
    ]);
    setSelectedLeft(null);

    // If showing results immediately, check this connection
    if (showResultImmediately) {
      // Could add immediate feedback here in the future
    }
  };

  const checkAnswers = () => {
    const results = new Map<string, boolean>();
    let correctCount = 0;

    connections.forEach(conn => {
      // A connection is correct if the left and right IDs match (same pair)
      const isCorrect = conn.leftId === conn.rightId;
      results.set(conn.leftId, isCorrect);
      if (isCorrect) correctCount++;
    });

    setCheckedResults(results);
    setIsComplete(true);

    if (onComplete) {
      onComplete(correctCount === pairs.length, correctCount, pairs.length);
    }
  };

  const reset = () => {
    setConnections([]);
    setSelectedLeft(null);
    setCheckedResults(null);
    setIsComplete(false);
    setShuffledRight(shuffleArray(pairs));
  };

  const isLeftConnected = (id: string) => connections.some(c => c.leftId === id);
  const isRightConnected = (id: string) => connections.some(c => c.rightId === id);

  const correctCount = checkedResults
    ? Array.from(checkedResults.values()).filter(v => v).length
    : 0;

  // Get the correct answer for a left item (the matching right text)
  const getCorrectAnswer = (leftId: string): string | null => {
    const pair = pairs.find(p => p.id === leftId);
    return pair ? pair.right : null;
  };

  // Get what the user answered for a left item
  const getUserAnswer = (leftId: string): string | null => {
    const conn = connections.find(c => c.leftId === leftId);
    if (!conn) return null;
    const rightPair = pairs.find(p => p.id === conn.rightId);
    return rightPair ? rightPair.right : null;
  };

  // Generate inline style for colored items
  const getLeftItemStyle = (id: string): React.CSSProperties => {
    const color = getColorForLeft(id);
    if (!color) return {};

    // After checking, only keep colors for correct answers
    if (checkedResults) {
      const isCorrect = checkedResults.get(id);
      if (!isCorrect) return {}; // Incorrect items use CSS red styling
      // Correct items keep their color
    }

    return {
      backgroundColor: color.bg,
      borderColor: color.border,
      color: color.text,
    };
  };

  const getRightItemStyle = (id: string): React.CSSProperties => {
    const color = getColorForRight(id);
    if (!color) return {};

    // After checking, only keep colors for correct connections
    if (checkedResults) {
      const conn = connections.find(c => c.rightId === id);
      if (conn) {
        const isCorrect = checkedResults.get(conn.leftId);
        if (!isCorrect) return {}; // Incorrect items use default styling
      }
    }

    return {
      backgroundColor: color.bg,
      borderColor: color.border,
      color: color.text,
    };
  };

  return (
    <div className="matching-exercise">
      <div className="matching-header">
        <h3>{title}</h3>
        <p>{instruction}</p>
      </div>

      <div className="matching-content">
        <div className="matching-column matching-left">
          {pairs.map(pair => (
            <div key={pair.id} className="matching-item-wrapper">
              <button
                className={`matching-item ${selectedLeft === pair.id ? 'selected' : ''} ${
                  isLeftConnected(pair.id) ? 'connected' : ''
                } ${checkedResults?.get(pair.id) === true ? 'correct' : ''} ${
                  checkedResults?.get(pair.id) === false ? 'incorrect' : ''
                }`}
                style={getLeftItemStyle(pair.id)}
                onClick={() => handleLeftClick(pair.id)}
                disabled={isComplete}
              >
                {pair.left}
              </button>
              {checkedResults?.get(pair.id) === false && (
                <div className="matching-correction">
                  <span className="correction-wrong">{getUserAnswer(pair.id)}</span>
                  <span className="correction-arrow">→</span>
                  <span className="correction-right">{getCorrectAnswer(pair.id)}</span>
                </div>
              )}
            </div>
          ))}
        </div>

        <div className="matching-column matching-right">
          {shuffledRight.map(pair => (
            <button
              key={pair.id}
              className={`matching-item ${isRightConnected(pair.id) ? 'connected' : ''} ${
                selectedLeft ? 'selectable' : ''
              }`}
              style={getRightItemStyle(pair.id)}
              onClick={() => handleRightClick(pair.id)}
              disabled={isComplete || !selectedLeft}
            >
              {pair.right}
            </button>
          ))}
        </div>
      </div>

      <div className="matching-footer">
        {!isComplete ? (
          <button
            className="btn-primary matching-check-btn"
            onClick={checkAnswers}
            disabled={connections.length !== pairs.length}
          >
            Zkontrolovat
          </button>
        ) : (
          <div className="matching-result">
            <div className={`matching-score ${correctCount === pairs.length ? 'perfect' : ''}`}>
              {correctCount === pairs.length ? (
                <>Výborně! Vše správně!</>
              ) : (
                <>Správně: {correctCount} z {pairs.length}</>
              )}
            </div>
            <button className="btn-secondary" onClick={reset}>
              Zkusit znovu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
