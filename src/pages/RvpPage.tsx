import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCourses } from '../api/courses';
import type { CourseListItem } from '../api/courses';
import Logo from '../components/Logo';

// RVP Categories with Czech labels and descriptions
const RVP_CATEGORIES = [
  {
    id: 'DATA',
    title: 'Data, informace a modelování',
    description: 'Sběr, zaznamenávání a interpretace dat. Práce s různými typy dat a jejich reprezentace pomocí diagramů a schémat.',
    icon: '📊',
    color: '#3b82f6',
  },
  {
    id: 'ALGORITHMS',
    title: 'Algoritmizace a programování',
    description: 'Rozdělení problémů na kroky a tvorba programů. Testování, hledání chyb a využití vzorů jako cykly a procedury.',
    icon: '💻',
    color: '#10b981',
  },
  {
    id: 'SYSTEMS',
    title: 'Informační systémy',
    description: 'Fungování systémů, identifikace prvků a vztahů. Práce se strukturovanými daty v tabulkách, filtrování a třídění.',
    icon: '🗄️',
    color: '#f59e0b',
  },
  {
    id: 'DIGITAL_TECH',
    title: 'Digitální technologie',
    description: 'Hardware, software, počítačové sítě a bezpečnost. Správa souborů, řešení problémů a ochrana osobních dat.',
    icon: '🔧',
    color: '#8b5cf6',
  },
];

export default function RvpPage() {
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const isTeacher = user?.role === 'TEACHER';
  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    if (!isTeacher) {
      navigate('/');
      return;
    }
    loadCourses();
  }, [isTeacher, token]);

  const loadCourses = async () => {
    if (!token) return;
    try {
      const data = await getCourses(token);
      setCourses(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání');
    } finally {
      setIsLoading(false);
    }
  };

  const getCoursesByCategory = (categoryId: string) => {
    return courses.filter(course => course.rvpCategory === categoryId);
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <Logo />
        <nav className="header-nav">
          <Link to="/" className="nav-link">Domů</Link>
          {isTeacher && <Link to="/prehled" className="nav-link">Přehled</Link>}
          {isTeacher && <Link to="/rvp" className="nav-link active">RVP</Link>}
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

      <main className="home-content rvp-page">
        <div className="rvp-header">
          <h2>Rámcový vzdělávací program</h2>
          <p className="rvp-subtitle">
            Vzdělávací oblasti informatiky podle{' '}
            <a
              href="https://digitalizace.rvp.cz/co-se-meni/nova-informatika"
              target="_blank"
              rel="noopener noreferrer"
              className="rvp-link"
            >
              RVP pro základní vzdělávání
            </a>
          </p>
        </div>

        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <p>Načítání...</p>
        ) : (
          <div className="rvp-categories">
            {RVP_CATEGORIES.map(category => {
              const categoryCourses = getCoursesByCategory(category.id);
              return (
                <div
                  key={category.id}
                  className="rvp-category-card"
                  style={{ '--category-color': category.color } as React.CSSProperties}
                >
                  <div className="rvp-category-header">
                    <span className="rvp-category-icon">{category.icon}</span>
                    <h3>{category.title}</h3>
                  </div>
                  <p className="rvp-category-description">{category.description}</p>

                  <div className="rvp-category-courses">
                    {categoryCourses.length === 0 ? (
                      <p className="rvp-no-courses">
                        Zatím žádné kurzy v této kategorii.
                      </p>
                    ) : (
                      <ul className="rvp-course-list">
                        {categoryCourses.map(course => (
                          <li key={course.id}>
                            <Link to={`/kurzy/${course.id}`} className="rvp-course-item">
                              <span className="rvp-course-title">{course.title}</span>
                              <span className="rvp-course-lessons">
                                {course.totalLessons} lekcí
                              </span>
                            </Link>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        <div className="rvp-footer">
          <p>
            Pro přiřazení kurzu k oblasti RVP použijte administraci kurzů.
          </p>
        </div>
      </main>
    </div>
  );
}
