import { useState } from 'react';

interface PhishingEmail {
  id: string;
  from: string;
  subject: string;
  body: string;
  isPhishing: boolean;
  redFlags: string[];
}

interface PhishingDetectorExerciseProps {
  config: {
    emails?: PhishingEmail[];
    requiredCorrect?: number;
  };
  onComplete: () => void;
}

const defaultEmails: PhishingEmail[] = [
  {
    id: '1',
    from: 'podpora@banka-ceska.cz.fake-site.com',
    subject: '⚠️ URGENTNÍ: Váš účet bude zablokován!',
    body: 'Vážený zákazníku,\n\nZaznamenali jsme podezřelou aktivitu na Vašem účtu. Pokud do 24 hodin neověříte své údaje, bude Váš účet TRVALE ZABLOKOVÁN!\n\nKlikněte ZDE pro ověření: http://banka-overeni.xyz/login\n\nS pozdravem,\nVaše Banka',
    isPhishing: true,
    redFlags: [
      'Podezřelá emailová adresa (fake-site.com)',
      'Urgentní tón a vyhrožování',
      'Podezřelý odkaz (banka-overeni.xyz)',
      'Žádost o osobní údaje',
    ],
  },
  {
    id: '2',
    from: 'info@csob.cz',
    subject: 'Měsíční výpis z účtu - prosinec 2024',
    body: 'Dobrý den,\n\nv příloze zasíláme Váš měsíční výpis z účtu za prosinec 2024.\n\nPro zobrazení výpisu se přihlaste do internetového bankovnictví na www.csob.cz.\n\nS pozdravem,\nČSOB tým',
    isPhishing: false,
    redFlags: [],
  },
  {
    id: '3',
    from: 'vyherce-loterie@gmail.com',
    subject: 'GRATULUJEME! Vyhráli jste 1.000.000 Kč!!!',
    body: 'GRATULUJEME!!!\n\nByli jste náhodně vybráni jako vítěz naší mezinárodní loterie!\n\nPro vyzvednutí výhry 1.000.000 Kč nám prosím zašlete:\n- Kopii občanského průkazu\n- Číslo bankovního účtu\n- Zálohu 500 Kč na zpracování\n\nOdpovězte IHNED!',
    isPhishing: true,
    redFlags: [
      'Gmail adresa místo oficiální domény',
      'Příliš dobré na to, aby to byla pravda',
      'Žádost o osobní dokumenty',
      'Požadavek na zaplacení zálohy',
    ],
  },
  {
    id: '4',
    from: 'noreply@netflix.com',
    subject: 'Potvrzení změny hesla',
    body: 'Dobrý den,\n\npotvrzujeme, že heslo k Vašemu Netflix účtu bylo úspěšně změněno.\n\nPokud jste tuto změnu neprovedli Vy, kontaktujte nás na help.netflix.com.\n\nNetflix tým',
    isPhishing: false,
    redFlags: [],
  },
  {
    id: '5',
    from: 'support@amaz0n-security.net',
    subject: 'Váš Amazon účet byl napaden!',
    body: 'Detekovali jsme neoprávněný přístup k Vašemu účtu!\n\nNěkdo se pokusil přihlásit z:\nLokace: Rusko\nIP: 192.168.1.1\n\nPro zabezpečení účtu klikněte zde: http://amazon-secure-login.tk/verify\n\nPokud nebudete reagovat do 2 hodin, účet bude smazán.',
    isPhishing: true,
    redFlags: [
      'Podezřelá doména (amaz0n s nulou, -security.net)',
      'Strašení a časový tlak',
      'Podezřelý odkaz (.tk doména)',
      'Vyhrožování smazáním účtu',
    ],
  },
];

export default function PhishingDetectorExercise({ config, onComplete }: PhishingDetectorExerciseProps) {
  const emails = config.emails || defaultEmails;
  const requiredCorrect = config.requiredCorrect || emails.length;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, boolean | null>>({});
  const [showResult, setShowResult] = useState(false);
  const [showExplanation, setShowExplanation] = useState(false);
  const [completed, setCompleted] = useState(false);

  const currentEmail = emails[currentIndex];
  const currentAnswer = answers[currentEmail.id];
  const isAnswered = currentAnswer !== undefined && currentAnswer !== null;

  const handleAnswer = (isPhishing: boolean) => {
    if (isAnswered) return;

    setAnswers({ ...answers, [currentEmail.id]: isPhishing });
    setShowResult(true);
  };

  const handleNext = () => {
    setShowResult(false);
    setShowExplanation(false);

    if (currentIndex < emails.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // Check if completed
      const correctCount = emails.filter(
        email => answers[email.id] === email.isPhishing
      ).length;

      if (correctCount >= requiredCorrect && !completed) {
        setCompleted(true);
        onComplete();
      }
    }
  };

  const isCorrect = currentAnswer === currentEmail.isPhishing;
  const answeredCount = Object.keys(answers).length;
  const correctCount = emails.filter(email => answers[email.id] === email.isPhishing).length;

  return (
    <div className="phishing-detector-exercise">
      <div className="email-progress">
        <span>Email {currentIndex + 1} z {emails.length}</span>
        <span className="score">Správně: {correctCount}/{answeredCount}</span>
      </div>

      <div className="email-container">
        <div className="email-header">
          <div className="email-field">
            <span className="field-label">Od:</span>
            <span className="field-value from-address">{currentEmail.from}</span>
          </div>
          <div className="email-field">
            <span className="field-label">Předmět:</span>
            <span className="field-value subject">{currentEmail.subject}</span>
          </div>
        </div>

        <div className="email-body">
          {currentEmail.body.split('\n').map((line, i) => (
            <p key={i}>{line || <br />}</p>
          ))}
        </div>
      </div>

      {!showResult ? (
        <div className="answer-buttons">
          <button
            className="btn-phishing"
            onClick={() => handleAnswer(true)}
          >
            🎣 Phishing (podvod)
          </button>
          <button
            className="btn-safe"
            onClick={() => handleAnswer(false)}
          >
            ✅ Bezpečný email
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
                <span>Bohužel špatně</span>
              </>
            )}
          </div>

          <div className="result-explanation">
            <p>
              Tento email {currentEmail.isPhishing ? 'JE phishing (podvod)' : 'je bezpečný'}.
            </p>

            {currentEmail.isPhishing && (
              <button
                className="btn-show-flags"
                onClick={() => setShowExplanation(!showExplanation)}
              >
                {showExplanation ? 'Skrýt' : 'Zobrazit'} varovné znaky
              </button>
            )}

            {showExplanation && currentEmail.redFlags.length > 0 && (
              <div className="red-flags">
                <h4>🚩 Varovné znaky:</h4>
                <ul>
                  {currentEmail.redFlags.map((flag, i) => (
                    <li key={i}>{flag}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <button className="btn-next" onClick={handleNext}>
            {currentIndex < emails.length - 1 ? 'Další email →' : 'Zobrazit výsledky'}
          </button>
        </div>
      )}

      {currentIndex === emails.length - 1 && isAnswered && !showResult && (
        <div className="final-results">
          <h3>Výsledky</h3>
          <div className="final-score">
            <span className="score-number">{correctCount}</span>
            <span className="score-divider">/</span>
            <span className="score-total">{emails.length}</span>
          </div>
          <p className="score-message">
            {correctCount === emails.length
              ? '🏆 Perfektní! Jsi expert na rozpoznávání phishingu!'
              : correctCount >= emails.length * 0.8
              ? '👍 Skvělá práce! Většinu podvodů jsi odhalil/a.'
              : correctCount >= emails.length * 0.6
              ? '📚 Dobrý začátek, ale ještě je co zlepšovat.'
              : '⚠️ Dávej větší pozor na podezřelé znaky v emailech!'}
          </p>
          {completed && (
            <div className="completion-badge">
              ✅ Cvičení splněno!
            </div>
          )}
        </div>
      )}

      <div className="phishing-tips">
        <h4>💡 Jak poznat phishing:</h4>
        <ul>
          <li>Podezřelá emailová adresa odesílatele</li>
          <li>Urgentní tón a vyhrožování</li>
          <li>Žádost o osobní údaje nebo hesla</li>
          <li>Podezřelé odkazy (zkontroluj URL)</li>
          <li>Gramatické chyby</li>
        </ul>
      </div>
    </div>
  );
}
