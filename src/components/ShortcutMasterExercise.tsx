import { useState, useEffect, useCallback } from 'react';

interface Shortcut {
  id: string;
  action: string;
  keys: string[];
  displayKeys: string;
  category: 'basic' | 'text' | 'browser' | 'file';
  hint?: string;
}

interface ShortcutMasterExerciseProps {
  config: {
    shortcuts?: Shortcut[];
    requiredCorrect?: number;
    showKeyboard?: boolean;
  };
  onComplete: () => void;
}

const isMac = typeof navigator !== 'undefined' && /Mac/.test(navigator.platform);
const ctrlKey = isMac ? 'Meta' : 'Control';
const ctrlDisplay = isMac ? '⌘' : 'Ctrl';

const defaultShortcuts: Shortcut[] = [
  {
    id: '1',
    action: 'Kopírovat (označený text)',
    keys: [ctrlKey, 'c'],
    displayKeys: `${ctrlDisplay} + C`,
    category: 'basic',
    hint: 'Základní zkratka pro kopírování',
  },
  {
    id: '2',
    action: 'Vložit (zkopírovaný text)',
    keys: [ctrlKey, 'v'],
    displayKeys: `${ctrlDisplay} + V`,
    category: 'basic',
    hint: 'Základní zkratka pro vkládání',
  },
  {
    id: '3',
    action: 'Vyjmout (označený text)',
    keys: [ctrlKey, 'x'],
    displayKeys: `${ctrlDisplay} + X`,
    category: 'basic',
    hint: 'Jako kopírování, ale smaže originál',
  },
  {
    id: '4',
    action: 'Vybrat vše',
    keys: [ctrlKey, 'a'],
    displayKeys: `${ctrlDisplay} + A`,
    category: 'text',
    hint: 'A jako "All" (vše)',
  },
  {
    id: '5',
    action: 'Uložit soubor',
    keys: [ctrlKey, 's'],
    displayKeys: `${ctrlDisplay} + S`,
    category: 'file',
    hint: 'S jako "Save" (uložit)',
  },
  {
    id: '6',
    action: 'Zpět (vrátit akci)',
    keys: [ctrlKey, 'z'],
    displayKeys: `${ctrlDisplay} + Z`,
    category: 'basic',
    hint: 'Vrátí poslední akci',
  },
  {
    id: '7',
    action: 'Najít na stránce',
    keys: [ctrlKey, 'f'],
    displayKeys: `${ctrlDisplay} + F`,
    category: 'browser',
    hint: 'F jako "Find" (najít)',
  },
  {
    id: '8',
    action: 'Nová záložka v prohlížeči',
    keys: [ctrlKey, 't'],
    displayKeys: `${ctrlDisplay} + T`,
    category: 'browser',
    hint: 'T jako "Tab" (záložka)',
  },
  {
    id: '9',
    action: 'Zavřít záložku',
    keys: [ctrlKey, 'w'],
    displayKeys: `${ctrlDisplay} + W`,
    category: 'browser',
    hint: 'W jako "Window" (okno)',
  },
  {
    id: '10',
    action: 'Tisk',
    keys: [ctrlKey, 'p'],
    displayKeys: `${ctrlDisplay} + P`,
    category: 'file',
    hint: 'P jako "Print" (tisk)',
  },
];

const categoryLabels: Record<string, string> = {
  basic: 'Základní',
  text: 'Text',
  browser: 'Prohlížeč',
  file: 'Soubory',
};

const categoryIcons: Record<string, string> = {
  basic: '⌨️',
  text: '📝',
  browser: '🌐',
  file: '📁',
};

export default function ShortcutMasterExercise({ config, onComplete }: ShortcutMasterExerciseProps) {
  const shortcuts = config.shortcuts || defaultShortcuts;
  const requiredCorrect = config.requiredCorrect || Math.ceil(shortcuts.length * 0.8);
  const showKeyboard = config.showKeyboard ?? true;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [pressedKeys, setPressedKeys] = useState<Set<string>>(new Set());
  const [answers, setAnswers] = useState<Record<string, boolean>>({});
  const [showResult, setShowResult] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [completed, setCompleted] = useState(false);
  const [waitingForKeyUp, setWaitingForKeyUp] = useState(false);

  const currentShortcut = shortcuts[currentIndex];
  const isAnswered = answers[currentShortcut.id] !== undefined;
  const correctCount = Object.values(answers).filter(Boolean).length;
  const answeredCount = Object.keys(answers).length;

  const checkAnswer = useCallback(
    (keys: Set<string>) => {
      if (isAnswered || waitingForKeyUp) return;

      const required = new Set(currentShortcut.keys.map((k) => k.toLowerCase()));
      const pressed = new Set(Array.from(keys).map((k) => k.toLowerCase()));

      // Check if all required keys are pressed
      const allRequiredPressed = Array.from(required).every((k) => pressed.has(k));

      if (allRequiredPressed && pressed.size >= required.size) {
        const isCorrect = pressed.size === required.size;
        setAnswers({ ...answers, [currentShortcut.id]: isCorrect });
        setShowResult(true);
        setWaitingForKeyUp(true);

        // Check completion
        const newCorrectCount = correctCount + (isCorrect ? 1 : 0);
        const newAnsweredCount = answeredCount + 1;

        if (newAnsweredCount === shortcuts.length && newCorrectCount >= requiredCorrect && !completed) {
          setCompleted(true);
          onComplete();
        }
      }
    },
    [currentShortcut, isAnswered, answers, correctCount, answeredCount, shortcuts.length, requiredCorrect, completed, onComplete, waitingForKeyUp]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent default for common shortcuts to avoid browser actions
      if (
        (e.ctrlKey || e.metaKey) &&
        ['c', 'v', 'x', 'a', 's', 'z', 'f', 't', 'w', 'p'].includes(e.key.toLowerCase())
      ) {
        e.preventDefault();
      }

      const newKeys = new Set(pressedKeys);
      newKeys.add(e.key);
      if (e.ctrlKey) newKeys.add('Control');
      if (e.metaKey) newKeys.add('Meta');
      if (e.shiftKey) newKeys.add('Shift');
      if (e.altKey) newKeys.add('Alt');

      setPressedKeys(newKeys);
      checkAnswer(newKeys);
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      const newKeys = new Set(pressedKeys);
      newKeys.delete(e.key);
      if (!e.ctrlKey) newKeys.delete('Control');
      if (!e.metaKey) newKeys.delete('Meta');
      if (!e.shiftKey) newKeys.delete('Shift');
      if (!e.altKey) newKeys.delete('Alt');

      setPressedKeys(newKeys);

      if (newKeys.size === 0) {
        setWaitingForKeyUp(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [pressedKeys, checkAnswer]);

  const nextShortcut = () => {
    setShowResult(false);
    setShowHint(false);
    setPressedKeys(new Set());

    if (currentIndex < shortcuts.length - 1) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const skipShortcut = () => {
    if (!isAnswered) {
      setAnswers({ ...answers, [currentShortcut.id]: false });
    }
    nextShortcut();
  };

  const isCorrect = answers[currentShortcut.id];
  const isLastShortcut = currentIndex === shortcuts.length - 1;

  const getKeyDisplay = (key: string): string => {
    const keyMap: Record<string, string> = {
      Control: 'Ctrl',
      Meta: '⌘',
      Shift: '⇧',
      Alt: 'Alt',
      ' ': 'Space',
    };
    return keyMap[key] || key.toUpperCase();
  };

  return (
    <div className="shortcut-master-exercise">
      <div className="shortcut-progress">
        <span>Zkratka {currentIndex + 1} z {shortcuts.length}</span>
        <span className="score">Správně: {correctCount}/{answeredCount}</span>
      </div>

      <div className="shortcut-challenge">
        <div className="shortcut-category">
          <span className="category-icon">{categoryIcons[currentShortcut.category]}</span>
          <span className="category-name">{categoryLabels[currentShortcut.category]}</span>
        </div>

        <h3 className="action-text">{currentShortcut.action}</h3>

        <p className="instruction">Stiskni správnou klávesovou zkratku!</p>

        {showKeyboard && (
          <div className="pressed-keys">
            {pressedKeys.size > 0 ? (
              <div className="keys-display">
                {Array.from(pressedKeys).map((key, i) => (
                  <span key={i} className="key-badge">
                    {getKeyDisplay(key)}
                  </span>
                ))}
              </div>
            ) : (
              <div className="keys-placeholder">
                Čekám na stisk kláves...
              </div>
            )}
          </div>
        )}

        {!showResult && !isAnswered && (
          <div className="shortcut-actions">
            {currentShortcut.hint && (
              <button onClick={() => setShowHint(!showHint)} className="btn-hint">
                💡 {showHint ? 'Skrýt' : 'Nápověda'}
              </button>
            )}
            <button onClick={skipShortcut} className="btn-skip">
              Přeskočit →
            </button>
          </div>
        )}

        {showHint && !showResult && (
          <div className="hint-box">
            <p>{currentShortcut.hint}</p>
          </div>
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

            <div className="correct-shortcut">
              <span>Správná zkratka: </span>
              <span className="shortcut-display">{currentShortcut.displayKeys}</span>
            </div>

            {!isLastShortcut ? (
              <button className="btn-next" onClick={nextShortcut}>
                Další zkratka →
              </button>
            ) : (
              <div className="final-results">
                <h3>Výsledky</h3>
                <div className="final-score">
                  <span className="score-number">{correctCount}</span>
                  <span className="score-divider">/</span>
                  <span className="score-total">{shortcuts.length}</span>
                </div>
                <p className="score-message">
                  {correctCount === shortcuts.length
                    ? '🏆 Perfektní! Jsi mistr klávesových zkratek!'
                    : correctCount >= shortcuts.length * 0.8
                    ? '👍 Výborně! Většinu zkratek ovládáš.'
                    : correctCount >= shortcuts.length * 0.6
                    ? '📚 Dobrý začátek, zkus si zkratky procvičit.'
                    : '⚠️ Zkratky ti ušetří spoustu času - procvič je!'}
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

      <div className="shortcut-tips">
        <h4>💡 Nejužitečnější zkratky:</h4>
        <div className="tips-grid">
          <div className="tip-item">
            <span className="tip-keys">{ctrlDisplay} + C</span>
            <span className="tip-action">Kopírovat</span>
          </div>
          <div className="tip-item">
            <span className="tip-keys">{ctrlDisplay} + V</span>
            <span className="tip-action">Vložit</span>
          </div>
          <div className="tip-item">
            <span className="tip-keys">{ctrlDisplay} + Z</span>
            <span className="tip-action">Zpět</span>
          </div>
          <div className="tip-item">
            <span className="tip-keys">{ctrlDisplay} + S</span>
            <span className="tip-action">Uložit</span>
          </div>
        </div>
      </div>
    </div>
  );
}
