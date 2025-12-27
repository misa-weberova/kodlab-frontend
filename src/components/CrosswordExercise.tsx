import { useState, useEffect, useCallback, useRef } from 'react';

export interface CrosswordWord {
  id: string;
  word: string;
  clue: string;
  row: number;      // Starting row (0-indexed)
  col: number;      // Starting column (0-indexed)
  direction: 'across' | 'down';
}

export interface CrosswordExerciseProps {
  words: CrosswordWord[];
  title?: string;
  instruction?: string;
  onComplete?: (isCorrect: boolean, score: number, total: number) => void;
}

interface Cell {
  row: number;
  col: number;
  letter: string;        // Correct letter
  userInput: string;     // User's input
  isActive: boolean;     // Part of a word
  wordIds: string[];     // Which words this cell belongs to
  number?: number;       // Clue number (if start of a word)
}

export default function CrosswordExercise({
  words,
  title = 'Křížovka',
  instruction = 'Vyplň křížovku podle nápověd. Klikni na políčko a piš.',
  onComplete,
}: CrosswordExerciseProps) {
  const [grid, setGrid] = useState<Cell[][]>([]);
  const [selectedCell, setSelectedCell] = useState<{ row: number; col: number } | null>(null);
  const [selectedDirection, setSelectedDirection] = useState<'across' | 'down'>('across');
  const [checkedResults, setCheckedResults] = useState<Map<string, boolean> | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [hintsUsed, setHintsUsed] = useState(0);
  const [revealedCells, setRevealedCells] = useState<Set<string>>(new Set());
  const inputRefs = useRef<Map<string, HTMLInputElement>>(new Map());

  // Calculate grid dimensions and build the grid
  useEffect(() => {
    if (words.length === 0) return;

    // Find grid dimensions
    let maxRow = 0;
    let maxCol = 0;
    words.forEach(word => {
      const endRow = word.direction === 'down' ? word.row + word.word.length - 1 : word.row;
      const endCol = word.direction === 'across' ? word.col + word.word.length - 1 : word.col;
      maxRow = Math.max(maxRow, endRow);
      maxCol = Math.max(maxCol, endCol);
    });

    // Initialize empty grid
    const newGrid: Cell[][] = [];
    for (let r = 0; r <= maxRow; r++) {
      const row: Cell[] = [];
      for (let c = 0; c <= maxCol; c++) {
        row.push({
          row: r,
          col: c,
          letter: '',
          userInput: '',
          isActive: false,
          wordIds: [],
        });
      }
      newGrid.push(row);
    }

    // Fill in words
    const wordStarts: Map<string, { row: number; col: number; direction: 'across' | 'down' }[]> = new Map();

    words.forEach(word => {
      for (let i = 0; i < word.word.length; i++) {
        const r = word.direction === 'down' ? word.row + i : word.row;
        const c = word.direction === 'across' ? word.col + i : word.col;

        newGrid[r][c].isActive = true;
        newGrid[r][c].letter = word.word[i].toUpperCase();
        if (!newGrid[r][c].wordIds.includes(word.id)) {
          newGrid[r][c].wordIds.push(word.id);
        }
      }

      // Track word start positions
      const key = `${word.row}-${word.col}`;
      if (!wordStarts.has(key)) {
        wordStarts.set(key, []);
      }
      wordStarts.get(key)!.push({ row: word.row, col: word.col, direction: word.direction });
    });

    // Assign clue numbers
    let clueNumber = 1;
    const assignedNumbers = new Map<string, number>();

    // Sort words by position (top-to-bottom, left-to-right)
    const sortedWords = [...words].sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.col - b.col;
    });

    sortedWords.forEach(word => {
      const key = `${word.row}-${word.col}`;
      if (!assignedNumbers.has(key)) {
        assignedNumbers.set(key, clueNumber);
        newGrid[word.row][word.col].number = clueNumber;
        clueNumber++;
      }
    });

    setGrid(newGrid);
  }, [words]);

  // Get clue number for a word
  const getClueNumber = (word: CrosswordWord): number => {
    if (grid.length === 0) return 0;
    return grid[word.row]?.[word.col]?.number || 0;
  };

  // Get the current word based on selected cell and direction
  const getSelectedWord = useCallback((): CrosswordWord | null => {
    if (!selectedCell || grid.length === 0) return null;

    const cell = grid[selectedCell.row]?.[selectedCell.col];
    if (!cell || !cell.isActive) return null;

    // Find word in the selected direction
    let word = words.find(w =>
      w.direction === selectedDirection &&
      cell.wordIds.includes(w.id)
    );

    // If no word in selected direction, try the other direction
    if (!word) {
      word = words.find(w => cell.wordIds.includes(w.id));
      if (word) {
        setSelectedDirection(word.direction);
      }
    }

    return word || null;
  }, [selectedCell, selectedDirection, grid, words]);

  // Check if a cell is part of the selected word
  const isCellInSelectedWord = (row: number, col: number): boolean => {
    const selectedWord = getSelectedWord();
    if (!selectedWord) return false;

    const cell = grid[row]?.[col];
    return cell?.wordIds.includes(selectedWord.id) || false;
  };

  // Handle cell click
  const handleCellClick = (row: number, col: number) => {
    if (isComplete) return;

    const cell = grid[row]?.[col];
    if (!cell || !cell.isActive) return;

    // If clicking the same cell, toggle direction
    if (selectedCell?.row === row && selectedCell?.col === col) {
      if (cell.wordIds.length > 1) {
        setSelectedDirection(prev => prev === 'across' ? 'down' : 'across');
      }
    } else {
      setSelectedCell({ row, col });
      // Set direction based on available words
      const acrossWord = words.find(w => w.direction === 'across' && cell.wordIds.includes(w.id));
      const downWord = words.find(w => w.direction === 'down' && cell.wordIds.includes(w.id));

      if (acrossWord && !downWord) {
        setSelectedDirection('across');
      } else if (downWord && !acrossWord) {
        setSelectedDirection('down');
      }
    }

    // Focus the input
    const inputKey = `${row}-${col}`;
    setTimeout(() => {
      inputRefs.current.get(inputKey)?.focus();
    }, 0);
  };

  // Handle input change
  const handleInput = (row: number, col: number, value: string) => {
    if (isComplete) return;

    const letter = value.slice(-1).toUpperCase();

    setGrid(prev => {
      const newGrid = prev.map(r => r.map(c => ({ ...c })));
      newGrid[row][col].userInput = letter;
      return newGrid;
    });

    // Move to next cell
    if (letter) {
      moveToNextCell(row, col);
    }
  };

  // Handle key down
  const handleKeyDown = (e: React.KeyboardEvent, row: number, col: number) => {
    if (isComplete) return;

    switch (e.key) {
      case 'Backspace':
        if (!grid[row][col].userInput) {
          // Move to previous cell and clear it
          moveToPrevCell(row, col);
        }
        break;
      case 'ArrowRight':
        e.preventDefault();
        setSelectedDirection('across');
        moveToNextCell(row, col, 'across');
        break;
      case 'ArrowLeft':
        e.preventDefault();
        setSelectedDirection('across');
        moveToPrevCell(row, col, 'across');
        break;
      case 'ArrowDown':
        e.preventDefault();
        setSelectedDirection('down');
        moveToNextCell(row, col, 'down');
        break;
      case 'ArrowUp':
        e.preventDefault();
        setSelectedDirection('down');
        moveToPrevCell(row, col, 'down');
        break;
      case 'Tab':
        e.preventDefault();
        moveToNextWord();
        break;
    }
  };

  // Move to next cell in current direction
  const moveToNextCell = (row: number, col: number, direction?: 'across' | 'down') => {
    const dir = direction || selectedDirection;
    const nextRow = dir === 'down' ? row + 1 : row;
    const nextCol = dir === 'across' ? col + 1 : col;

    if (grid[nextRow]?.[nextCol]?.isActive) {
      setSelectedCell({ row: nextRow, col: nextCol });
      const inputKey = `${nextRow}-${nextCol}`;
      setTimeout(() => {
        inputRefs.current.get(inputKey)?.focus();
      }, 0);
    }
  };

  // Move to previous cell in current direction
  const moveToPrevCell = (row: number, col: number, direction?: 'across' | 'down') => {
    const dir = direction || selectedDirection;
    const prevRow = dir === 'down' ? row - 1 : row;
    const prevCol = dir === 'across' ? col - 1 : col;

    if (grid[prevRow]?.[prevCol]?.isActive) {
      setSelectedCell({ row: prevRow, col: prevCol });
      const inputKey = `${prevRow}-${prevCol}`;
      setTimeout(() => {
        inputRefs.current.get(inputKey)?.focus();
      }, 0);
    }
  };

  // Move to next word
  const moveToNextWord = () => {
    const currentWord = getSelectedWord();
    if (!currentWord) return;

    const sortedWords = [...words].sort((a, b) => {
      if (a.row !== b.row) return a.row - b.row;
      return a.col - b.col;
    });

    const currentIndex = sortedWords.findIndex(w => w.id === currentWord.id);
    const nextWord = sortedWords[(currentIndex + 1) % sortedWords.length];

    setSelectedCell({ row: nextWord.row, col: nextWord.col });
    setSelectedDirection(nextWord.direction);

    const inputKey = `${nextWord.row}-${nextWord.col}`;
    setTimeout(() => {
      inputRefs.current.get(inputKey)?.focus();
    }, 0);
  };

  // Check answers
  const checkAnswers = () => {
    const results = new Map<string, boolean>();

    words.forEach(word => {
      let isCorrect = true;
      for (let i = 0; i < word.word.length; i++) {
        const r = word.direction === 'down' ? word.row + i : word.row;
        const c = word.direction === 'across' ? word.col + i : word.col;

        if (grid[r][c].userInput !== word.word[i].toUpperCase()) {
          isCorrect = false;
          break;
        }
      }
      results.set(word.id, isCorrect);
    });

    setCheckedResults(results);
    setIsComplete(true);

    const correctCount = Array.from(results.values()).filter(v => v).length;
    if (onComplete) {
      onComplete(correctCount === words.length, correctCount, words.length);
    }
  };

  // Reset
  const reset = () => {
    setGrid(prev => prev.map(row => row.map(cell => ({ ...cell, userInput: '' }))));
    setSelectedCell(null);
    setCheckedResults(null);
    setIsComplete(false);
    setHintsUsed(0);
    setRevealedCells(new Set());
  };

  // Give a hint - reveal one incorrect or empty cell
  const giveHint = () => {
    // Find cells that are wrong or empty (prioritize selected word, then any)
    const selectedWord = getSelectedWord();
    let targetCells: { row: number; col: number; letter: string }[] = [];

    // First, try to find a cell in the selected word
    if (selectedWord) {
      for (let i = 0; i < selectedWord.word.length; i++) {
        const r = selectedWord.direction === 'down' ? selectedWord.row + i : selectedWord.row;
        const c = selectedWord.direction === 'across' ? selectedWord.col + i : selectedWord.col;
        const cell = grid[r]?.[c];
        const cellKey = `${r}-${c}`;

        if (cell && cell.isActive && !revealedCells.has(cellKey)) {
          if (cell.userInput !== cell.letter) {
            targetCells.push({ row: r, col: c, letter: cell.letter });
          }
        }
      }
    }

    // If no cells in selected word, find any incorrect cell
    if (targetCells.length === 0) {
      for (let r = 0; r < grid.length; r++) {
        for (let c = 0; c < grid[r].length; c++) {
          const cell = grid[r][c];
          const cellKey = `${r}-${c}`;

          if (cell.isActive && !revealedCells.has(cellKey)) {
            if (cell.userInput !== cell.letter) {
              targetCells.push({ row: r, col: c, letter: cell.letter });
            }
          }
        }
      }
    }

    if (targetCells.length === 0) return; // All cells are correct

    // Pick a random cell from targets (or first one for predictability)
    const target = targetCells[0];

    // Reveal the letter
    setGrid(prev => {
      const newGrid = prev.map(row => row.map(cell => ({ ...cell })));
      newGrid[target.row][target.col].userInput = target.letter;
      return newGrid;
    });

    setRevealedCells(prev => {
      const newSet = new Set(prev);
      newSet.add(`${target.row}-${target.col}`);
      return newSet;
    });

    setHintsUsed(prev => prev + 1);

    // Focus the next empty cell
    const nextEmpty = targetCells.find((_, idx) => idx > 0);
    if (nextEmpty) {
      setSelectedCell({ row: nextEmpty.row, col: nextEmpty.col });
      const inputKey = `${nextEmpty.row}-${nextEmpty.col}`;
      setTimeout(() => inputRefs.current.get(inputKey)?.focus(), 0);
    }
  };

  // Count how many cells need to be filled
  const totalActiveCells = grid.reduce((sum, row) =>
    sum + row.filter(cell => cell.isActive).length, 0
  );
  const filledCorrectly = grid.reduce((sum, row) =>
    sum + row.filter(cell => cell.isActive && cell.userInput === cell.letter).length, 0
  );
  const canUseHint = filledCorrectly < totalActiveCells && !isComplete;

  // Check if all cells are filled
  const allFilled = grid.every(row =>
    row.every(cell => !cell.isActive || cell.userInput !== '')
  );

  // Get cell class
  const getCellClass = (cell: Cell): string => {
    const classes = ['crossword-cell'];

    if (!cell.isActive) {
      classes.push('inactive');
    } else {
      classes.push('active');

      if (selectedCell?.row === cell.row && selectedCell?.col === cell.col) {
        classes.push('selected');
      } else if (isCellInSelectedWord(cell.row, cell.col)) {
        classes.push('highlighted');
      }

      // Mark revealed cells (hints)
      if (revealedCells.has(`${cell.row}-${cell.col}`)) {
        classes.push('revealed');
      }

      if (checkedResults) {
        // Check if this cell is correct
        const isCorrect = cell.userInput === cell.letter;
        classes.push(isCorrect ? 'correct' : 'incorrect');
      }
    }

    return classes.join(' ');
  };

  // Separate clues by direction
  const acrossClues = words
    .filter(w => w.direction === 'across')
    .sort((a, b) => getClueNumber(a) - getClueNumber(b));

  const downClues = words
    .filter(w => w.direction === 'down')
    .sort((a, b) => getClueNumber(a) - getClueNumber(b));

  const correctCount = checkedResults
    ? Array.from(checkedResults.values()).filter(v => v).length
    : 0;

  const selectedWord = getSelectedWord();

  return (
    <div className="crossword-exercise">
      <div className="crossword-header">
        <h3>{title}</h3>
        <p>{instruction}</p>
      </div>

      <div className="crossword-content">
        <div className="crossword-grid-container">
          <div className="crossword-grid" style={{
            gridTemplateColumns: `repeat(${grid[0]?.length || 1}, 1fr)`
          }}>
            {grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => (
                <div
                  key={`${rowIndex}-${colIndex}`}
                  className={getCellClass(cell)}
                  onClick={() => handleCellClick(rowIndex, colIndex)}
                >
                  {cell.number && <span className="cell-number">{cell.number}</span>}
                  {cell.isActive && (
                    <input
                      ref={el => {
                        if (el) inputRefs.current.set(`${rowIndex}-${colIndex}`, el);
                      }}
                      type="text"
                      maxLength={1}
                      value={cell.userInput}
                      onChange={e => handleInput(rowIndex, colIndex, e.target.value)}
                      onKeyDown={e => handleKeyDown(e, rowIndex, colIndex)}
                      disabled={isComplete}
                      autoComplete="off"
                      autoCapitalize="characters"
                    />
                  )}
                  {checkedResults && !checkedResults.get(cell.wordIds[0]) && cell.userInput !== cell.letter && (
                    <span className="correct-letter">{cell.letter}</span>
                  )}
                </div>
              ))
            )}
          </div>
        </div>

        <div className="crossword-clues">
          {selectedWord && (
            <div className="current-clue">
              <strong>{getClueNumber(selectedWord)}. </strong>
              {selectedWord.clue}
            </div>
          )}

          <div className="clues-columns">
            <div className="clues-section">
              <h4>Vodorovně →</h4>
              <ul>
                {acrossClues.map(word => (
                  <li
                    key={word.id}
                    className={`clue-item ${selectedWord?.id === word.id ? 'active' : ''} ${
                      checkedResults?.get(word.id) === true ? 'correct' : ''
                    } ${checkedResults?.get(word.id) === false ? 'incorrect' : ''}`}
                    onClick={() => {
                      setSelectedCell({ row: word.row, col: word.col });
                      setSelectedDirection('across');
                      const inputKey = `${word.row}-${word.col}`;
                      setTimeout(() => inputRefs.current.get(inputKey)?.focus(), 0);
                    }}
                  >
                    <span className="clue-number">{getClueNumber(word)}.</span>
                    <span className="clue-text">{word.clue}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="clues-section">
              <h4>Svisle ↓</h4>
              <ul>
                {downClues.map(word => (
                  <li
                    key={word.id}
                    className={`clue-item ${selectedWord?.id === word.id ? 'active' : ''} ${
                      checkedResults?.get(word.id) === true ? 'correct' : ''
                    } ${checkedResults?.get(word.id) === false ? 'incorrect' : ''}`}
                    onClick={() => {
                      setSelectedCell({ row: word.row, col: word.col });
                      setSelectedDirection('down');
                      const inputKey = `${word.row}-${word.col}`;
                      setTimeout(() => inputRefs.current.get(inputKey)?.focus(), 0);
                    }}
                  >
                    <span className="clue-number">{getClueNumber(word)}.</span>
                    <span className="clue-text">{word.clue}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="crossword-footer">
        {!isComplete ? (
          <div className="crossword-actions">
            <button
              className="btn-secondary crossword-hint-btn"
              onClick={giveHint}
              disabled={!canUseHint}
              title="Odhalí jedno písmeno"
            >
              Nápověda {hintsUsed > 0 && `(${hintsUsed})`}
            </button>
            <button
              className="btn-primary crossword-check-btn"
              onClick={checkAnswers}
              disabled={!allFilled}
            >
              Zkontrolovat
            </button>
          </div>
        ) : (
          <div className="crossword-result">
            <div className={`crossword-score ${correctCount === words.length ? 'perfect' : ''}`}>
              {correctCount === words.length ? (
                hintsUsed === 0 ? (
                  <>Výborně! Vše správně bez nápovědy!</>
                ) : (
                  <>Výborně! Vše správně! (nápověd: {hintsUsed})</>
                )
              ) : (
                <>Správně: {correctCount} z {words.length} slov</>
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
