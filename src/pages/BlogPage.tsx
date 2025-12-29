import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Logo from '../components/Logo';
import { getPublishedPosts } from '../api/blog';
import type { BlogPost } from '../api/blog';

export default function BlogPage() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadPosts();
  }, []);

  const loadPosts = async () => {
    setIsLoading(true);
    try {
      const data = await getPublishedPosts();
      setPosts(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání článků');
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  };

  return (
    <div className="blog-page">
      <header className="landing-header">
        <Logo />
        <nav className="landing-nav">
          <Link to="/vitejte" className="nav-text-link">Domů</Link>
          <Link to="/prihlaseni" className="btn-secondary">Přihlásit se</Link>
          <Link to="/registrace" className="btn-primary landing-cta-small">Vyzkoušet zdarma</Link>
        </nav>
      </header>

      <main className="blog-main">
        <div className="blog-hero">
          <h1>Blog</h1>
          <p>Novinky, tipy a inspirace pro výuku programování</p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <div className="blog-loading">Načítání článků...</div>
        ) : posts.length === 0 ? (
          <div className="blog-empty">
            <p>Zatím zde nejsou žádné články.</p>
            <Link to="/vitejte" className="btn-primary">Zpět na hlavní stránku</Link>
          </div>
        ) : (
          <div className="blog-grid">
            {posts.map((post) => (
              <article key={post.id} className="blog-card">
                <div className="blog-card-content">
                  <div className="blog-card-meta">
                    <span className="blog-card-date">{formatDate(post.createdAt)}</span>
                    {post.authorName && (
                      <span className="blog-card-author">• {post.authorName}</span>
                    )}
                  </div>
                  <h2 className="blog-card-title">
                    <Link to={`/blog/${post.slug}`}>{post.title}</Link>
                  </h2>
                  {post.excerpt && (
                    <p className="blog-card-excerpt">{post.excerpt}</p>
                  )}
                  <Link to={`/blog/${post.slug}`} className="blog-card-link">
                    Číst dál →
                  </Link>
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      <footer className="landing-footer">
        <div className="footer-content">
          <Logo />
          <p>Programování pro každé dítě</p>
        </div>
        <div className="footer-links">
          <a href="mailto:info@kodlab.cz">Kontakt</a>
          <Link to="/vitejte">Domů</Link>
          <Link to="/blog">Blog</Link>
        </div>
        <div className="footer-legal">
          <p>© 2025 KodLab. Všechna práva vyhrazena.</p>
        </div>
      </footer>
    </div>
  );
}
