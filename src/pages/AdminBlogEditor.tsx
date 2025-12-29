import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { getPostById, createPost, updatePost } from '../api/blog';

export default function AdminBlogEditor() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { token, logout } = useAuth();
  const isNew = id === 'new';

  const [isLoading, setIsLoading] = useState(!isNew);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [excerpt, setExcerpt] = useState('');
  const [status, setStatus] = useState('DRAFT');

  useEffect(() => {
    if (!isNew && token && id) {
      loadPost(parseInt(id));
    }
  }, [id, token, isNew]);

  const loadPost = async (postId: number) => {
    if (!token) return;
    setIsLoading(true);
    try {
      const post = await getPostById(token, postId);
      setTitle(post.title);
      setSlug(post.slug);
      setContent(post.content || '');
      setExcerpt(post.excerpt || '');
      setStatus(post.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání článku');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    if (!token) return;
    if (!title.trim()) {
      setError('Název je povinný');
      return;
    }

    setIsSaving(true);
    setError('');
    setSuccess('');

    try {
      if (isNew) {
        const newPost = await createPost(token, {
          title: title.trim(),
          content: content.trim() || undefined,
          excerpt: excerpt.trim() || undefined,
        });
        setSuccess('Článek byl vytvořen');
        navigate(`/admin/blog/${newPost.id}`);
      } else {
        await updatePost(token, parseInt(id!), {
          title: title.trim(),
          slug: slug.trim(),
          content: content.trim(),
          excerpt: excerpt.trim(),
          status,
        });
        setSuccess('Změny byly uloženy');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při ukládání');
    } finally {
      setIsSaving(false);
    }
  };

  const handlePublish = async () => {
    if (!token || isNew) return;

    setIsSaving(true);
    setError('');

    try {
      await updatePost(token, parseInt(id!), { status: 'PUBLISHED' });
      setStatus('PUBLISHED');
      setSuccess('Článek byl publikován');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při publikování');
    } finally {
      setIsSaving(false);
    }
  };

  const handleUnpublish = async () => {
    if (!token || isNew) return;

    setIsSaving(true);
    setError('');

    try {
      await updatePost(token, parseInt(id!), { status: 'DRAFT' });
      setStatus('DRAFT');
      setSuccess('Článek byl vrácen do konceptů');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="home-page">
        <header className="home-header">
          <Logo />
        </header>
        <main className="home-content">
          <p>Načítání...</p>
        </main>
      </div>
    );
  }

  return (
    <div className="home-page">
      <header className="home-header">
        <Logo />
        <nav className="header-nav">
          <Link to="/" className="nav-link">Domů</Link>
          <Link to="/admin" className="nav-link">Kurzy</Link>
          <Link to="/admin/blog" className="nav-link active">Blog</Link>
        </nav>
        <div className="user-info">
          <span>Admin</span>
          <button onClick={logout} className="btn-secondary">Odhlásit se</button>
        </div>
      </header>

      <main className="admin-main">
        <div className="admin-header-row">
          <div>
            <Link to="/admin/blog" className="back-link">← Zpět na seznam</Link>
            <h1>{isNew ? 'Nový článek' : 'Upravit článek'}</h1>
          </div>
          <div className="admin-actions-row">
            {!isNew && status === 'DRAFT' && (
              <button
                onClick={handlePublish}
                disabled={isSaving}
                className="btn-success"
              >
                Publikovat
              </button>
            )}
            {!isNew && status === 'PUBLISHED' && (
              <button
                onClick={handleUnpublish}
                disabled={isSaving}
                className="btn-secondary"
              >
                Vrátit do konceptů
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={isSaving}
              className="btn-primary"
            >
              {isSaving ? 'Ukládání...' : 'Uložit'}
            </button>
          </div>
        </div>

        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}

        <div className="blog-editor">
          <div className="blog-editor-main">
            <div className="form-group">
              <label htmlFor="title">Název článku</label>
              <input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Jak naučit děti programovat"
                className="form-input"
              />
            </div>

            {!isNew && (
              <div className="form-group">
                <label htmlFor="slug">URL slug</label>
                <input
                  id="slug"
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="jak-naucit-deti-programovat"
                  className="form-input"
                />
                <small className="form-hint">Adresa článku: /blog/{slug || '...'}</small>
              </div>
            )}

            <div className="form-group">
              <label htmlFor="excerpt">Krátký popis (excerpt)</label>
              <textarea
                id="excerpt"
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                placeholder="Stručný popis článku pro náhled v seznamu..."
                className="form-textarea"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label htmlFor="content">Obsah článku (Markdown)</label>
              <textarea
                id="content"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="# Nadpis&#10;&#10;Text článku...&#10;&#10;## Podnadpis&#10;&#10;- Odrážka 1&#10;- Odrážka 2"
                className="form-textarea form-textarea-large"
                rows={20}
              />
              <small className="form-hint">
                Podporuje Markdown formátování: # nadpisy, **tučné**, *kurzíva*, - seznamy, atd.
              </small>
            </div>
          </div>

          <div className="blog-editor-sidebar">
            <div className="sidebar-card">
              <h3>Stav</h3>
              <p className={`status-badge status-${status.toLowerCase()}`}>
                {status === 'PUBLISHED' ? 'Publikováno' : 'Koncept'}
              </p>
              {status === 'PUBLISHED' && slug && (
                <a
                  href={`/blog/${slug}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary btn-small btn-full"
                  style={{ marginTop: '0.5rem' }}
                >
                  Zobrazit článek
                </a>
              )}
            </div>

            <div className="sidebar-card">
              <h3>Nápověda</h3>
              <ul className="help-list">
                <li><code># Nadpis</code> - hlavní nadpis</li>
                <li><code>## Podnadpis</code> - sekce</li>
                <li><code>**tučné**</code> - tučný text</li>
                <li><code>*kurzíva*</code> - kurzíva</li>
                <li><code>- položka</code> - seznam</li>
                <li><code>[text](url)</code> - odkaz</li>
              </ul>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
