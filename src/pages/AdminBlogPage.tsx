import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Logo from '../components/Logo';
import { getAllPosts, deletePost } from '../api/blog';
import type { BlogPost } from '../api/blog';

export default function AdminBlogPage() {
  const { token, logout } = useAuth();
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (token) {
      loadPosts();
    }
  }, [token]);

  const loadPosts = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const data = await getAllPosts(token);
      setPosts(data);
      setError('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání článků');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: number, title: string) => {
    if (!token) return;
    if (!confirm(`Opravdu chcete smazat článek "${title}"?`)) return;

    try {
      await deletePost(token, id);
      await loadPosts();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při mazání článku');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

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
          <h1>Správa blogu</h1>
          <Link to="/admin/blog/new" className="btn-primary">+ Nový článek</Link>
        </div>

        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <p>Načítání...</p>
        ) : posts.length === 0 ? (
          <div className="admin-empty">
            <p>Zatím nemáte žádné články.</p>
            <Link to="/admin/blog/new" className="btn-primary">Vytvořit první článek</Link>
          </div>
        ) : (
          <div className="admin-blog-list">
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Název</th>
                  <th>Stav</th>
                  <th>Vytvořeno</th>
                  <th>Akce</th>
                </tr>
              </thead>
              <tbody>
                {posts.map((post) => (
                  <tr key={post.id}>
                    <td>
                      <Link to={`/admin/blog/${post.id}`} className="admin-blog-title">
                        {post.title}
                      </Link>
                      <div className="admin-blog-slug">/blog/{post.slug}</div>
                    </td>
                    <td>
                      <span className={`status-badge status-${post.status.toLowerCase()}`}>
                        {post.status === 'PUBLISHED' ? 'Publikováno' : 'Koncept'}
                      </span>
                    </td>
                    <td>{formatDate(post.createdAt)}</td>
                    <td className="admin-actions">
                      <Link to={`/admin/blog/${post.id}`} className="btn-small btn-secondary">
                        Upravit
                      </Link>
                      {post.status === 'PUBLISHED' && (
                        <Link
                          to={`/blog/${post.slug}`}
                          target="_blank"
                          className="btn-small btn-secondary"
                        >
                          Zobrazit
                        </Link>
                      )}
                      <button
                        onClick={() => handleDelete(post.id, post.title)}
                        className="btn-small btn-danger"
                      >
                        Smazat
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </main>
    </div>
  );
}
