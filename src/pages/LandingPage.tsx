import { useState } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import FloatingShapes from '../components/FloatingShapes';

export default function LandingPage() {
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  const toggleFaq = (index: number) => {
    setActiveFaq(activeFaq === index ? null : index);
  };

  return (
    <div className="landing-page">
      <FloatingShapes />

      <header className="landing-header">
        <Logo />
        <nav className="landing-nav">
          <a href="#jak-to-funguje" className="nav-text-link">Jak to funguje</a>
          <a href="#cenik" className="nav-text-link">Ceník</a>
          <Link to="/prihlaseni" className="btn-secondary">Přihlásit se</Link>
          <Link to="/registrace" className="btn-primary landing-cta-small">Vyzkoušet zdarma</Link>
        </nav>
      </header>

      <main className="landing-main">
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">Nové: Interaktivní cvičení a křížovky</div>
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
              <a href="#ukazka" className="btn-secondary btn-large">
                Zobrazit ukázku
              </a>
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

        {/* Social Proof - Stats */}
        <section className="stats-section">
          <div className="stats-grid">
            <div className="stat-item">
              <span className="stat-number">500+</span>
              <span className="stat-label">aktivních žáků</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">25+</span>
              <span className="stat-label">škol v ČR</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">6</span>
              <span className="stat-label">typů cvičení</span>
            </div>
            <div className="stat-item">
              <span className="stat-number">100%</span>
              <span className="stat-label">v češtině</span>
            </div>
          </div>
        </section>

        {/* Demo Preview Section */}
        <section id="ukazka" className="demo-section">
          <h2 className="section-title">Podívejte se, jak to vypadá</h2>
          <p className="section-subtitle">Interaktivní cvičení, která děti baví</p>

          <div className="demo-grid">
            <div className="demo-card">
              <div className="demo-card-icon demo-icon-code">{'</>'}</div>
              <h3>Psaní kódu</h3>
              <p>Děti píší skutečný Python kód a okamžitě vidí výsledky. Bezpečné prostředí bez instalace.</p>
            </div>
            <div className="demo-card">
              <div className="demo-card-icon demo-icon-match">↔</div>
              <h3>Spojování párů</h3>
              <p>Propojte příkazy s jejich významy. Ideální pro učení syntaxe a pojmů.</p>
            </div>
            <div className="demo-card">
              <div className="demo-card-icon demo-icon-fill">___</div>
              <h3>Doplňování</h3>
              <p>Doplňte chybějící slova do vět. Upevňuje porozumění konceptům.</p>
            </div>
            <div className="demo-card">
              <div className="demo-card-icon demo-icon-crossword">#</div>
              <h3>Křížovky</h3>
              <p>Programátorské křížovky s nápovědami. Zábavný způsob učení terminologie.</p>
            </div>
            <div className="demo-card">
              <div className="demo-card-icon demo-icon-sort">↕</div>
              <h3>Řazení</h3>
              <p>Seřaďte kroky algoritmu nebo jednotky. Rozvíjí logické myšlení.</p>
            </div>
            <div className="demo-card">
              <div className="demo-card-icon demo-icon-category">◫</div>
              <h3>Třídění</h3>
              <p>Roztřiďte pojmy do kategorií. Učí klasifikaci a porozumění.</p>
            </div>
          </div>
        </section>

        {/* How it Works */}
        <section id="jak-to-funguje" className="how-it-works-section">
          <h2 className="section-title">Jak to funguje?</h2>
          <p className="section-subtitle">Začněte učit za 3 minuty</p>

          <div className="steps-container">
            <div className="step">
              <div className="step-number">1</div>
              <div className="step-content">
                <h3>Vytvořte účet</h3>
                <p>Registrace trvá 30 sekund. Zadejte email a název školy.</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step">
              <div className="step-number">2</div>
              <div className="step-content">
                <h3>Přidejte žáky</h3>
                <p>Sdílejte kód školy – žáci se připojí sami. Žádné složité nastavování.</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step">
              <div className="step-number">3</div>
              <div className="step-content">
                <h3>Přiřaďte kurzy</h3>
                <p>Vyberte hotové kurzy a přiřaďte je třídám. Žáci mohou začít okamžitě.</p>
              </div>
            </div>
            <div className="step-connector"></div>
            <div className="step">
              <div className="step-number">4</div>
              <div className="step-content">
                <h3>Sledujte pokrok</h3>
                <p>Přehledné statistiky pro každého žáka. Víte, kdo potřebuje pomoct.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
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

        {/* Testimonials */}
        <section className="testimonials-section">
          <h2 className="section-title">Co říkají učitelé</h2>
          <div className="testimonials-grid">
            <div className="testimonial-card">
              <div className="testimonial-quote">
                "Konečně materiály, které nemusím překládat. Děti to baví a já mám přehled, kdo co umí."
              </div>
              <div className="testimonial-author">
                <div className="testimonial-avatar">MK</div>
                <div className="testimonial-info">
                  <strong>Mgr. Marie Kovářová</strong>
                  <span>ZŠ Šumperk</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">
                "Skvělé pro kroužek informatiky. Žáci pracují samostatně a já se můžu věnovat těm, kdo potřebují pomoct."
              </div>
              <div className="testimonial-author">
                <div className="testimonial-avatar">PN</div>
                <div className="testimonial-info">
                  <strong>Ing. Petr Novák</strong>
                  <span>ZŠ Hradec Králové</span>
                </div>
              </div>
            </div>
            <div className="testimonial-card">
              <div className="testimonial-quote">
                "Interaktivní cvičení jsou super. Křížovky a spojování jsou hit – děti ani nepoznají, že se učí."
              </div>
              <div className="testimonial-author">
                <div className="testimonial-avatar">LS</div>
                <div className="testimonial-info">
                  <strong>Bc. Lucie Svobodová</strong>
                  <span>ZŠ Brno-Židenice</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="cenik" className="pricing-section">
          <h2 className="section-title">Jednoduchý ceník</h2>
          <p className="section-subtitle">Bez skrytých poplatků. Zrušte kdykoliv.</p>

          <div className="pricing-grid">
            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Zdarma</h3>
                <div className="pricing-price">
                  <span className="price-amount">0 Kč</span>
                  <span className="price-period">navždy</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>Až 30 žáků</li>
                <li>1 učitelský účet</li>
                <li>Základní kurzy</li>
                <li>Sledování pokroku</li>
                <li>Email podpora</li>
              </ul>
              <Link to="/registrace" className="btn-secondary btn-full">Začít zdarma</Link>
            </div>

            <div className="pricing-card pricing-featured">
              <div className="pricing-badge">Nejoblíbenější</div>
              <div className="pricing-header">
                <h3>Škola</h3>
                <div className="pricing-price">
                  <span className="price-amount">990 Kč</span>
                  <span className="price-period">/ měsíc</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>Neomezený počet žáků</li>
                <li>Až 10 učitelů</li>
                <li>Všechny kurzy</li>
                <li>Vlastní kurzy</li>
                <li>Export dat</li>
                <li>Prioritní podpora</li>
              </ul>
              <Link to="/registrace" className="btn-primary btn-full">Vyzkoušet 14 dní zdarma</Link>
            </div>

            <div className="pricing-card">
              <div className="pricing-header">
                <h3>Licence</h3>
                <div className="pricing-price">
                  <span className="price-amount">Na míru</span>
                  <span className="price-period">&nbsp;</span>
                </div>
              </div>
              <ul className="pricing-features">
                <li>White-label řešení</li>
                <li>Více škol / zřizovatelů</li>
                <li>Vlastní doména</li>
                <li>API přístup</li>
                <li>SLA garance</li>
                <li>Dedikovaná podpora</li>
              </ul>
              <a href="mailto:info@kodlab.cz" className="btn-secondary btn-full">Kontaktujte nás</a>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="faq-section">
          <h2 className="section-title">Časté dotazy</h2>
          <div className="faq-list">
            <div className={`faq-item ${activeFaq === 0 ? 'active' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(0)}>
                <span>Je KodLab vhodný pro začátečníky?</span>
                <span className="faq-icon">{activeFaq === 0 ? '−' : '+'}</span>
              </button>
              {activeFaq === 0 && (
                <div className="faq-answer">
                  Ano! KodLab je navržen pro žáky, kteří s programováním teprve začínají.
                  Kurzy postupují od úplných základů a používají vizuální příklady i hry.
                </div>
              )}
            </div>
            <div className={`faq-item ${activeFaq === 1 ? 'active' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(1)}>
                <span>Musí si žáci něco instalovat?</span>
                <span className="faq-icon">{activeFaq === 1 ? '−' : '+'}</span>
              </button>
              {activeFaq === 1 && (
                <div className="faq-answer">
                  Ne, vše běží v prohlížeči. Žáci potřebují pouze počítač nebo tablet s přístupem k internetu.
                  Žádná instalace, žádné problémy s kompatibilitou.
                </div>
              )}
            </div>
            <div className={`faq-item ${activeFaq === 2 ? 'active' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(2)}>
                <span>Jak se žáci připojí k mé třídě?</span>
                <span className="faq-icon">{activeFaq === 2 ? '−' : '+'}</span>
              </button>
              {activeFaq === 2 && (
                <div className="faq-answer">
                  Každá škola dostane unikátní kód. Žáci tento kód zadají při registraci a automaticky
                  se přiřadí k vaší škole. Pak je můžete přidat do skupin/tříd.
                </div>
              )}
            </div>
            <div className={`faq-item ${activeFaq === 3 ? 'active' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(3)}>
                <span>Odpovídají kurzy RVP?</span>
                <span className="faq-icon">{activeFaq === 3 ? '−' : '+'}</span>
              </button>
              {activeFaq === 3 && (
                <div className="faq-answer">
                  Ano, naše kurzy jsou připraveny v souladu s RVP pro základní vzdělávání,
                  konkrétně s oblastí Informatika. Pokrývají algoritmizaci, programování i digitální gramotnost.
                </div>
              )}
            </div>
            <div className={`faq-item ${activeFaq === 4 ? 'active' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(4)}>
                <span>Můžu si vytvořit vlastní kurzy?</span>
                <span className="faq-icon">{activeFaq === 4 ? '−' : '+'}</span>
              </button>
              {activeFaq === 4 && (
                <div className="faq-answer">
                  V tarifu Škola a vyšších ano. Můžete vytvářet vlastní lekce, přidávat různé typy cvičení
                  a přizpůsobit obsah potřebám vaší třídy.
                </div>
              )}
            </div>
            <div className={`faq-item ${activeFaq === 5 ? 'active' : ''}`}>
              <button className="faq-question" onClick={() => toggleFaq(5)}>
                <span>Jak je to s GDPR a daty žáků?</span>
                <span className="faq-icon">{activeFaq === 5 ? '−' : '+'}</span>
              </button>
              {activeFaq === 5 && (
                <div className="faq-answer">
                  KodLab je plně v souladu s GDPR. Data jsou uložena na serverech v EU, nesbíráme žádná
                  nepotřebná data a žáci mohou používat přezdívky místo skutečných jmen.
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Audience Section */}
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

        {/* Final CTA Section */}
        <section className="cta-section">
          <h2>Připraveni začít?</h2>
          <p>Přidejte se k učitelům, kteří už učí programování moderně.</p>
          <Link to="/registrace" className="btn-primary btn-large">
            Vytvořit účet zdarma
          </Link>
          <p className="cta-note">Žádná kreditka • Hotovo za 30 sekund • Zrušte kdykoliv</p>
        </section>

        {/* Trust Badges */}
        <section className="trust-section">
          <div className="trust-badges">
            <div className="trust-badge">
              <span className="trust-icon">🇨🇿</span>
              <span>Vytvořeno v ČR</span>
            </div>
            <div className="trust-badge">
              <span className="trust-icon">🔒</span>
              <span>GDPR ready</span>
            </div>
            <div className="trust-badge">
              <span className="trust-icon">🇪🇺</span>
              <span>Data v EU</span>
            </div>
            <div className="trust-badge">
              <span className="trust-icon">📚</span>
              <span>Podle RVP</span>
            </div>
          </div>
        </section>
      </main>

      <footer className="landing-footer">
        <div className="footer-content">
          <Logo />
          <p>Programování pro každé dítě</p>
        </div>
        <div className="footer-links">
          <a href="mailto:info@kodlab.cz">Kontakt</a>
          <a href="#cenik">Ceník</a>
          <a href="#jak-to-funguje">Jak to funguje</a>
        </div>
        <div className="footer-legal">
          <p>© 2025 KodLab. Všechna práva vyhrazena.</p>
        </div>
      </footer>
    </div>
  );
}
