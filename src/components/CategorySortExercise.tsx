import { useState, useEffect } from 'react';

export interface CategoryBox {
  id: string;
  title: string;
  color?: string; // Optional color theme: 'teal', 'orange', 'indigo', 'pink', 'emerald'
}

export interface SortableItem {
  id: string;
  text: string;
  correctCategoryId: string; // Which category this item belongs to
}

export interface CategorySortExerciseProps {
  categories: CategoryBox[]; // Up to 5 categories
  items: SortableItem[];
  title?: string;
  instruction?: string;
  onComplete?: (isCorrect: boolean, score: number, total: number) => void;
}

// Color themes for categories
const CATEGORY_COLORS: Record<string, { bg: string; border: string; light: string }> = {
  teal: { bg: 'rgba(42, 139, 122, 0.15)', border: '#2A8B7A', light: 'rgba(42, 139, 122, 0.08)' },
  orange: { bg: 'rgba(232, 112, 74, 0.15)', border: '#E8704A', light: 'rgba(232, 112, 74, 0.08)' },
  indigo: { bg: 'rgba(99, 102, 241, 0.15)', border: '#6366F1', light: 'rgba(99, 102, 241, 0.08)' },
  pink: { bg: 'rgba(236, 72, 153, 0.15)', border: '#EC4899', light: 'rgba(236, 72, 153, 0.08)' },
  emerald: { bg: 'rgba(16, 185, 129, 0.15)', border: '#10B981', light: 'rgba(16, 185, 129, 0.08)' },
};

const DEFAULT_COLORS = ['teal', 'orange', 'indigo', 'pink', 'emerald'];

function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function CategorySortExercise({
  categories,
  items,
  title = 'Roztřiď položky do kategorií',
  instruction = 'Přetáhni položky do správných kategorií nebo klikni na položku a pak na kategorii.',
  onComplete,
}: CategorySortExerciseProps) {
  // Map of categoryId -> array of item IDs placed in that category
  const [placements, setPlacements] = useState<Map<string, string[]>>(new Map());
  // Items not yet placed (in the pool)
  const [poolItems, setPoolItems] = useState<string[]>([]);
  const [selectedItemId, setSelectedItemId] = useState<string | null>(null);
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);
  const [dragOverCategoryId, setDragOverCategoryId] = useState<string | null>(null);
  const [dragOverPool, setDragOverPool] = useState(false);
  const [checkedResults, setCheckedResults] = useState<Map<string, boolean> | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  // Initialize
  useEffect(() => {
    // Start with all items in the pool (shuffled)
    setPoolItems(shuffleArray(items.map(item => item.id)));
    // Initialize empty placements for each category
    const initialPlacements = new Map<string, string[]>();
    categories.forEach(cat => initialPlacements.set(cat.id, []));
    setPlacements(initialPlacements);
  }, [items, categories]);

  // Get item by ID
  const getItemById = (id: string): SortableItem | undefined => {
    return items.find(item => item.id === id);
  };

  // Get category color
  const getCategoryColor = (category: CategoryBox, index: number) => {
    const colorKey = category.color || DEFAULT_COLORS[index % DEFAULT_COLORS.length];
    return CATEGORY_COLORS[colorKey] || CATEGORY_COLORS.teal;
  };

  // Handle clicking an item in the pool
  const handlePoolItemClick = (itemId: string) => {
    if (isComplete) return;

    if (selectedItemId === itemId) {
      setSelectedItemId(null);
    } else {
      setSelectedItemId(itemId);
    }
  };

  // Handle clicking an item in a category (to move it back or select it)
  const handleCategoryItemClick = (itemId: string, categoryId: string) => {
    if (isComplete) return;

    if (selectedItemId === itemId) {
      // Deselect
      setSelectedItemId(null);
    } else if (selectedItemId) {
      // Swap: move selected item to this category, move this item to pool
      const selectedFromPool = poolItems.includes(selectedItemId);
      const selectedFromCategory = !selectedFromPool
        ? Array.from(placements.entries()).find(([, items]) => items.includes(selectedItemId))?.[0]
        : null;

      // Remove clicked item from its category
      setPlacements(prev => {
        const newPlacements = new Map(prev);
        const categoryItems = [...(newPlacements.get(categoryId) || [])];
        const idx = categoryItems.indexOf(itemId);
        if (idx !== -1) categoryItems.splice(idx, 1);

        // Add selected item to this category
        if (selectedFromPool) {
          categoryItems.push(selectedItemId);
          setPoolItems(prev => prev.filter(id => id !== selectedItemId));
        } else if (selectedFromCategory) {
          categoryItems.push(selectedItemId);
          // Remove selected from its original category
          const origItems = [...(newPlacements.get(selectedFromCategory) || [])];
          const origIdx = origItems.indexOf(selectedItemId);
          if (origIdx !== -1) origItems.splice(origIdx, 1);
          newPlacements.set(selectedFromCategory, origItems);
        }

        newPlacements.set(categoryId, categoryItems);
        return newPlacements;
      });

      // Add clicked item to pool
      setPoolItems(prev => [...prev, itemId]);
      setSelectedItemId(null);
    } else {
      // Select this item
      setSelectedItemId(itemId);
    }
  };

  // Handle clicking a category box (to place selected item)
  const handleCategoryClick = (categoryId: string) => {
    if (isComplete || !selectedItemId) return;

    const fromPool = poolItems.includes(selectedItemId);
    const fromCategory = !fromPool
      ? Array.from(placements.entries()).find(([, items]) => items.includes(selectedItemId))?.[0]
      : null;

    if (fromPool) {
      setPoolItems(prev => prev.filter(id => id !== selectedItemId));
    } else if (fromCategory) {
      setPlacements(prev => {
        const newPlacements = new Map(prev);
        const items = [...(newPlacements.get(fromCategory) || [])];
        const idx = items.indexOf(selectedItemId);
        if (idx !== -1) items.splice(idx, 1);
        newPlacements.set(fromCategory, items);
        return newPlacements;
      });
    }

    setPlacements(prev => {
      const newPlacements = new Map(prev);
      const items = [...(newPlacements.get(categoryId) || [])];
      if (!items.includes(selectedItemId)) {
        items.push(selectedItemId);
      }
      newPlacements.set(categoryId, items);
      return newPlacements;
    });

    setSelectedItemId(null);
  };

  // Handle clicking the pool (to return selected item)
  const handlePoolClick = () => {
    if (isComplete || !selectedItemId) return;

    const fromCategory = Array.from(placements.entries()).find(([, items]) =>
      items.includes(selectedItemId)
    )?.[0];

    if (fromCategory) {
      setPlacements(prev => {
        const newPlacements = new Map(prev);
        const items = [...(newPlacements.get(fromCategory) || [])];
        const idx = items.indexOf(selectedItemId);
        if (idx !== -1) items.splice(idx, 1);
        newPlacements.set(fromCategory, items);
        return newPlacements;
      });

      setPoolItems(prev => [...prev, selectedItemId]);
    }

    setSelectedItemId(null);
  };

  // Drag handlers
  const handleDragStart = (e: React.DragEvent, itemId: string) => {
    if (isComplete) return;
    setDraggedItemId(itemId);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', itemId);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
    setDragOverCategoryId(null);
    setDragOverPool(false);
  };

  const handleCategoryDragOver = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    setDragOverCategoryId(categoryId);
    setDragOverPool(false);
  };

  const handleCategoryDragLeave = () => {
    setDragOverCategoryId(null);
  };

  const handleCategoryDrop = (e: React.DragEvent, categoryId: string) => {
    e.preventDefault();
    if (!draggedItemId) return;

    const fromPool = poolItems.includes(draggedItemId);
    const fromCategory = !fromPool
      ? Array.from(placements.entries()).find(([, items]) => items.includes(draggedItemId))?.[0]
      : null;

    if (fromPool) {
      setPoolItems(prev => prev.filter(id => id !== draggedItemId));
    } else if (fromCategory && fromCategory !== categoryId) {
      setPlacements(prev => {
        const newPlacements = new Map(prev);
        const items = [...(newPlacements.get(fromCategory) || [])];
        const idx = items.indexOf(draggedItemId);
        if (idx !== -1) items.splice(idx, 1);
        newPlacements.set(fromCategory, items);
        return newPlacements;
      });
    }

    if (!fromCategory || fromCategory !== categoryId) {
      setPlacements(prev => {
        const newPlacements = new Map(prev);
        const items = [...(newPlacements.get(categoryId) || [])];
        if (!items.includes(draggedItemId)) {
          items.push(draggedItemId);
        }
        newPlacements.set(categoryId, items);
        return newPlacements;
      });
    }

    handleDragEnd();
  };

  const handlePoolDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOverPool(true);
    setDragOverCategoryId(null);
  };

  const handlePoolDragLeave = () => {
    setDragOverPool(false);
  };

  const handlePoolDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedItemId) return;

    const fromCategory = Array.from(placements.entries()).find(([, items]) =>
      items.includes(draggedItemId)
    )?.[0];

    if (fromCategory) {
      setPlacements(prev => {
        const newPlacements = new Map(prev);
        const items = [...(newPlacements.get(fromCategory) || [])];
        const idx = items.indexOf(draggedItemId);
        if (idx !== -1) items.splice(idx, 1);
        newPlacements.set(fromCategory, items);
        return newPlacements;
      });

      setPoolItems(prev => [...prev, draggedItemId]);
    }

    handleDragEnd();
  };

  // Check answers
  const checkAnswers = () => {
    const results = new Map<string, boolean>();
    let correctCount = 0;

    items.forEach(item => {
      const placedInCategory = Array.from(placements.entries()).find(([, itemIds]) =>
        itemIds.includes(item.id)
      )?.[0];

      const isCorrect = placedInCategory === item.correctCategoryId;
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
    setPoolItems(shuffleArray(items.map(item => item.id)));
    const initialPlacements = new Map<string, string[]>();
    categories.forEach(cat => initialPlacements.set(cat.id, []));
    setPlacements(initialPlacements);
    setSelectedItemId(null);
    setCheckedResults(null);
    setIsComplete(false);
  };

  // Show correct placements
  const showCorrectAnswer = () => {
    const correctPlacements = new Map<string, string[]>();
    categories.forEach(cat => correctPlacements.set(cat.id, []));

    items.forEach(item => {
      const categoryItems = correctPlacements.get(item.correctCategoryId) || [];
      categoryItems.push(item.id);
      correctPlacements.set(item.correctCategoryId, categoryItems);
    });

    setPlacements(correctPlacements);
    setPoolItems([]);
  };

  const allPlaced = poolItems.length === 0;
  const correctCount = checkedResults
    ? Array.from(checkedResults.values()).filter(v => v).length
    : 0;

  // Get correct category for an item
  const getCorrectCategoryTitle = (itemId: string): string => {
    const item = getItemById(itemId);
    if (!item) return '';
    const category = categories.find(c => c.id === item.correctCategoryId);
    return category?.title || '';
  };

  return (
    <div className="category-sort-exercise">
      <div className="category-sort-header">
        <h3>{title}</h3>
        <p>{instruction}</p>
      </div>

      <div
        className={`category-sort-pool ${dragOverPool ? 'drag-over' : ''} ${
          selectedItemId && !poolItems.includes(selectedItemId) ? 'can-receive' : ''
        }`}
        onClick={handlePoolClick}
        onDragOver={handlePoolDragOver}
        onDragLeave={handlePoolDragLeave}
        onDrop={handlePoolDrop}
      >
        <div className="pool-label">Položky k roztřídění:</div>
        <div className="pool-items">
          {poolItems.length === 0 && !isComplete && (
            <span className="pool-empty">Všechny položky jsou roztříděny</span>
          )}
          {poolItems.map(itemId => {
            const item = getItemById(itemId);
            if (!item) return null;
            return (
              <div
                key={itemId}
                className={`category-sort-item ${selectedItemId === itemId ? 'selected' : ''} ${
                  draggedItemId === itemId ? 'dragging' : ''
                }`}
                draggable={!isComplete}
                onClick={(e) => { e.stopPropagation(); handlePoolItemClick(itemId); }}
                onDragStart={(e) => handleDragStart(e, itemId)}
                onDragEnd={handleDragEnd}
              >
                {item.text}
              </div>
            );
          })}
        </div>
      </div>

      <div className={`category-boxes category-boxes-${Math.min(categories.length, 5)}`}>
        {categories.slice(0, 5).map((category, index) => {
          const color = getCategoryColor(category, index);
          const categoryItems = placements.get(category.id) || [];

          return (
            <div
              key={category.id}
              className={`category-box ${dragOverCategoryId === category.id ? 'drag-over' : ''} ${
                selectedItemId && !categoryItems.includes(selectedItemId) ? 'can-receive' : ''
              }`}
              style={{
                '--category-color': color.border,
                '--category-bg': color.bg,
                '--category-light': color.light,
              } as React.CSSProperties}
              onClick={() => handleCategoryClick(category.id)}
              onDragOver={(e) => handleCategoryDragOver(e, category.id)}
              onDragLeave={handleCategoryDragLeave}
              onDrop={(e) => handleCategoryDrop(e, category.id)}
            >
              <div className="category-box-header">
                {category.title}
              </div>
              <div className="category-box-items">
                {categoryItems.length === 0 && (
                  <span className="category-empty">Přetáhni sem položky</span>
                )}
                {categoryItems.map(itemId => {
                  const item = getItemById(itemId);
                  if (!item) return null;
                  const isCorrect = checkedResults?.get(itemId);

                  return (
                    <div
                      key={itemId}
                      className={`category-sort-item in-category ${
                        selectedItemId === itemId ? 'selected' : ''
                      } ${draggedItemId === itemId ? 'dragging' : ''} ${
                        isCorrect === true ? 'correct' : ''
                      } ${isCorrect === false ? 'incorrect' : ''}`}
                      draggable={!isComplete}
                      onClick={(e) => { e.stopPropagation(); handleCategoryItemClick(itemId, category.id); }}
                      onDragStart={(e) => handleDragStart(e, itemId)}
                      onDragEnd={handleDragEnd}
                    >
                      <span className="item-text">{item.text}</span>
                      {isCorrect === true && <span className="item-check">✓</span>}
                      {isCorrect === false && (
                        <span className="item-correction">→ {getCorrectCategoryTitle(itemId)}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      <div className="category-sort-footer">
        {!isComplete ? (
          <button
            className="btn-primary category-sort-check-btn"
            onClick={checkAnswers}
            disabled={!allPlaced}
          >
            Zkontrolovat
          </button>
        ) : (
          <div className="category-sort-result">
            <div className={`category-sort-score ${correctCount === items.length ? 'perfect' : ''}`}>
              {correctCount === items.length ? (
                <>Výborně! Vše správně!</>
              ) : (
                <>Správně: {correctCount} z {items.length}</>
              )}
            </div>
            <div className="category-sort-result-buttons">
              {correctCount < items.length && (
                <button className="btn-secondary" onClick={showCorrectAnswer}>
                  Ukázat správně
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
