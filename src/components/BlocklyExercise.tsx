import { useState, useEffect, useRef, useCallback } from 'react';
import * as Blockly from 'blockly';
import { javascriptGenerator, Order } from 'blockly/javascript';
import 'blockly/blocks';

// Czech translations
const CZ_TRANSLATIONS: Record<string, string> = {
  'CONTROLS_REPEAT_TITLE': 'opakuj %1 krát',
  'CONTROLS_REPEAT_INPUT_DO': 'dělej',
  'CONTROLS_IF_MSG_IF': 'když',
  'CONTROLS_IF_MSG_THEN': 'pak',
  'CONTROLS_IF_MSG_ELSE': 'jinak',
  'CONTROLS_IF_MSG_ELSEIF': 'jinak když',
  'LOGIC_COMPARE_TOOLTIP_EQ': 'Vrátí true, pokud jsou oba vstupy stejné.',
  'MATH_NUMBER_TOOLTIP': 'Číslo.',
  'TEXT_TEXT_TOOLTIP': 'Písmeno, slovo nebo řádek textu.',
  'TEXT_PRINT_TITLE': 'vypiš %1',
  'TEXT_PRINT_TOOLTIP': 'Vypíše zadaný text, číslo nebo jinou hodnotu.',
  'VARIABLES_SET': 'nastav %1 na %2',
  'VARIABLES_GET': '%1',
  'MATH_ARITHMETIC_TOOLTIP_ADD': 'Vrátí součet dvou čísel.',
  'MATH_ARITHMETIC_TOOLTIP_MINUS': 'Vrátí rozdíl dvou čísel.',
  'MATH_ARITHMETIC_TOOLTIP_MULTIPLY': 'Vrátí součin dvou čísel.',
  'MATH_ARITHMETIC_TOOLTIP_DIVIDE': 'Vrátí podíl dvou čísel.',
};

// Apply translations
Object.entries(CZ_TRANSLATIONS).forEach(([key, value]) => {
  Blockly.Msg[key] = value;
});

// Custom block for simple output (with value input for connecting blocks)
Blockly.Blocks['text_print_simple'] = {
  init: function() {
    this.appendValueInput('TEXT')
        .setCheck(null)
        .appendField('vypiš');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip('Vypíše text na obrazovku');
  }
};

javascriptGenerator.forBlock['text_print_simple'] = function(block: Blockly.Block) {
  const value = javascriptGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  return `__print(${value});\n`;
};

// Custom wider text block (replaces default narrow one)
Blockly.Blocks['text_wide'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('"')
        .appendField(new Blockly.FieldTextInput('text zde'), 'TEXT')
        .appendField('"');
    this.setOutput(true, 'String');
    this.setColour(160);
    this.setTooltip('Textový řetězec - napiš svůj text');
  }
};

javascriptGenerator.forBlock['text_wide'] = function(block: Blockly.Block) {
  const text = block.getFieldValue('TEXT') || '';
  return [`'${text.replace(/'/g, "\\'")}'`, Order.ATOMIC];
};

// BEGINNER FRIENDLY: Print text block with inline text field
Blockly.Blocks['print_text'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('vypiš text')
        .appendField(new Blockly.FieldTextInput('Ahoj'), 'TEXT');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(160);
    this.setTooltip('Vypíše text na obrazovku - prostě napiš text přímo sem!');
  }
};

javascriptGenerator.forBlock['print_text'] = function(block: Blockly.Block) {
  const text = block.getFieldValue('TEXT') || '';
  return `__print('${text.replace(/'/g, "\\'")}');\n`;
};

// BEGINNER FRIENDLY: Print number block with inline number field
Blockly.Blocks['print_number'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('vypiš číslo')
        .appendField(new Blockly.FieldNumber(0), 'NUM');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip('Vypíše číslo na obrazovku');
  }
};

javascriptGenerator.forBlock['print_number'] = function(block: Blockly.Block) {
  const num = block.getFieldValue('NUM') || 0;
  return `__print(${num});\n`;
};

// BEGINNER FRIENDLY: Print variable block
Blockly.Blocks['print_variable'] = {
  init: function() {
    this.appendDummyInput()
        .appendField('vypiš proměnnou')
        .appendField(new Blockly.FieldVariable('i'), 'VAR');
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(330);
    this.setTooltip('Vypíše hodnotu proměnné');
  }
};

javascriptGenerator.forBlock['print_variable'] = function(block: Blockly.Block) {
  const variable = javascriptGenerator.getVariableName(block.getFieldValue('VAR'));
  return `__print(${variable});\n`;
};

// Custom block for asking input
Blockly.Blocks['input_prompt'] = {
  init: function() {
    this.appendValueInput('TEXT')
        .setCheck('String')
        .appendField('zeptej se');
    this.setOutput(true, null);
    this.setColour(160);
    this.setTooltip('Zeptá se uživatele a vrátí odpověď');
  }
};

javascriptGenerator.forBlock['input_prompt'] = function(block: Blockly.Block) {
  const text = javascriptGenerator.valueToCode(block, 'TEXT', Order.NONE) || "''";
  return [`__input(${text})`, Order.FUNCTION_CALL];
};

export interface BlocklyExerciseConfig {
  // Initial blocks as XML (for pre-loaded exercises)
  initialBlocks?: string;
  // Expected output for validation
  expectedOutput?: string;
  // Allowed block types (empty = all)
  allowedBlocks?: string[];
  // Max blocks allowed (0 = unlimited)
  maxBlocks?: number;
  // Exercise mode
  mode?: 'free' | 'fix_bug' | 'complete';
  // Locked blocks (for complete mode)
  lockedBlocks?: string;
  // Hints
  hints?: string[];
  // Test inputs for exercises that need input
  testInputs?: string[];
}

interface BlocklyExerciseProps {
  config: BlocklyExerciseConfig;
  title?: string;
  instruction?: string;
  onComplete?: (isCorrect: boolean, score: number, total: number) => void;
}

// Default toolbox with basic programming blocks
const DEFAULT_TOOLBOX = {
  kind: 'categoryToolbox',
  contents: [
    {
      kind: 'category',
      name: 'Logika',
      colour: '#5C81A6',
      contents: [
        { kind: 'block', type: 'controls_if' },
        { kind: 'block', type: 'logic_compare' },
        { kind: 'block', type: 'logic_operation' },
        { kind: 'block', type: 'logic_boolean' },
      ]
    },
    {
      kind: 'category',
      name: 'Cykly',
      colour: '#5CA65C',
      contents: [
        { kind: 'block', type: 'controls_repeat_ext' },
        { kind: 'block', type: 'controls_whileUntil' },
        { kind: 'block', type: 'controls_for' },
      ]
    },
    {
      kind: 'category',
      name: 'Matematika',
      colour: '#5C68A6',
      contents: [
        { kind: 'block', type: 'math_number' },
        { kind: 'block', type: 'math_arithmetic' },
        { kind: 'block', type: 'math_modulo' },
        { kind: 'block', type: 'math_random_int' },
      ]
    },
    {
      kind: 'category',
      name: 'Text',
      colour: '#5CA68D',
      contents: [
        { kind: 'block', type: 'text_wide' },
        { kind: 'block', type: 'text_print_simple' },
        { kind: 'block', type: 'text_join' },
        { kind: 'block', type: 'text_length' },
      ]
    },
    {
      kind: 'category',
      name: 'Proměnné',
      colour: '#A65C81',
      custom: 'VARIABLE'
    },
  ]
};

// Simple toolbox for beginners
const SIMPLE_TOOLBOX = {
  kind: 'flyoutToolbox',
  contents: [
    // Beginner-friendly blocks with inline fields (just type directly!)
    { kind: 'label', text: '📝 Výpis (klikni a piš):' },
    { kind: 'block', type: 'print_text' },
    { kind: 'block', type: 'print_number' },
    { kind: 'block', type: 'print_variable' },
    { kind: 'sep', gap: '24' },
    // Advanced blocks (need to connect)
    { kind: 'label', text: '🔧 Pokročilé:' },
    { kind: 'block', type: 'text_print_simple' },
    { kind: 'block', type: 'text_wide' },
    { kind: 'block', type: 'math_number' },
    { kind: 'block', type: 'math_arithmetic' },
    { kind: 'sep', gap: '24' },
    { kind: 'label', text: '🔁 Cykly a podmínky:' },
    { kind: 'block', type: 'controls_repeat_ext' },
    { kind: 'block', type: 'controls_if' },
    { kind: 'block', type: 'logic_compare' },
  ]
};

export default function BlocklyExercise({
  config,
  title = 'Bloky',
  instruction = 'Sestav program pomocí bloků.',
  onComplete,
}: BlocklyExerciseProps) {
  const blocklyDiv = useRef<HTMLDivElement>(null);
  const workspaceRef = useRef<Blockly.WorkspaceSvg | null>(null);

  const [output, setOutput] = useState<string[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<'none' | 'success' | 'error' | 'wrong'>('none');
  const [errorMessage, setErrorMessage] = useState('');
  const [showHint, setShowHint] = useState(false);
  const [currentHint, setCurrentHint] = useState(0);
  const [generatedCode, setGeneratedCode] = useState('');

  // Initialize Blockly
  useEffect(() => {
    if (!blocklyDiv.current) return;

    // Determine toolbox based on config
    const toolbox = config.allowedBlocks?.length
      ? {
          kind: 'flyoutToolbox',
          contents: config.allowedBlocks.map(type => ({ kind: 'block', type }))
        }
      : (config.mode === 'free' ? DEFAULT_TOOLBOX : SIMPLE_TOOLBOX);

    const workspace = Blockly.inject(blocklyDiv.current, {
      toolbox,
      grid: {
        spacing: 20,
        length: 3,
        colour: '#ccc',
        snap: true
      },
      zoom: {
        controls: true,
        wheel: true,
        startScale: 1.0,
        maxScale: 2,
        minScale: 0.5,
        scaleSpeed: 1.1
      },
      trashcan: true,
      maxBlocks: config.maxBlocks || Infinity
    });

    workspaceRef.current = workspace;

    // Load initial blocks if provided
    if (config.initialBlocks) {
      try {
        const xml = Blockly.utils.xml.textToDom(config.initialBlocks);
        Blockly.Xml.domToWorkspace(xml, workspace);
      } catch (e) {
        console.error('Failed to load initial blocks:', e);
      }
    }

    // Update generated code on change
    workspace.addChangeListener(() => {
      try {
        const code = javascriptGenerator.workspaceToCode(workspace);
        setGeneratedCode(code);
      } catch {
        // Ignore code generation errors during editing
      }
    });

    return () => {
      workspace.dispose();
    };
  }, [config.initialBlocks, config.allowedBlocks, config.mode, config.maxBlocks]);

  // Run the code
  const runCode = useCallback(() => {
    if (!workspaceRef.current) return;

    setIsRunning(true);
    setOutput([]);
    setResult('none');
    setErrorMessage('');

    try {
      const code = javascriptGenerator.workspaceToCode(workspaceRef.current);
      const outputLines: string[] = [];
      let inputIndex = 0;

      // Create safe execution environment
      const __print = (value: unknown) => {
        outputLines.push(String(value));
      };

      const __input = (_prompt: string): string => {
        const inputs = config.testInputs || [];
        if (inputIndex < inputs.length) {
          return inputs[inputIndex++];
        }
        return '';
      };

      // Wrap code to prevent infinite loops
      const wrappedCode = `
        let __loopCount = 0;
        const __maxLoops = 10000;
        const __checkLoop = () => {
          if (++__loopCount > __maxLoops) {
            throw new Error('Nekonečný cyklus detekován!');
          }
        };
        ${code.replace(/while\s*\(/g, 'while(__checkLoop() || true && ')}
      `;

      // Execute with timeout
      const executeWithTimeout = new Promise<void>((resolve, reject) => {
        const timeout = setTimeout(() => {
          reject(new Error('Program běžel příliš dlouho!'));
        }, 5000);

        try {
          // eslint-disable-next-line no-new-func
          const fn = new Function('__print', '__input', wrappedCode);
          fn(__print, __input);
          clearTimeout(timeout);
          resolve();
        } catch (e) {
          clearTimeout(timeout);
          reject(e);
        }
      });

      executeWithTimeout
        .then(() => {
          setOutput(outputLines);

          // Check result
          if (config.expectedOutput !== undefined) {
            const expected = config.expectedOutput.trim();
            const actual = outputLines.join('\n').trim();

            if (actual === expected) {
              setResult('success');
              if (onComplete) {
                onComplete(true, 1, 1);
              }
            } else {
              setResult('wrong');
              setErrorMessage(`Očekávaný výstup: "${expected}"\nTvůj výstup: "${actual}"`);
            }
          } else {
            setResult('success');
            if (onComplete) {
              onComplete(true, 1, 1);
            }
          }
        })
        .catch((e: Error) => {
          setResult('error');
          setErrorMessage(e.message || 'Chyba při spuštění programu');
        })
        .finally(() => {
          setIsRunning(false);
        });

    } catch (e) {
      setResult('error');
      setErrorMessage(e instanceof Error ? e.message : 'Chyba při generování kódu');
      setIsRunning(false);
    }
  }, [config.expectedOutput, config.testInputs, onComplete]);

  // Reset workspace
  const reset = useCallback(() => {
    if (!workspaceRef.current) return;

    workspaceRef.current.clear();
    setOutput([]);
    setResult('none');
    setErrorMessage('');
    setShowHint(false);
    setCurrentHint(0);

    // Reload initial blocks
    if (config.initialBlocks) {
      try {
        const xml = Blockly.utils.xml.textToDom(config.initialBlocks);
        Blockly.Xml.domToWorkspace(xml, workspaceRef.current);
      } catch (e) {
        console.error('Failed to reload initial blocks:', e);
      }
    }
  }, [config.initialBlocks]);

  // Show next hint
  const showNextHint = () => {
    if (config.hints && currentHint < config.hints.length - 1) {
      setCurrentHint(currentHint + 1);
    }
    setShowHint(true);
  };

  return (
    <div className="blockly-exercise">
      <div className="blockly-header">
        <h3>{title}</h3>
        <p>{instruction}</p>
        {config.expectedOutput && (
          <div className="blockly-expected">
            <strong>Cíl:</strong> Program by měl vypsat: <code>{config.expectedOutput}</code>
          </div>
        )}
      </div>

      <div className="blockly-workspace-container">
        <div ref={blocklyDiv} className="blockly-workspace" />
      </div>

      <div className="blockly-controls">
        <button
          className="btn-primary blockly-run-btn"
          onClick={runCode}
          disabled={isRunning}
        >
          {isRunning ? 'Běží...' : '▶ Spustit'}
        </button>
        <button className="btn-secondary" onClick={reset}>
          Resetovat
        </button>
        {config.hints && config.hints.length > 0 && (
          <button className="btn-secondary blockly-hint-btn" onClick={showNextHint}>
            💡 Nápověda
          </button>
        )}
      </div>

      {/* Hints */}
      {showHint && config.hints && (
        <div className="blockly-hint">
          <div className="hint-content">
            💡 {config.hints[currentHint]}
          </div>
          {currentHint < config.hints.length - 1 && (
            <button className="btn-small" onClick={() => setCurrentHint(currentHint + 1)}>
              Další nápověda
            </button>
          )}
        </div>
      )}

      {/* Output Console */}
      <div className={`blockly-console ${result}`}>
        <div className="console-header">
          <span>Výstup programu</span>
          {result === 'success' && <span className="result-badge success">✓ Správně!</span>}
          {result === 'wrong' && <span className="result-badge wrong">✗ Zkus to znovu</span>}
          {result === 'error' && <span className="result-badge error">⚠ Chyba</span>}
        </div>
        <div className="console-output">
          {output.length > 0 ? (
            output.map((line, i) => <div key={i} className="output-line">{line}</div>)
          ) : (
            <div className="output-placeholder">Klikni na "Spustit" pro zobrazení výstupu</div>
          )}
          {errorMessage && (
            <div className="console-error">{errorMessage}</div>
          )}
        </div>
      </div>

      {/* Generated Code (collapsible) */}
      <details className="blockly-code-preview">
        <summary>Zobrazit vygenerovaný kód</summary>
        <pre><code>{generatedCode || '// Žádný kód zatím'}</code></pre>
      </details>
    </div>
  );
}
