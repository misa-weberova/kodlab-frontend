import { useRef, useEffect, useState } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeEditorProps {
  initialCode?: string;
  title?: string;
  instruction?: string;
  task?: string;
  expectedOutput?: string;
  onRun?: (code: string) => void;
  onComplete?: (isCorrect: boolean, score: number, total: number) => void;
}

export default function CodeEditor({
  initialCode = '',
  title = 'Napiš kód',
  instruction = 'Napiš kód v Pythonu a spusť ho.',
  task,
  expectedOutput,
  onRun,
  onComplete,
}: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [isCompleted, setIsCompleted] = useState(false);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: initialCode || '# Napiš svůj kód zde\n',
      extensions: [
        lineNumbers(),
        highlightActiveLine(),
        history(),
        keymap.of([...defaultKeymap, ...historyKeymap]),
        python(),
        oneDark,
        EditorView.theme({
          '&': {
            fontSize: '14px',
            height: '200px',
          },
          '.cm-scroller': {
            fontFamily: '"Fira Code", "Source Code Pro", monospace',
          },
          '.cm-content': {
            padding: '12px 0',
          },
        }),
      ],
    });

    const view = new EditorView({
      state,
      parent: editorRef.current,
    });

    viewRef.current = view;

    return () => {
      view.destroy();
    };
  }, []);

  const handleRun = () => {
    if (!viewRef.current) return;

    const code = viewRef.current.state.doc.toString();
    setIsRunning(true);

    if (onRun) {
      onRun(code);
    }

    // Simulate code execution (placeholder)
    setTimeout(() => {
      // Simple simulation - check if code contains print
      let simulatedOutput = '';

      // Extract strings from print statements
      const printMatches = code.matchAll(/print\s*\(\s*["'](.+?)["']\s*\)/g);
      for (const match of printMatches) {
        simulatedOutput += match[1] + '\n';
      }

      if (!simulatedOutput) {
        simulatedOutput = 'Spouštění kódu bude brzy dostupné...';
      }

      setOutput(simulatedOutput.trim());
      setIsRunning(false);
    }, 500);
  };

  const handleCheck = () => {
    if (!output) return;

    const correct = expectedOutput
      ? output.trim().toLowerCase() === expectedOutput.trim().toLowerCase()
      : true; // If no expected output, consider it correct if they ran the code

    setIsCorrect(correct);
    setIsCompleted(true);

    if (onComplete) {
      onComplete(correct, correct ? 1 : 0, 1);
    }
  };

  const handleReset = () => {
    setOutput(null);
    setIsCompleted(false);
    setIsCorrect(null);
  };

  return (
    <div className="code-editor-exercise">
      <div className="code-editor-exercise-header">
        <h3>{title}</h3>
        <p>{instruction}</p>
      </div>

      {task && (
        <div className="code-editor-task">
          <strong>Úkol:</strong> {task}
          {expectedOutput && (
            <div className="code-editor-expected">
              Očekávaný výstup: <code>{expectedOutput}</code>
            </div>
          )}
        </div>
      )}

      <div className="code-editor-container">
        <div className="code-editor-header">
          <span className="code-editor-language">Python</span>
          <button
            className="code-editor-run-btn"
            onClick={handleRun}
            disabled={isRunning || isCompleted}
          >
            {isRunning ? 'Spouštím...' : 'Spustit ▶'}
          </button>
        </div>
        <div ref={editorRef} className="code-editor" />
        {output !== null && (
          <div className={`code-editor-output ${isCorrect === true ? 'correct' : ''} ${isCorrect === false ? 'incorrect' : ''}`}>
            <div className="code-editor-output-header">
              Výstup
              {isCorrect === true && <span className="output-status correct">✓ Správně!</span>}
              {isCorrect === false && <span className="output-status incorrect">✗ Zkus to znovu</span>}
            </div>
            <pre>{output}</pre>
          </div>
        )}
      </div>

      <div className="code-editor-footer">
        {!isCompleted ? (
          <button
            className="btn-primary"
            onClick={handleCheck}
            disabled={output === null}
          >
            Zkontrolovat
          </button>
        ) : (
          <div className="code-editor-result">
            <div className={`code-editor-score ${isCorrect ? 'perfect' : ''}`}>
              {isCorrect ? (
                <>Výborně! Úkol splněn!</>
              ) : (
                <>Zkus upravit kód a spustit znovu</>
              )}
            </div>
            <button className="btn-secondary" onClick={handleReset}>
              Zkusit znovu
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
