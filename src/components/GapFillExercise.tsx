import { useState, useEffect, useMemo } from 'react';

export interface GapFillExerciseProps {
  // The sentence with gaps marked as ___
  sentence: string;
  // The correct words in order of gaps
  answers: string[];
  // Optional extra distractor words (wrong answers)
  distractors?: string[];
  title?: string;
  instruction?: string;
  onComplete?: (isCorrect: boolean, score: number, total: number) => void;
}

interface WordItem {
  id: string;
  text: string;
  isCorrectFor: number | null; // Gap index this word is correct for, null for distractors
}

// Colors for placed words
const WORD_COLORS = [
  { bg: 'rgba(42, 139, 122, 0.15)', border: '#2A8B7A', text: '#2A8B7A' },
  { bg: 'rgba(232, 112, 74, 0.15)', border: '#E8704A', text: '#E8704A' },
  { bg: 'rgba(99, 102, 241, 0.15)', border: '#6366F1', text: '#6366F1' },
  { bg: 'rgba(245, 194, 67, 0.2)', border: '#D4A012', text: '#B8860B' },
  { bg: 'rgba(236, 72, 153, 0.15)', border: '#EC4899', text: '#EC4899' },
  { bg: 'rgba(16, 185, 129, 0.15)', border: '#10B981', text: '#10B981' },
  { bg: 'rgba(139, 92, 246, 0.15)', border: '#8B5CF6', text: '#8B5CF6' },
  { bg: 'rgba(59, 130, 246, 0.15)', border: '#3B82F6', text: '#3B82F6' },
];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function GapFillExercise({
  sentence,
  answers,
  distractors = [],
  title = 'Doplň slova do vět',
  instruction = 'Vyber slovo a klikni na mezeru, kam ho chceš umístit.',
  onComplete,
}: GapFillExerciseProps) {
  // Parse sentence into parts (text and gaps)
  const sentenceParts = useMemo(() => {
    const parts: Array<{ type: 'text' | 'gap'; content: string; gapIndex?: number }> = [];
    const segments = sentence.split('___');

    segments.forEach((segment, index) => {
      if (segment) {
        parts.push({ type: 'text', content: segment });
      }
      if (index < segments.length - 1) {
        parts.push({ type: 'gap', content: '', gapIndex: index });
      }
    });

    return parts;
  }, [sentence]);

  const gapCount = sentenceParts.filter(p => p.type === 'gap').length;

  // Create word items from answers and distractors
  const allWords = useMemo(() => {
    const words: WordItem[] = [
      ...answers.map((text, index) => ({
        id: `answer-${index}`,
        text,
        isCorrectFor: index,
      })),
      ...distractors.map((text, index) => ({
        id: `distractor-${index}`,
        text,
        isCorrectFor: null,
      })),
    ];
    return shuffleArray(words);
  }, [answers, distractors]);

  const [shuffledWords, setShuffledWords] = useState<WordItem[]>([]);
  const [placements, setPlacements] = useState<(string | null)[]>([]); // wordId for each gap
  const [selectedWordId, setSelectedWordId] = useState<string | null>(null);
  const [checkedResults, setCheckedResults] = useState<(boolean | null)[] | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Initialize
  useEffect(() => {
    setShuffledWords(allWords);
    setPlacements(new Array(gapCount).fill(null));
  }, [allWords, gapCount]);

  // Get word by ID
  const getWordById = (id: string | null): WordItem | undefined => {
    if (!id) return undefined;
    return shuffledWords.find(w => w.id === id);
  };

  // Check if a word is placed somewhere
  const isWordPlaced = (wordId: string): boolean => {
    return placements.includes(wordId);
  };

  // Get which gap a word is placed in
  const getWordGapIndex = (wordId: string): number => {
    return placements.indexOf(wordId);
  };

  // Handle clicking a word in the bank
  const handleWordClick = (wordId: string) => {
    if (isComplete) return;

    if (isWordPlaced(wordId)) {
      // Remove from gap and deselect
      const gapIndex = getWordGapIndex(wordId);
      const newPlacements = [...placements];
      newPlacements[gapIndex] = null;
      setPlacements(newPlacements);
      setSelectedWordId(null);
    } else {
      // Select/deselect
      setSelectedWordId(selectedWordId === wordId ? null : wordId);
    }
  };

  // Handle clicking a gap
  const handleGapClick = (gapIndex: number) => {
    if (isComplete) return;

    const currentWordInGap = placements[gapIndex];

    if (currentWordInGap) {
      // Gap has a word - remove it and place selected word if any
      const newPlacements = [...placements];
      newPlacements[gapIndex] = selectedWordId;
      setPlacements(newPlacements);
      setSelectedWordId(null);
    } else if (selectedWordId) {
      // Gap is empty and we have a selected word - place it
      const newPlacements = [...placements];
      newPlacements[gapIndex] = selectedWordId;
      setPlacements(newPlacements);
      setSelectedWordId(null);
    }
  };

  // Check answers
  const checkAnswers = () => {
    const results: (boolean | null)[] = placements.map((wordId, gapIndex) => {
      if (!wordId) return null;
      const word = getWordById(wordId);
      return word?.isCorrectFor === gapIndex;
    });

    setCheckedResults(results);
    setIsComplete(true);

    const correctCount = results.filter(r => r === true).length;
    if (onComplete) {
      onComplete(correctCount === gapCount, correctCount, gapCount);
    }
  };

  // Reset
  const reset = () => {
    setShuffledWords(shuffleArray(allWords));
    setPlacements(new Array(gapCount).fill(null));
    setSelectedWordId(null);
    setCheckedResults(null);
    setIsComplete(false);
  };

  // Get color for a placed word based on gap index
  const getColorForGap = (gapIndex: number) => {
    return WORD_COLORS[gapIndex % WORD_COLORS.length];
  };

  // Get style for word in bank
  const getWordStyle = (wordId: string): React.CSSProperties => {
    const gapIndex = getWordGapIndex(wordId);
    if (gapIndex === -1) return {};

    // After checking, hide colors for incorrect
    if (checkedResults && checkedResults[gapIndex] === false) return {};

    const color = getColorForGap(gapIndex);
    return {
      backgroundColor: color.bg,
      borderColor: color.border,
      color: color.text,
    };
  };

  // Get style for gap
  const getGapStyle = (gapIndex: number): React.CSSProperties => {
    const wordId = placements[gapIndex];
    if (!wordId) return {};

    // After checking, different styling for correct/incorrect
    if (checkedResults) {
      if (checkedResults[gapIndex] === false) return {};
    }

    const color = getColorForGap(gapIndex);
    return {
      backgroundColor: color.bg,
      borderColor: color.border,
      color: color.text,
    };
  };

  const allGapsFilled = placements.every(p => p !== null);
  const correctCount = checkedResults
    ? checkedResults.filter(r => r === true).length
    : 0;

  // Get correct answer for a gap
  const getCorrectAnswerForGap = (gapIndex: number): string => {
    return answers[gapIndex] || '';
  };

  return (
    <div className="gapfill-exercise">
      <div className="gapfill-header">
        <h3>{title}</h3>
        <p>{instruction}</p>
      </div>

      <div className="gapfill-sentence">
        {sentenceParts.map((part, index) => {
          if (part.type === 'text') {
            return <span key={index} className="gapfill-text">{part.content}</span>;
          }

          const gapIndex = part.gapIndex!;
          const wordId = placements[gapIndex];
          const word = getWordById(wordId);
          const isCorrect = checkedResults?.[gapIndex];

          return (
            <span key={index} className="gapfill-gap-wrapper">
              <button
                className={`gapfill-gap ${word ? 'filled' : ''} ${
                  selectedWordId && !word ? 'selectable' : ''
                } ${isCorrect === true ? 'correct' : ''} ${
                  isCorrect === false ? 'incorrect' : ''
                }`}
                style={getGapStyle(gapIndex)}
                onClick={() => handleGapClick(gapIndex)}
                disabled={isComplete}
              >
                {word ? word.text : '___'}
              </button>
              {isCorrect === false && (
                <span className="gapfill-correction">
                  {getCorrectAnswerForGap(gapIndex)}
                </span>
              )}
            </span>
          );
        })}
      </div>

      <div className="gapfill-wordbank">
        <div className="wordbank-label">Slova k použití:</div>
        <div className="wordbank-words">
          {shuffledWords.map(word => (
            <button
              key={word.id}
              className={`wordbank-word ${selectedWordId === word.id ? 'selected' : ''} ${
                isWordPlaced(word.id) ? 'placed' : ''
              }`}
              style={getWordStyle(word.id)}
              onClick={() => handleWordClick(word.id)}
              disabled={isComplete}
            >
              {word.text}
            </button>
          ))}
        </div>
      </div>

      <div className="gapfill-footer">
        {!isComplete ? (
          <button
            className="btn-primary gapfill-check-btn"
            onClick={checkAnswers}
            disabled={!allGapsFilled}
          >
            Zkontrolovat
          </button>
        ) : (
          <div className="gapfill-result">
            <div className={`gapfill-score ${correctCount === gapCount ? 'perfect' : ''}`}>
              {correctCount === gapCount ? (
                <>Výborně! Vše správně!</>
              ) : (
                <>Správně: {correctCount} z {gapCount}</>
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
