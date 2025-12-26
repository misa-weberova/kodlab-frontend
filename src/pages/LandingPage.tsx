import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import FloatingShapes from '../components/FloatingShapes';

export default function LandingPage() {
  return (
    <div className="landing-page">
      <FloatingShapes />

      <header className="landing-header">
        <Logo />
        <nav className="landing-nav">
          <Link to="/prihlaseni" className="btn-secondary">Přihlásit se</Link>
          <Link to="/registrace" className="btn-primary landing-cta-small">Vyzkoušet zdarma</Link>
        </nav>
      </header>

      <main className="landing-main">
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              Programování hrou
              <span className="hero-highlight">pro každé dítě</span>
            </h1>
            <p className="hero-subtitle">
              Interaktivní kurzy programování, algoritmického myšlení a digitální gramotnosti
              pro žáky základních škol. Jednoduše, zábavně a v češtině.
            </p>
            <div className="hero-buttons">
              <Link to="/registrace" className="btn-primary btn-large">
                Začít zdarma
              </Link>
              <Link to="/prihlaseni" className="btn-secondary btn-large">
                Už mám účet
              </Link>
            </div>
            <p className="hero-hint">Žádná kreditka. Začněte během minuty.</p>
          </div>

          <div className="hero-visual">
            <div className="code-preview">
              <div className="code-preview-header">
                <span className="code-dot red"></span>
                <span className="code-dot yellow"></span>
                <span className="code-dot green"></span>
                <span className="code-filename">muj_program.py</span>
              </div>
              <div className="code-preview-body">
                <code>
                  <span className="code-keyword">for</span> i <span className="code-keyword">in</span> <span className="code-func">range</span>(<span className="code-number">5</span>):<br/>
                  {'    '}<span className="code-func">print</span>(<span className="code-string">"Ahoj, světe!"</span>)
                </code>
              </div>
              <div className="code-preview-output">
                <span className="output-label">Výstup:</span>
                <div className="output-lines">
                  Ahoj, světe!<br/>
                  Ahoj, světe!<br/>
                  Ahoj, světe!<br/>
                  <span className="output-cursor">|</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="features-section">
          <h2 className="section-title">Proč KodLab?</h2>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon feature-icon-teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                </svg>
              </div>
              <h3>Hotové materiály</h3>
              <p>Připravené lekce podle RVP. Žádné hodiny příprav – stačí přihlásit žáky a učit.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon-orange">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M14.828 14.828a4 4 0 01-5.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3>Zábavné pro děti</h3>
              <p>Interaktivní úkoly a okamžitá zpětná vazba. Děti se učí vlastním tempem.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon-yellow">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
              </div>
              <h3>Přehled o pokroku</h3>
              <p>Sledujte, jak si vaši žáci vedou. Víte přesně, kdo potřebuje pomoct.</p>
            </div>

            <div className="feature-card">
              <div className="feature-icon feature-icon-teal">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3>Bezpečné prostředí</h3>
              <p>GDPR-friendly, bez reklam, bez sledování. Vaše data zůstávají v EU.</p>
            </div>
          </div>
        </section>

        <section className="audience-section">
          <div className="audience-card audience-teachers">
            <h3>Pro učitele</h3>
            <ul>
              <li>Vytvořte třídu během minuty</li>
              <li>Přiřaďte kurzy jedním klikem</li>
              <li>Sledujte pokrok každého žáka</li>
              <li>Materiály podle RVP</li>
            </ul>
            <Link to="/registrace" className="btn-secondary">Registrovat jako učitel</Link>
          </div>

          <div className="audience-card audience-students">
            <h3>Pro žáky</h3>
            <ul>
              <li>Piš kód přímo v prohlížeči</li>
              <li>Okamžitě vidíš výsledky</li>
              <li>Postupuj vlastním tempem</li>
              <li>Sbírej úspěchy</li>
            </ul>
            <Link to="/registrace" className="btn-secondary">Mám kód od učitele</Link>
          </div>
        </section>

        <section className="cta-section">
          <h2>Připraveni začít?</h2>
          <p>Přidejte se k učitelům, kteří už učí programování moderně.</p>
          <Link to="/registrace" className="btn-primary btn-large">
            Vytvořit účet zdarma
          </Link>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-content">
          <Logo />
          <p>Programování pro každé dítě</p>
        </div>
        <div className="footer-links">
          <a href="mailto:info@kodlab.cz">Kontakt</a>
        </div>
      </footer>
    </div>
  );
}
