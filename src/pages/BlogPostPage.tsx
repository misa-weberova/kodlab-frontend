import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import ReactMarkdown from 'react-markdown';
import Logo from '../components/Logo';
import { getPostBySlug } from '../api/blog';
import type { BlogPost } from '../api/blog';

export default function BlogPostPage() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const [post, setPost] = useState<BlogPost | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (slug) {
      loadPost(slug);
    }
  }, [slug]);

  const loadPost = async (postSlug: string) => {
    setIsLoading(true);
    try {
      const data = await getPostBySlug(postSlug);
      if (!data) {
        setError('Článek nebyl nalezen');
      } else {
        setPost(data);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání článku');
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

  if (isLoading) {
    return (
      <div className="blog-page">
        <header className="landing-header">
          <Logo />
        </header>
        <main className="blog-main">
          <div className="blog-loading">Načítání článku...</div>
        </main>
      </div>
    );
  }

  if (error || !post) {
    return (
      <div className="blog-page">
        <header className="landing-header">
          <Logo />
          <nav className="landing-nav">
            <Link to="/blog" className="nav-text-link">Blog</Link>
            <Link to="/vitejte" className="nav-text-link">Domů</Link>
          </nav>
        </header>
        <main className="blog-main">
          <div className="blog-error">
            <h1>Článek nenalezen</h1>
            <p>{error || 'Požadovaný článek neexistuje.'}</p>
            <Link to="/blog" className="btn-primary">Zpět na blog</Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="blog-page">
      <header className="landing-header">
        <Logo />
        <nav className="landing-nav">
          <Link to="/blog" className="nav-text-link">Blog</Link>
          <Link to="/vitejte" className="nav-text-link">Domů</Link>
          <Link to="/prihlaseni" className="btn-secondary">Přihlásit se</Link>
        </nav>
      </header>

      <main className="blog-main">
        <article className="blog-article">
          <button onClick={() => navigate('/blog')} className="blog-back-link">
            ← Zpět na blog
          </button>

          <header className="blog-article-header">
            <h1>{post.title}</h1>
            <div className="blog-article-meta">
              <span className="blog-article-date">{formatDate(post.createdAt)}</span>
              {post.authorName && (
                <span className="blog-article-author">• {post.authorName}</span>
              )}
            </div>
          </header>

          <div className="blog-article-content">
            <ReactMarkdown>{post.content || ''}</ReactMarkdown>
          </div>
        </article>
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
