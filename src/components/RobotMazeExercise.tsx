import { useState, useCallback } from 'react';

type Direction = 'up' | 'down' | 'left' | 'right';
type CellType = 'empty' | 'wall' | 'start' | 'target' | 'robot';
type Command = 'forward' | 'turnLeft' | 'turnRight';

interface MazeConfig {
  grid: CellType[][];
  startPosition: { row: number; col: number };
  startDirection: Direction;
  targetPosition: { row: number; col: number };
  availableCommands?: Command[];
  maxCommands?: number;
}

interface RobotMazeExerciseProps {
  config: {
    mazes?: MazeConfig[];
    requiredCompleted?: number;
  };
  onComplete: () => void;
}

const defaultMazes: MazeConfig[] = [
  {
    grid: [
      ['empty', 'empty', 'target'],
      ['wall', 'wall', 'empty'],
      ['start', 'empty', 'empty'],
    ],
    startPosition: { row: 2, col: 0 },
    startDirection: 'right',
    targetPosition: { row: 0, col: 2 },
    availableCommands: ['forward', 'turnLeft', 'turnRight'],
    maxCommands: 10,
  },
  {
    grid: [
      ['empty', 'wall', 'target'],
      ['empty', 'wall', 'empty'],
      ['start', 'empty', 'empty'],
    ],
    startPosition: { row: 2, col: 0 },
    startDirection: 'up',
    targetPosition: { row: 0, col: 2 },
    availableCommands: ['forward', 'turnLeft', 'turnRight'],
    maxCommands: 8,
  },
  {
    grid: [
      ['start', 'empty', 'empty', 'empty'],
      ['wall', 'wall', 'wall', 'empty'],
      ['empty', 'empty', 'empty', 'empty'],
      ['empty', 'wall', 'wall', 'wall'],
      ['empty', 'empty', 'empty', 'target'],
    ],
    startPosition: { row: 0, col: 0 },
    startDirection: 'right',
    targetPosition: { row: 4, col: 3 },
    availableCommands: ['forward', 'turnLeft', 'turnRight'],
    maxCommands: 15,
  },
];

const directionArrows: Record<Direction, string> = {
  up: '↑',
  down: '↓',
  left: '←',
  right: '→',
};

const commandLabels: Record<Command, string> = {
  forward: '⬆️ Vpřed',
  turnLeft: '↩️ Vlevo',
  turnRight: '↪️ Vpravo',
};

const turnLeft = (dir: Direction): Direction => {
  const turns: Record<Direction, Direction> = {
    up: 'left',
    left: 'down',
    down: 'right',
    right: 'up',
  };
  return turns[dir];
};

const turnRight = (dir: Direction): Direction => {
  const turns: Record<Direction, Direction> = {
    up: 'right',
    right: 'down',
    down: 'left',
    left: 'up',
  };
  return turns[dir];
};

const moveForward = (
  pos: { row: number; col: number },
  dir: Direction,
  grid: CellType[][]
): { row: number; col: number } | null => {
  const moves: Record<Direction, { dRow: number; dCol: number }> = {
    up: { dRow: -1, dCol: 0 },
    down: { dRow: 1, dCol: 0 },
    left: { dRow: 0, dCol: -1 },
    right: { dRow: 0, dCol: 1 },
  };

  const move = moves[dir];
  const newRow = pos.row + move.dRow;
  const newCol = pos.col + move.dCol;

  // Check bounds
  if (newRow < 0 || newRow >= grid.length || newCol < 0 || newCol >= grid[0].length) {
    return null;
  }

  // Check wall
  if (grid[newRow][newCol] === 'wall') {
    return null;
  }

  return { row: newRow, col: newCol };
};

export default function RobotMazeExercise({ config, onComplete }: RobotMazeExerciseProps) {
  const mazes = config.mazes || defaultMazes;
  const requiredCompleted = config.requiredCompleted || mazes.length;

  const [currentMazeIndex, setCurrentMazeIndex] = useState(0);
  const [commands, setCommands] = useState<Command[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [robotPos, setRobotPos] = useState(mazes[0].startPosition);
  const [robotDir, setRobotDir] = useState<Direction>(mazes[0].startDirection);
  const [message, setMessage] = useState('');
  const [completedMazes, setCompletedMazes] = useState<number[]>([]);
  const [completed, setCompleted] = useState(false);

  const currentMaze = mazes[currentMazeIndex];
  const maxCommands = currentMaze.maxCommands || 20;
  const availableCommands = currentMaze.availableCommands || ['forward', 'turnLeft', 'turnRight'];

  const resetRobot = useCallback(() => {
    setRobotPos(currentMaze.startPosition);
    setRobotDir(currentMaze.startDirection);
    setMessage('');
  }, [currentMaze]);

  const addCommand = (cmd: Command) => {
    if (commands.length < maxCommands && !isRunning) {
      setCommands([...commands, cmd]);
    }
  };

  const removeLastCommand = () => {
    if (!isRunning && commands.length > 0) {
      setCommands(commands.slice(0, -1));
    }
  };

  const clearCommands = () => {
    if (!isRunning) {
      setCommands([]);
      resetRobot();
    }
  };

  const runProgram = async () => {
    if (isRunning || commands.length === 0) return;

    setIsRunning(true);
    resetRobot();

    let pos = { ...currentMaze.startPosition };
    let dir = currentMaze.startDirection;

    for (const cmd of commands) {
      await new Promise((resolve) => setTimeout(resolve, 400));

      if (cmd === 'turnLeft') {
        dir = turnLeft(dir);
      } else if (cmd === 'turnRight') {
        dir = turnRight(dir);
      } else if (cmd === 'forward') {
        const newPos = moveForward(pos, dir, currentMaze.grid);
        if (newPos === null) {
          setMessage('💥 Bum! Robot narazil do zdi!');
          setIsRunning(false);
          return;
        }
        pos = newPos;
      }

      setRobotPos({ ...pos });
      setRobotDir(dir);
    }

    // Check if reached target
    if (pos.row === currentMaze.targetPosition.row && pos.col === currentMaze.targetPosition.col) {
      setMessage('🎉 Výborně! Robot dorazil do cíle!');

      if (!completedMazes.includes(currentMazeIndex)) {
        const newCompleted = [...completedMazes, currentMazeIndex];
        setCompletedMazes(newCompleted);

        if (newCompleted.length >= requiredCompleted && !completed) {
          setCompleted(true);
          onComplete();
        }
      }
    } else {
      setMessage('🤔 Robot nedorazil do cíle. Zkus to znovu!');
    }

    setIsRunning(false);
  };

  const nextMaze = () => {
    if (currentMazeIndex < mazes.length - 1) {
      const nextIndex = currentMazeIndex + 1;
      setCurrentMazeIndex(nextIndex);
      setCommands([]);
      setRobotPos(mazes[nextIndex].startPosition);
      setRobotDir(mazes[nextIndex].startDirection);
      setMessage('');
    }
  };

  const prevMaze = () => {
    if (currentMazeIndex > 0) {
      const prevIndex = currentMazeIndex - 1;
      setCurrentMazeIndex(prevIndex);
      setCommands([]);
      setRobotPos(mazes[prevIndex].startPosition);
      setRobotDir(mazes[prevIndex].startDirection);
      setMessage('');
    }
  };

  return (
    <div className="robot-maze-exercise">
      <div className="maze-header">
        <div className="maze-progress">
          <span>Bludiště {currentMazeIndex + 1} z {mazes.length}</span>
          <span className="completed-count">Dokončeno: {completedMazes.length}/{requiredCompleted}</span>
        </div>
        <div className="maze-nav">
          <button onClick={prevMaze} disabled={currentMazeIndex === 0} className="btn-nav">
            ← Předchozí
          </button>
          <button onClick={nextMaze} disabled={currentMazeIndex === mazes.length - 1} className="btn-nav">
            Další →
          </button>
        </div>
      </div>

      <div className="maze-content">
        <div className="maze-grid-container">
          <div className="maze-grid" style={{ gridTemplateColumns: `repeat(${currentMaze.grid[0].length}, 1fr)` }}>
            {currentMaze.grid.map((row, rowIndex) =>
              row.map((cell, colIndex) => {
                const isRobot = robotPos.row === rowIndex && robotPos.col === colIndex;
                const isTarget = currentMaze.targetPosition.row === rowIndex && currentMaze.targetPosition.col === colIndex;

                return (
                  <div
                    key={`${rowIndex}-${colIndex}`}
                    className={`maze-cell ${cell} ${isRobot ? 'has-robot' : ''} ${isTarget ? 'is-target' : ''}`}
                  >
                    {isRobot && (
                      <span className="robot">{directionArrows[robotDir]}</span>
                    )}
                    {isTarget && !isRobot && <span className="target">🎯</span>}
                  </div>
                );
              })
            )}
          </div>
          <div className="maze-legend">
            <span><span className="legend-robot">↑</span> Robot</span>
            <span><span className="legend-target">🎯</span> Cíl</span>
            <span><span className="legend-wall"></span> Zeď</span>
          </div>
        </div>

        <div className="command-panel">
          <h4>Příkazy ({commands.length}/{maxCommands})</h4>

          <div className="command-buttons">
            {availableCommands.map((cmd) => (
              <button
                key={cmd}
                onClick={() => addCommand(cmd)}
                disabled={isRunning || commands.length >= maxCommands}
                className={`btn-command btn-${cmd}`}
              >
                {commandLabels[cmd]}
              </button>
            ))}
          </div>

          <div className="command-list">
            {commands.length === 0 ? (
              <p className="empty-commands">Přidej příkazy kliknutím na tlačítka výše</p>
            ) : (
              <div className="commands">
                {commands.map((cmd, i) => (
                  <span key={i} className={`command-item cmd-${cmd}`}>
                    {commandLabels[cmd].split(' ')[0]}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="command-actions">
            <button onClick={removeLastCommand} disabled={isRunning || commands.length === 0} className="btn-undo">
              ↩ Zpět
            </button>
            <button onClick={clearCommands} disabled={isRunning} className="btn-clear">
              🗑️ Smazat vše
            </button>
          </div>

          <button
            onClick={runProgram}
            disabled={isRunning || commands.length === 0}
            className="btn-run"
          >
            {isRunning ? '⏳ Běží...' : '▶️ Spustit program'}
          </button>

          {message && (
            <div className={`maze-message ${message.includes('🎉') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>
      </div>

      {completed && (
        <div className="completion-badge">
          ✅ Cvičení splněno!
        </div>
      )}

      <div className="maze-tips">
        <h4>💡 Nápověda:</h4>
        <ul>
          <li><strong>Vpřed</strong> - robot se posune o 1 políčko dopředu</li>
          <li><strong>Vlevo/Vpravo</strong> - robot se otočí, ale nepohne se</li>
          <li>Robot nemůže projít zdí!</li>
          <li>Šipka ukazuje směr, kterým se robot dívá</li>
        </ul>
      </div>
    </div>
  );
}
