import { useState } from 'react';

interface UrlQuestion {
  id: string;
  url: string;
  isSafe: boolean;
  explanation: string;
  redFlags?: string[];
}

interface UrlSafetyExerciseProps {
  config: {
    urls?: UrlQuestion[];
    requiredCorrect?: number;
  };
  onComplete: () => void;
}

const defaultUrls: UrlQuestion[] = [
  {
    id: '1',
    url: 'https://www.google.com/search?q=pocasi',
    isSafe: true,
    explanation: 'Oficiální stránka Google s HTTPS zabezpečením.',
  },
  {
    id: '2',
    url: 'http://faceb00k-login.tk/verify',
    isSafe: false,
    explanation: 'Podvodná stránka napodobující Facebook.',
    redFlags: [
      'Překlep v názvu (faceb00k místo facebook)',
      'Podezřelá doména .tk',
      'Chybí HTTPS (pouze http)',
      'Podezřelá cesta /verify',
    ],
  },
  {
    id: '3',
    url: 'https://www.csob.cz/portal/lide',
    isSafe: true,
    explanation: 'Oficiální stránka ČSOB banky s platným HTTPS.',
  },
  {
    id: '4',
    url: 'https://apple.com.free-iphone.xyz/win',
    isSafe: false,
    explanation: 'Podvodná stránka - skutečná doména je free-iphone.xyz, ne apple.com.',
    redFlags: [
      'apple.com je pouze subdoména',
      'Skutečná doména je free-iphone.xyz',
      'Podezřelý slib výhry (/win)',
    ],
  },
  {
    id: '5',
    url: 'https://seznam.cz',
    isSafe: true,
    explanation: 'Oficiální stránka Seznam.cz s HTTPS.',
  },
  {
    id: '6',
    url: 'http://192.168.1.100/bank-login/',
    isSafe: false,
    explanation: 'IP adresa místo doménového jména - nikdy nezadávej údaje!',
    redFlags: [
      'IP adresa místo normální domény',
      'Chybí HTTPS',
      'Banky nikdy nepoužívají IP adresy',
    ],
  },
  {
    id: '7',
    url: 'https://pay.google.com/payments',
    isSafe: true,
    explanation: 'Oficiální platební služba Google s HTTPS.',
  },
  {
    id: '8',
    url: 'https://www.arnazon.com/deals',
    isSafe: false,
    explanation: 'Podvodná stránka - "arnazon" místo "amazon" (rn vypadá jako m).',
    redFlags: [
      'Překlep: arnazon místo amazon',
      'Využívá vizuální podobnost "rn" a "m"',
    ],
  },
];

export default function UrlSafetyExercise({ config, onComplete }: UrlSafetyExerciseProps) {
  const urls = config.urls || defaultUrls;
  const requiredCorrect = config.requiredCorrect || Math.ceil(urls.length * 0.8);

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [showResult, setShowResult] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentUrl = urls[currentIndex];
  const currentAnswer = answers[currentUrl.id];
  const isAnswered = currentAnswer !== undefined && currentAnswer !== null;

  const handleAnswer = (isSafe: boolean) => {
    if (isAnswered) return;
    setAnswers({ ...answers, [currentUrl.id]: isSafe });
    setShowResult(true);
  };

  const handleNext = () => {
    setShowResult(false);

    if (currentIndex < urls.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      const correctCount = urls.filter(url => answers[url.id] === url.isSafe).length;
      if (correctCount >= requiredCorrect && !completed) {
        setCompleted(true);
        onComplete();
      }
    }
  };

  const isCorrect = currentAnswer === currentUrl.isSafe;
  const answeredCount = Object.keys(answers).length;
  const correctCount = urls.filter(url => answers[url.id] === url.isSafe).length;
  const isLastQuestion = currentIndex === urls.length - 1;

  // Parse URL for visual highlighting
  const parseUrl = (urlString: string) => {
    try {
      const url = new URL(urlString);
      return {
        protocol: url.protocol,
        host: url.host,
        pathname: url.pathname + url.search,
      };
    } catch {
      return { protocol: '', host: urlString, pathname: '' };
    }
  };

  const parsedUrl = parseUrl(currentUrl.url);

  return (
    <div className="url-safety-exercise">
      <div className="url-progress">
        <span>Odkaz {currentIndex + 1} z {urls.length}</span>
        <span className="score">Správně: {correctCount}/{answeredCount}</span>
      </div>

      <div className="url-display">
        <div className="url-label">Analyzuj tento odkaz:</div>
        <div className="url-box">
          <span className={`url-protocol ${parsedUrl.protocol === 'https:' ? 'secure' : 'insecure'}`}>
            {parsedUrl.protocol === 'https:' ? '🔒 ' : '⚠️ '}{parsedUrl.protocol}//
          </span>
          <span className="url-host">{parsedUrl.host}</span>
          <span className="url-path">{parsedUrl.pathname}</span>
        </div>
      </div>

      {!showResult ? (
        <div className="answer-buttons">
          <button className="btn-safe" onClick={() => handleAnswer(true)}>
            ✅ Bezpečný odkaz
          </button>
          <button className="btn-dangerous" onClick={() => handleAnswer(false)}>
            ⚠️ Podezřelý odkaz
          </button>
        </div>
      ) : (
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
                <span>Špatná odpověď</span>
              </>
            )}
          </div>

          <div className="result-explanation">
            <p className={currentUrl.isSafe ? 'safe-text' : 'danger-text'}>
              {currentUrl.isSafe ? '✅ Tento odkaz je bezpečný.' : '⚠️ Tento odkaz je podezřelý!'}
            </p>
            <p>{currentUrl.explanation}</p>

            {currentUrl.redFlags && currentUrl.redFlags.length > 0 && (
              <div className="red-flags">
                <h4>🚩 Varovné znaky:</h4>
                <ul>
                  {currentUrl.redFlags.map((flag, i) => (
                    <li key={i}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button className="btn-next" onClick={handleNext}>
            {!isLastQuestion ? 'Další odkaz →' : 'Zobrazit výsledky'}
          </button>
        </div>
      )}

      {isLastQuestion && isAnswered && !showResult && (
        <div className="final-results">
          <h3>Výsledky</h3>
          <div className="final-score">
            <span className="score-number">{correctCount}</span>
            <span className="score-divider">/</span>
            <span className="score-total">{urls.length}</span>
          </div>
          <p className="score-message">
            {correctCount === urls.length
              ? '🏆 Perfektní! Umíš rozpoznat nebezpečné odkazy!'
              : correctCount >= urls.length * 0.8
              ? '👍 Výborně! Většinu odkazů jsi správně vyhodnotil/a.'
              : correctCount >= urls.length * 0.6
              ? '📚 Dobrý začátek, procvič si ještě rozpoznávání URL.'
              : '⚠️ Dávej větší pozor na podezřelé znaky v URL!'}
          </p>
          {completed && (
            <div className="completion-badge">
              ✅ Cvičení splněno!
            </div>
          )}
        </div>
      )}

      <div className="url-tips">
        <h4>💡 Jak poznat bezpečný odkaz:</h4>
        <ul>
          <li><strong>🔒 HTTPS</strong> - hledej zámek a https://</li>
          <li><strong>Správná doména</strong> - pozor na překlepy (go0gle, arnazon)</li>
          <li><strong>Známá koncovka</strong> - .cz, .com, .org jsou běžné</li>
          <li><strong>Bez IP adresy</strong> - banky nepoužívají čísla místo jména</li>
          <li><strong>Subdoména vs doména</strong> - google.com.podvod.cz není Google!</li>
        </ul>
      </div>
    </div>
  );
}
