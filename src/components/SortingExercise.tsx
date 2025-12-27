import { useState, useEffect } from 'react';

export interface SortableItem {
  id: string;
  text: string;
  // Optional: for display purposes (e.g., showing the value after checking)
  displayValue?: string;
}

export interface SortingExerciseProps {
  items: SortableItem[];
  // Correct order as array of IDs - this determines what "correct" means
  correctOrder: string[];
  title?: string;
  instruction?: string;
  // Labels for the sorting direction (shown at top/bottom of the list)
  startLabel?: string;  // e.g., "Největší" or "První"
  endLabel?: string;    // e.g., "Nejmenší" or "Poslední"
  onComplete?: (isCorrect: boolean, score: number, total: number) => void;
}

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  // Make sure it's not already in correct order
  if (JSON.stringify(shuffled.map(s => (s as any).id)) === JSON.stringify(array.map(a => (a as any).id))) {
    return shuffleArray(array);
  }
  return shuffled;
}

export default function SortingExercise({
  items,
  correctOrder,
  title = 'Seřaď položky',
  instruction = 'Přetáhni položky nebo použij šipky pro seřazení ve správném pořadí.',
  startLabel,
  endLabel,
  onComplete,
}: SortingExerciseProps) {
  const [orderedItems, setOrderedItems] = useState<SortableItem[]>([]);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const [checkedResults, setCheckedResults] = useState<Map<string, boolean> | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Initialize with shuffled items
  useEffect(() => {
    // Order items according to correctOrder first, then shuffle
    const orderedByCorrect = correctOrder
      .map(id => items.find(item => item.id === id))
      .filter((item): item is SortableItem => item !== undefined);
    setOrderedItems(shuffleArray(orderedByCorrect));
  }, [items, correctOrder]);

  // Handle item click (for click-to-swap)
  const handleItemClick = (id: string) => {
    if (isComplete) return;

    if (selectedId === null) {
      setSelectedId(id);
    } else if (selectedId === id) {
      setSelectedId(null);
    } else {
      // Swap the two items
      const idx1 = orderedItems.findIndex(item => item.id === selectedId);
      const idx2 = orderedItems.findIndex(item => item.id === id);

      const newOrder = [...orderedItems];
      [newOrder[idx1], newOrder[idx2]] = [newOrder[idx2], newOrder[idx1]];
      setOrderedItems(newOrder);
      setSelectedId(null);
    }
  };

  // Move item up
  const moveUp = (id: string) => {
    if (isComplete) return;

    const idx = orderedItems.findIndex(item => item.id === id);
    if (idx <= 0) return;

    const newOrder = [...orderedItems];
    [newOrder[idx - 1], newOrder[idx]] = [newOrder[idx], newOrder[idx - 1]];
    setOrderedItems(newOrder);
  };

  // Move item down
  const moveDown = (id: string) => {
    if (isComplete) return;

    const idx = orderedItems.findIndex(item => item.id === id);
    if (idx >= orderedItems.length - 1) return;

    const newOrder = [...orderedItems];
    [newOrder[idx], newOrder[idx + 1]] = [newOrder[idx + 1], newOrder[idx]];
    setOrderedItems(newOrder);
  };

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, id: string) => {
    if (isComplete) return;
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (id !== draggedId) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (e: React.DragEvent, targetId: string) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const dragIdx = orderedItems.findIndex(item => item.id === draggedId);
    const targetIdx = orderedItems.findIndex(item => item.id === targetId);

    const newOrder = [...orderedItems];
    const [draggedItem] = newOrder.splice(dragIdx, 1);
    newOrder.splice(targetIdx, 0, draggedItem);

    setOrderedItems(newOrder);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // Check answers
  const checkAnswers = () => {
    const results = new Map<string, boolean>();
    let correctCount = 0;

    orderedItems.forEach((item, index) => {
      const isCorrect = item.id === correctOrder[index];
      results.set(item.id, isCorrect);
      if (isCorrect) correctCount++;
    });

    setCheckedResults(results);
    setIsComplete(true);

    if (onComplete) {
      onComplete(correctCount === items.length, correctCount, items.length);
    }
  };

  // Reset
  const reset = () => {
    const orderedByCorrect = correctOrder
      .map(id => items.find(item => item.id === id))
      .filter((item): item is SortableItem => item !== undefined);
    setOrderedItems(shuffleArray(orderedByCorrect));
    setSelectedId(null);
    setCheckedResults(null);
    setIsComplete(false);
  };

  // Show correct order
  const showCorrectOrder = () => {
    const orderedByCorrect = correctOrder
      .map(id => items.find(item => item.id === id))
      .filter((item): item is SortableItem => item !== undefined);
    setOrderedItems(orderedByCorrect);
  };

  const correctCount = checkedResults
    ? Array.from(checkedResults.values()).filter(v => v).length
    : 0;

  const getItemClass = (item: SortableItem): string => {
    const classes = ['sorting-item'];

    if (selectedId === item.id) {
      classes.push('selected');
    }
    if (draggedId === item.id) {
      classes.push('dragging');
    }
    if (dragOverId === item.id) {
      classes.push('drag-over');
    }
    if (checkedResults?.get(item.id) === true) {
      classes.push('correct');
    }
    if (checkedResults?.get(item.id) === false) {
      classes.push('incorrect');
    }

    return classes.join(' ');
  };

  // Get the correct position for an item (for showing correction)
  const getCorrectPosition = (id: string): number => {
    return correctOrder.indexOf(id) + 1;
  };

  return (
    <div className="sorting-exercise">
      <div className="sorting-header">
        <h3>{title}</h3>
        <p>{instruction}</p>
      </div>

      <div className="sorting-content">
        {startLabel && (
          <div className="sorting-label sorting-label-start">
            {startLabel}
          </div>
        )}

        <div className="sorting-list">
          {orderedItems.map((item, index) => (
            <div
              key={item.id}
              className={getItemClass(item)}
              draggable={!isComplete}
              onClick={() => handleItemClick(item.id)}
              onDragStart={(e) => handleDragStart(e, item.id)}
              onDragOver={(e) => handleDragOver(e, item.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, item.id)}
              onDragEnd={handleDragEnd}
            >
              <span className="sorting-item-number">{index + 1}.</span>
              <span className="sorting-item-text">{item.text}</span>
              {item.displayValue && checkedResults && (
                <span className="sorting-item-value">{item.displayValue}</span>
              )}
              {!isComplete && (
                <div className="sorting-item-controls">
                  <button
                    className="sorting-arrow sorting-arrow-up"
                    onClick={(e) => { e.stopPropagation(); moveUp(item.id); }}
                    disabled={index === 0}
                    title="Posunout nahoru"
                  >
                    ▲
                  </button>
                  <button
                    className="sorting-arrow sorting-arrow-down"
                    onClick={(e) => { e.stopPropagation(); moveDown(item.id); }}
                    disabled={index === orderedItems.length - 1}
                    title="Posunout dolů"
                  >
                    ▼
                  </button>
                </div>
              )}
              {checkedResults?.get(item.id) === true && (
                <span className="sorting-item-check">✓</span>
              )}
              {checkedResults?.get(item.id) === false && (
                <span className="sorting-item-correction">
                  správně: {getCorrectPosition(item.id)}.
                </span>
              )}
            </div>
          ))}
        </div>

        {endLabel && (
          <div className="sorting-label sorting-label-end">
            {endLabel}
          </div>
        )}
      </div>

      <div className="sorting-footer">
        {!isComplete ? (
          <button
            className="btn-primary sorting-check-btn"
            onClick={checkAnswers}
          >
            Zkontrolovat
          </button>
        ) : (
          <div className="sorting-result">
            <div className={`sorting-score ${correctCount === items.length ? 'perfect' : ''}`}>
              {correctCount === items.length ? (
                <>Výborně! Vše správně!</>
              ) : (
                <>Správně: {correctCount} z {items.length}</>
              )}
            </div>
            <div className="sorting-result-buttons">
              {correctCount < items.length && (
                <button className="btn-secondary" onClick={showCorrectOrder}>
                  Ukázat správné pořadí
                </button>
              )}
              <button className="btn-secondary" onClick={reset}>
                Zkusit znovu
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
