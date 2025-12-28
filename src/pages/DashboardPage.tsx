import { useState, useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGroups } from '../api/groups';
import { getDashboardOverview } from '../api/courses';
import type { Group } from '../api/groups';
import type { DashboardOverview } from '../api/courses';
import Logo from '../components/Logo';
import { getAvatarEmoji } from '../components/AvatarPicker';

export default function DashboardPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const [groups, setGroups] = useState<Group[]>([]);
  const [selectedGroupId, setSelectedGroupId] = useState<number | null>(null);
  const [dashboard, setDashboard] = useState<DashboardOverview | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const isTeacher = user?.role === 'TEACHER';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isTeacher) {
      navigate('/');
      return;
    }
    loadGroups();
  }, [isTeacher, token]);

  useEffect(() => {
    const groupIdParam = searchParams.get('group');
    if (groupIdParam) {
      setSelectedGroupId(parseInt(groupIdParam));
    } else if (groups.length > 0 && !selectedGroupId) {
      setSelectedGroupId(groups[0].id);
    }
  }, [groups, searchParams]);

  useEffect(() => {
    if (selectedGroupId && token) {
      loadDashboard(selectedGroupId);
    }
  }, [selectedGroupId, token]);

  const loadGroups = async () => {
    if (!token) return;
    try {
      const data = await getGroups(token);
      setGroups(data);
      if (data.length === 0) {
        setIsLoading(false);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba');
      setIsLoading(false);
    }
  };

  const loadDashboard = async (groupId: number) => {
    if (!token) return;
    setIsLoading(true);
    setError('');
    try {
      const data = await getDashboardOverview(token, groupId);
      setDashboard(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba');
    } finally {
      setIsLoading(false);
    }
  };

  const handleGroupChange = (groupId: number) => {
    setSelectedGroupId(groupId);
    setSearchParams({ group: groupId.toString() });
  };

  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'Nikdy';
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Dnes';
    if (diffDays === 1) return 'Včera';
    if (diffDays < 7) return `Před ${diffDays} dny`;
    return date.toLocaleDateString('cs-CZ');
  };

  const getScoreClass = (score: number): string => {
    if (score >= 80) return 'score-good';
    if (score >= 50) return 'score-medium';
    return 'score-low';
  };

  const getExerciseTypeLabel = (type: string): string => {
    switch (type) {
      case 'CODE': return 'Kód';
      case 'MATCHING': return 'Spojování';
      case 'GAPFILL': return 'Doplňování';
      case 'CROSSWORD': return 'Křížovka';
      case 'SORTING': return 'Řazení';
      case 'CATEGORY': return 'Třídění';
      default: return type;
    }
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <Logo />
        <nav className="header-nav">
          <Link to="/" className="nav-link">Domů</Link>
          {isTeacher && <Link to="/prehled" className="nav-link active">Přehled</Link>}
          {isTeacher && <Link to="/skupiny" className="nav-link">Skupiny</Link>}
          {isTeacher && <Link to="/kurzy" className="nav-link">Kurzy</Link>}
          {isAdmin && <Link to="/admin" className="nav-link">Admin</Link>}
        </nav>
        <div className="user-info">
          <span>Učitel</span>
          <button onClick={logout} className="btn-secondary">
            Odhlásit se
          </button>
        </div>
      </header>

      <main className="home-content dashboard-page">
        <div className="dashboard-header">
          <h2>Přehled třídy</h2>
          {groups.length > 0 && (
            <select
              value={selectedGroupId || ''}
              onChange={(e) => handleGroupChange(parseInt(e.target.value))}
              className="group-selector"
            >
              {groups.map(g => (
                <option key={g.id} value={g.id}>{g.name}</option>
              ))}
            </select>
          )}
        </div>

        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <p>Načítání...</p>
        ) : groups.length === 0 ? (
          <div className="empty-state">
            <p>Nemáte žádné skupiny.</p>
            <Link to="/skupiny" className="btn-primary">Vytvořit skupinu</Link>
          </div>
        ) : dashboard ? (
          <>
            {/* Overview Stats */}
            <div className="dashboard-stats-grid">
              <div className="stat-card">
                <div className="stat-value">{dashboard.studentCount}</div>
                <div className="stat-label">Žáků</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{dashboard.totalExercises}</div>
                <div className="stat-label">Cvičení</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{dashboard.groupAverageScore.toFixed(0)}%</div>
                <div className="stat-label">Průměrné skóre</div>
              </div>
              <div className="stat-card">
                <div className="stat-value">{dashboard.groupCompletionRate.toFixed(0)}%</div>
                <div className="stat-label">Dokončeno</div>
              </div>
            </div>

            {/* Students Progress Table */}
            <section className="dashboard-section">
              <h3>Pokrok žáků</h3>
              {dashboard.students.length === 0 ? (
                <p className="empty-hint">V této skupině nejsou žádní žáci.</p>
              ) : (
                <div className="students-progress-table">
                  <table>
                    <thead>
                      <tr>
                        <th>Žák</th>
                        <th>Dokončeno</th>
                        <th>Skóre</th>
                        <th>Poslední aktivita</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {dashboard.students.map(student => (
                        <tr key={student.studentId}>
                          <td className="student-cell">
                            <span className="student-avatar">
                              {getAvatarEmoji(student.studentAvatar)}
                            </span>
                            <span className="student-email">{student.studentEmail}</span>
                          </td>
                          <td>
                            <div className="dashboard-progress-bar">
                              <div
                                className="fill"
                                style={{ width: `${student.completionPercent}%` }}
                              />
                              <span className="text">
                                {student.completedExercises}/{student.totalExercises}
                              </span>
                            </div>
                          </td>
                          <td>
                            <span className={`score-badge ${getScoreClass(student.overallScorePercent)}`}>
                              {student.overallScorePercent.toFixed(0)}%
                            </span>
                          </td>
                          <td className="date-cell">{formatDate(student.lastActivity)}</td>
                          <td>
                            <Link
                              to={`/prehled/zak/${student.studentId}`}
                              className="btn-small"
                            >
                              Detail
                            </Link>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>

            {/* Hardest Exercises */}
            {dashboard.hardestExercises.length > 0 && (
              <section className="dashboard-section">
                <h3>Nejtěžší cvičení</h3>
                <p className="section-hint">Cvičení s nejnižším průměrným skóre</p>
                <div className="hardest-exercises-list">
                  {dashboard.hardestExercises.slice(0, 5).map(ex => (
                    <div key={ex.exerciseId} className="hardest-exercise-item">
                      <div className="exercise-info">
                        <span className="exercise-type-badge">{getExerciseTypeLabel(ex.exerciseType)}</span>
                        <span className="exercise-title">{ex.exerciseTitle}</span>
                        <span className="exercise-location">
                          {ex.chapterTitle} / {ex.lessonTitle}
                        </span>
                      </div>
                      <div className="exercise-stats">
                        <span className={`score-badge ${getScoreClass(ex.averageScore)}`}>
                          {ex.averageScore.toFixed(0)}%
                        </span>
                        <span className="completion-info">
                          {ex.completionCount}/{ex.totalStudents} žáků
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </>
        ) : null}
      </main>
    </div>
  );
}
