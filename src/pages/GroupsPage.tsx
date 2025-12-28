import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGroups, createGroup, deleteGroup } from '../api/groups';
import type { Group } from '../api/groups';
import Logo from '../components/Logo';

export default function GroupsPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [groups, setGroups] = useState<Group[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [newGroupName, setNewGroupName] = useState('');
  const [isCreating, setIsCreating] = useState(false);

  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    if (!isTeacher) {
      navigate('/');
      return;
    }
    loadGroups();
  }, [isTeacher, navigate, token]);

  const loadGroups = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const data = await getGroups(token);
      setGroups(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateGroup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token || !newGroupName.trim()) return;

    try {
      setIsCreating(true);
      setError('');
      await createGroup(token, newGroupName.trim());
      setNewGroupName('');
      await loadGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se vytvořit skupinu');
    } finally {
      setIsCreating(false);
    }
  };

  const handleDeleteGroup = async (groupId: number) => {
    if (!token) return;
    if (!confirm('Opravdu chcete smazat tuto skupinu?')) return;

    try {
      await deleteGroup(token, groupId);
      await loadGroups();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se smazat skupinu');
    }
  };

  return (
    <div className="groups-page">
      <header className="home-header">
        <Logo />
        <nav className="header-nav">
          <Link to="/" className="nav-link">Domů</Link>
          <Link to="/prehled" className="nav-link">Přehled</Link>
          <Link to="/skupiny" className="nav-link active">Skupiny</Link>
          <Link to="/kurzy" className="nav-link">Kurzy</Link>
        </nav>
        <div className="user-info">
          <span>Učitel</span>
          <button onClick={logout} className="btn-secondary">
            Odhlásit se
          </button>
        </div>
      </header>

      <main className="home-content">
        <h2>Skupiny žáků</h2>
        <p>Vytvořte skupiny (např. třídy) a přiřaďte do nich své žáky.</p>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleCreateGroup} className="create-group-form">
          <input
            type="text"
            value={newGroupName}
            onChange={(e) => setNewGroupName(e.target.value)}
            placeholder="Název nové skupiny (např. 6. třída)"
            className="form-input"
            disabled={isCreating}
          />
          <button type="submit" className="btn-primary" disabled={isCreating || !newGroupName.trim()}>
            {isCreating ? 'Vytvářím...' : 'Vytvořit skupinu'}
          </button>
        </form>

        {isLoading ? (
          <p>Načítání...</p>
        ) : groups.length === 0 ? (
          <div className="empty-state">
            <p>Zatím nemáte žádné skupiny.</p>
            <p>Vytvořte první skupinu pomocí formuláře výše.</p>
          </div>
        ) : (
          <div className="groups-list">
            {groups.map((group) => (
              <div key={group.id} className="group-card">
                <Link to={`/skupiny/${group.id}`} className="group-card-link">
                  <h3>{group.name}</h3>
                  <p className="group-student-count">
                    {group.studentCount} {group.studentCount === 1 ? 'žák' : group.studentCount >= 2 && group.studentCount <= 4 ? 'žáci' : 'žáků'}
                  </p>
                </Link>
                <button
                  onClick={() => handleDeleteGroup(group.id)}
                  className="btn-danger btn-small"
                  title="Smazat skupinu"
                >
                  Smazat
                </button>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
