import { useRef, useEffect, useState } from 'react';
import { EditorView, keymap, lineNumbers, highlightActiveLine } from '@codemirror/view';
import { EditorState } from '@codemirror/state';
import { defaultKeymap, history, historyKeymap } from '@codemirror/commands';
import { python } from '@codemirror/lang-python';
import { oneDark } from '@codemirror/theme-one-dark';

interface CodeEditorProps {
  initialCode?: string;
  onRun?: (code: string) => void;
}

export default function CodeEditor({ initialCode = '', onRun }: CodeEditorProps) {
  const editorRef = useRef<HTMLDivElement>(null);
  const viewRef = useRef<EditorView | null>(null);
  const [output, setOutput] = useState<string | null>(null);
  const [isRunning, setIsRunning] = useState(false);

  useEffect(() => {
    if (!editorRef.current) return;

    const state = EditorState.create({
      doc: initialCode || '# Napiš svůj kód zde\nprint("Ahoj, světe!")\n',
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
    } else {
      // Placeholder output - will be replaced with real execution later
      setOutput('Spouštění kódu bude brzy dostupné...');
    }

    setIsRunning(false);
  };

  return (
    <div className="code-editor-container">
      <div className="code-editor-header">
        <span className="code-editor-language">Python</span>
        <button
          className="code-editor-run-btn"
          onClick={handleRun}
          disabled={isRunning}
        >
          {isRunning ? 'Spouštím...' : 'Spustit'}
        </button>
      </div>
      <div ref={editorRef} className="code-editor" />
      {output !== null && (
        <div className="code-editor-output">
          <div className="code-editor-output-header">Výstup</div>
          <pre>{output}</pre>
        </div>
      )}
    </div>
  );
}
