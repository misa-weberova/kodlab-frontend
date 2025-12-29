import { useState, useEffect } from 'react';

interface PasswordStrengthExerciseProps {
  config: {
    minStrength?: number; // Minimum strength to pass (0-100)
    showHackTime?: boolean;
    showTips?: boolean;
  };
  onComplete: () => void;
}

interface StrengthCheck {
  label: string;
  passed: boolean;
  points: number;
}

export default function PasswordStrengthExercise({ config, onComplete }: PasswordStrengthExerciseProps) {
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [strength, setStrength] = useState(0);
  const [checks, setChecks] = useState<StrengthCheck[]>([]);
  const [hackTime, setHackTime] = useState('');
  const [completed, setCompleted] = useState(false);

  const minStrength = config.minStrength ?? 60;
  const showHackTime = config.showHackTime ?? true;
  const showTips = config.showTips ?? true;

  useEffect(() => {
    analyzePassword(password);
  }, [password]);

  const analyzePassword = (pwd: string) => {
    const newChecks: StrengthCheck[] = [
      {
        label: 'Alespoň 8 znaků',
        passed: pwd.length >= 8,
        points: 5,
      },
      {
        label: 'Alespoň 12 znaků',
        passed: pwd.length >= 12,
        points: 10,
      },
      {
        label: 'Obsahuje malá písmena (a-z)',
        passed: /[a-z]/.test(pwd),
        points: 15,
      },
      {
        label: 'Obsahuje velká písmena (A-Z)',
        passed: /[A-Z]/.test(pwd),
        points: 15,
      },
      {
        label: 'Obsahuje čísla (0-9)',
        passed: /[0-9]/.test(pwd),
        points: 20,
      },
      {
        label: 'Obsahuje speciální znaky (!@#$%...)',
        passed: /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd),
        points: 25,
      },
      {
        label: 'Neobsahuje běžná slova (heslo, password, 123456)',
        passed: pwd.length > 0 && !/(heslo|password|123456|qwerty|admin)/i.test(pwd),
        points: 10,
      },
    ];

    setChecks(newChecks);

    // Calculate total strength
    const totalPoints = newChecks
      .filter(check => check.passed)
      .reduce((sum, check) => sum + check.points, 0);

    setStrength(Math.min(100, totalPoints));

    // Calculate estimated hack time
    if (pwd.length === 0) {
      setHackTime('');
    } else {
      const time = calculateHackTime(pwd);
      setHackTime(time);
    }

    // Check if exercise is completed
    if (totalPoints >= minStrength && !completed) {
      setCompleted(true);
      onComplete();
    }
  };

  const calculateHackTime = (pwd: string): string => {
    // Simplified calculation for educational purposes
    let charsetSize = 0;
    if (/[a-z]/.test(pwd)) charsetSize += 26;
    if (/[A-Z]/.test(pwd)) charsetSize += 26;
    if (/[0-9]/.test(pwd)) charsetSize += 10;
    if (/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(pwd)) charsetSize += 32;

    if (charsetSize === 0) return 'okamžitě';

    // Combinations = charset^length
    // Assume 10 billion guesses per second (modern GPU)
    const combinations = Math.pow(charsetSize, pwd.length);
    const guessesPerSecond = 10_000_000_000;
    const seconds = combinations / guessesPerSecond / 2; // Average case

    if (seconds < 1) return 'okamžitě';
    if (seconds < 60) return `${Math.round(seconds)} sekund`;
    if (seconds < 3600) return `${Math.round(seconds / 60)} minut`;
    if (seconds < 86400) return `${Math.round(seconds / 3600)} hodin`;
    if (seconds < 2592000) return `${Math.round(seconds / 86400)} dní`;
    if (seconds < 31536000) return `${Math.round(seconds / 2592000)} měsíců`;
    if (seconds < 31536000 * 100) return `${Math.round(seconds / 31536000)} let`;
    if (seconds < 31536000 * 1000) return `${Math.round(seconds / 31536000)} let`;
    if (seconds < 31536000 * 1000000) return `tisíce let`;
    if (seconds < 31536000 * 1000000000) return `miliony let`;
    return 'miliardy let';
  };

  const getStrengthLabel = (): { text: string; color: string; emoji: string } => {
    if (strength === 0) return { text: 'Zadej heslo', color: '#9e9e9e', emoji: '🔒' };
    if (strength < 30) return { text: 'Velmi slabé', color: '#f44336', emoji: '😱' };
    if (strength < 50) return { text: 'Slabé', color: '#ff9800', emoji: '😟' };
    if (strength < 70) return { text: 'Průměrné', color: '#ffc107', emoji: '😐' };
    if (strength < 90) return { text: 'Silné', color: '#8bc34a', emoji: '😊' };
    return { text: 'Velmi silné', color: '#4caf50', emoji: '💪' };
  };

  const strengthInfo = getStrengthLabel();

  return (
    <div className="password-strength-exercise">
      <div className="password-input-container">
        <input
          type={showPassword ? 'text' : 'password'}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Zadej heslo k otestování..."
          className="password-input"
          autoComplete="off"
        />
        <button
          type="button"
          className="toggle-password-btn"
          onClick={() => setShowPassword(!showPassword)}
          title={showPassword ? 'Skrýt heslo' : 'Zobrazit heslo'}
        >
          {showPassword ? '👁️' : '👁️‍🗨️'}
        </button>
      </div>

      <div className="strength-meter">
        <div className="strength-bar-container">
          <div
            className="strength-bar"
            style={{
              width: `${strength}%`,
              backgroundColor: strengthInfo.color,
            }}
          />
        </div>
        <div className="strength-label" style={{ color: strengthInfo.color }}>
          <span className="strength-emoji">{strengthInfo.emoji}</span>
          <span>{strengthInfo.text}</span>
          <span className="strength-percent">{strength}%</span>
        </div>
      </div>

      {showHackTime && hackTime && (
        <div className="hack-time">
          <div className="hack-time-icon">⏱️</div>
          <div className="hack-time-content">
            <div className="hack-time-label">Odhadovaný čas na prolomení:</div>
            <div className="hack-time-value" style={{ color: strengthInfo.color }}>
              {hackTime}
            </div>
          </div>
        </div>
      )}

      {showTips && password.length > 0 && (
        <div className="password-checks">
          <h4>Kontrola hesla:</h4>
          <ul>
            {checks.map((check, index) => (
              <li key={index} className={check.passed ? 'check-passed' : 'check-failed'}>
                <span className="check-icon">{check.passed ? '✅' : '❌'}</span>
                <span className="check-label">{check.label}</span>
                <span className="check-points">+{check.points} bodů</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {completed && (
        <div className="exercise-success">
          <div className="success-icon">🎉</div>
          <div className="success-message">
            Výborně! Vytvořil/a jsi dostatečně silné heslo!
          </div>
        </div>
      )}

      {!completed && password.length > 0 && strength < minStrength && (
        <div className="exercise-hint">
          <div className="hint-icon">💡</div>
          <div className="hint-message">
            Zkus vytvořit silnější heslo! Potřebuješ dosáhnout alespoň {minStrength}% síly.
          </div>
        </div>
      )}

      <div className="password-tips">
        <h4>💡 Tipy pro silné heslo:</h4>
        <ul>
          <li>Použij alespoň 12 znaků</li>
          <li>Kombinuj malá a velká písmena</li>
          <li>Přidej čísla a speciální znaky</li>
          <li>Nepoužívej osobní informace (jméno, datum narození)</li>
          <li>Každý účet = jiné heslo!</li>
        </ul>
      </div>
    </div>
  );
}
