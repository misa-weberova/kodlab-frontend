import { useState, useCallback, Children, cloneElement, isValidElement } from 'react';
import type { ReactElement } from 'react';

interface ExerciseInfo {
  title: string;
  completed: boolean;
  score?: { correct: number; total: number };
}

interface ExerciseCarouselProps {
  children: React.ReactNode;
  titles?: string[];
  onAllComplete?: (totalScore: number, totalPossible: number) => void;
}

export default function ExerciseCarousel({
  children,
  titles,
  onAllComplete,
}: ExerciseCarouselProps) {
  const childArray = Children.toArray(children).filter(isValidElement);
  const exerciseCount = childArray.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [exercises, setExercises] = useState<ExerciseInfo[]>(() =>
    childArray.map((_, index) => ({
      title: titles?.[index] || `Cvičení ${index + 1}`,
      completed: false,
    }))
  );

  // Handle exercise completion
  const handleExerciseComplete = useCallback((index: number, _isCorrect: boolean, score: number, total: number) => {
    setExercises(prev => {
      const updated = [...prev];
      updated[index] = {
        ...updated[index],
        completed: true,
        score: { correct: score, total },
      };

      // Check if all exercises are complete
      const allComplete = updated.every(ex => ex.completed);
      if (allComplete && onAllComplete) {
        const totalScore = updated.reduce((sum, ex) => sum + (ex.score?.correct || 0), 0);
        const totalPossible = updated.reduce((sum, ex) => sum + (ex.score?.total || 0), 0);
        setTimeout(() => onAllComplete(totalScore, totalPossible), 500);
      }

      return updated;
    });

    // Auto-advance to next exercise after a short delay
    if (index < exerciseCount - 1) {
      setTimeout(() => {
        setCurrentIndex(index + 1);
      }, 1500);
    }
  }, [exerciseCount, onAllComplete]);

  // Navigation
  const goToPrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const goToNext = () => {
    if (currentIndex < exerciseCount - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const goToExercise = (index: number) => {
    setCurrentIndex(index);
  };

  // Calculate overall progress
  const completedCount = exercises.filter(ex => ex.completed).length;
  const progressPercent = (completedCount / exerciseCount) * 100;

  // Clone the current exercise with modified onComplete
  const renderCurrentExercise = () => {
    const child = childArray[currentIndex];
    if (!isValidElement(child)) return null;

    // Clone with wrapped onComplete handler
    return cloneElement(child as ReactElement<any>, {
      onComplete: (isCorrect: boolean, score: number, total: number) => {
        // Call original onComplete if it exists
        const originalOnComplete = (child as ReactElement<any>).props.onComplete;
        if (originalOnComplete) {
          originalOnComplete(isCorrect, score, total);
        }
        // Track completion
        handleExerciseComplete(currentIndex, isCorrect, score, total);
      },
    });
  };

  return (
    <div className="exercise-carousel">
      {/* Progress Header */}
      <div className="carousel-progress-header">
        <div className="carousel-progress-bar">
          <div
            className="carousel-progress-fill"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
        <div className="carousel-progress-steps">
          {exercises.map((exercise, index) => (
            <button
              key={index}
              className={`carousel-step ${index === currentIndex ? 'active' : ''} ${
                exercise.completed ? 'completed' : ''
              } ${index < currentIndex ? 'visited' : ''}`}
              onClick={() => goToExercise(index)}
              title={exercise.title}
            >
              <span className="step-number">
                {exercise.completed ? '✓' : index + 1}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Exercise Content */}
      <div className="carousel-content">
        <button
          className="carousel-nav carousel-nav-prev"
          onClick={goToPrevious}
          disabled={currentIndex === 0}
          aria-label="Předchozí cvičení"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M15 19l-7-7 7-7" />
          </svg>
        </button>

        <div className="carousel-exercise">
          {renderCurrentExercise()}
          {/* Footer with navigation info */}
          <div className="carousel-footer">
            <span className="carousel-counter">
              Cvičení {currentIndex + 1} z {exerciseCount}
            </span>
            {completedCount === exerciseCount && (
              <span className="carousel-complete-badge">
                Vše dokončeno! 🎉
              </span>
            )}
          </div>
        </div>

        <button
          className="carousel-nav carousel-nav-next"
          onClick={goToNext}
          disabled={currentIndex === exerciseCount - 1}
          aria-label="Další cvičení"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>
    </div>
  );
}
