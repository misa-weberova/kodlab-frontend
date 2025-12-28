import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getCourses, getAssignedGroups, assignCourseToGroup, unassignCourseFromGroup } from '../api/courses';
import { getGroups } from '../api/groups';
import type { CourseListItem } from '../api/courses';
import type { Group } from '../api/groups';
import Logo from '../components/Logo';
import ProgressBar from '../components/ProgressBar';

export default function CoursesPage() {
  const { user, token, logout } = useAuth();
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [groups, setGroups] = useState<Group[]>([]);
  const [assignedGroups, setAssignedGroups] = useState<Map<number, number[]>>(new Map());
  const [expandedCourse, setExpandedCourse] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    if (token) {
      loadData();
    }
  }, [token]);

  const loadData = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const coursesData = await getCourses(token);
      setCourses(coursesData);

      if (isTeacher) {
        const groupsData = await getGroups(token);
        setGroups(groupsData);

        const assignedMap = new Map<number, number[]>();
        for (const course of coursesData) {
          const groupIds = await getAssignedGroups(token, course.id);
          assignedMap.set(course.id, groupIds);
        }
        setAssignedGroups(assignedMap);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleGroup = async (courseId: number, groupId: number) => {
    if (!token) return;
    try {
      const currentGroups = assignedGroups.get(courseId) || [];
      if (currentGroups.includes(groupId)) {
        await unassignCourseFromGroup(token, courseId, groupId);
        setAssignedGroups(prev => {
          const newMap = new Map(prev);
          newMap.set(courseId, currentGroups.filter(id => id !== groupId));
          return newMap;
        });
      } else {
        await assignCourseToGroup(token, courseId, groupId);
        setAssignedGroups(prev => {
          const newMap = new Map(prev);
          newMap.set(courseId, [...currentGroups, groupId]);
          return newMap;
        });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při přiřazování');
    }
  };

  const getAssignedCount = (courseId: number) => {
    return assignedGroups.get(courseId)?.length || 0;
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <Logo />
        <nav className="header-nav">
          <Link to="/" className="nav-link">Domů</Link>
          {isTeacher && <Link to="/prehled" className="nav-link">Přehled</Link>}
          {isTeacher && <Link to="/skupiny" className="nav-link">Skupiny</Link>}
          <Link to="/kurzy" className="nav-link active">Kurzy</Link>
        </nav>
        <div className="user-info">
          <span>{isTeacher ? 'Učitel' : 'Žák'}</span>
          <button onClick={logout} className="btn-secondary">
            Odhlásit se
          </button>
        </div>
      </header>

      <main className="home-content">
        <h2>Kurzy</h2>
        <p>
          {isTeacher
            ? 'Přiřaďte kurzy skupinám kliknutím na tlačítko "Přiřadit skupinám".'
            : 'Zde najdete kurzy přiřazené vaší skupině.'}
        </p>

        {error && <div className="error-message">{error}</div>}

        {isLoading ? (
          <p>Načítání...</p>
        ) : courses.length === 0 ? (
          <div className="empty-state">
            <p>Žádné kurzy k zobrazení.</p>
            {!isTeacher && <p>Váš učitel vám zatím nepřiřadil žádné kurzy.</p>}
          </div>
        ) : (
          <div className="course-list">
            {courses.map((course) => (
              <div key={course.id} className="course-card">
                <div className="course-card-header">
                  <h3>{course.title}</h3>
                  {isTeacher && (
                    <button
                      className={`assign-btn ${getAssignedCount(course.id) > 0 ? 'assigned' : 'unassigned'}`}
                      onClick={() => setExpandedCourse(expandedCourse === course.id ? null : course.id)}
                    >
                      {getAssignedCount(course.id) > 0
                        ? `Přiřazeno (${getAssignedCount(course.id)})`
                        : 'Přiřadit skupinám'}
                    </button>
                  )}
                </div>
                {course.description && <p>{course.description}</p>}

                {isTeacher && expandedCourse === course.id && (
                  <div className="group-assignment-panel">
                    {groups.length === 0 ? (
                      <p className="no-groups-hint">
                        Nejprve vytvořte skupiny v sekci <Link to="/skupiny">Skupiny</Link>.
                      </p>
                    ) : (
                      <div className="group-checkboxes">
                        {groups.map((group) => (
                          <label key={group.id} className="group-checkbox-label">
                            <input
                              type="checkbox"
                              checked={(assignedGroups.get(course.id) || []).includes(group.id)}
                              onChange={() => handleToggleGroup(course.id, group.id)}
                            />
                            <span>{group.name}</span>
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="course-card-footer">
                  {!isTeacher && (
                    <ProgressBar
                      completed={course.completedLessons}
                      total={course.totalLessons}
                    />
                  )}
                  {isTeacher && (
                    <span className="lesson-count">{course.totalLessons} lekcí</span>
                  )}
                  <div className="course-actions">
                    <Link to={`/kurzy/${course.id}`} className="btn-secondary">
                      Zobrazit
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
