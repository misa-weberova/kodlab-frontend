import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { getGroups, getGroupStudents, getUnassignedStudents, assignStudentToGroup, removeStudentFromGroup } from '../api/groups';
import { getCourses, getAssignedGroups, assignCourseToGroup, unassignCourseFromGroup } from '../api/courses';
import type { Group, StudentInGroup } from '../api/groups';
import type { CourseListItem } from '../api/courses';
import Logo from '../components/Logo';

export default function GroupDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user, token, logout } = useAuth();
  const navigate = useNavigate();
  const groupId = Number(id);

  const [group, setGroup] = useState<Group | null>(null);
  const [students, setStudents] = useState<StudentInGroup[]>([]);
  const [unassignedStudents, setUnassignedStudents] = useState<StudentInGroup[]>([]);
  const [courses, setCourses] = useState<CourseListItem[]>([]);
  const [assignedCourseIds, setAssignedCourseIds] = useState<Set<number>>(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState<'students' | 'courses'>('students');

  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    if (!isTeacher) {
      navigate('/');
      return;
    }
    loadData();
  }, [isTeacher, navigate, token, groupId]);

  const loadData = async () => {
    if (!token) return;
    try {
      setIsLoading(true);
      const [groupsData, studentsData, unassignedData, coursesData] = await Promise.all([
        getGroups(token),
        getGroupStudents(token, groupId),
        getUnassignedStudents(token),
        getCourses(token),
      ]);

      const currentGroup = groupsData.find(g => g.id === groupId);
      if (!currentGroup) {
        setError('Skupina nenalezena');
        return;
      }
      setGroup(currentGroup);
      setStudents(studentsData);
      setUnassignedStudents(unassignedData);
      setCourses(coursesData);

      // Load assigned courses for this group
      const assignedIds = new Set<number>();
      for (const course of coursesData) {
        const assignedGroups = await getAssignedGroups(token, course.id);
        if (assignedGroups.includes(groupId)) {
          assignedIds.add(course.id);
        }
      }
      setAssignedCourseIds(assignedIds);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Chyba při načítání');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAssignStudent = async (studentId: number) => {
    if (!token) return;
    try {
      await assignStudentToGroup(token, groupId, studentId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se přiřadit studenta');
    }
  };

  const handleRemoveStudent = async (studentId: number) => {
    if (!token) return;
    if (!confirm('Opravdu chcete odebrat tohoto žáka ze skupiny?')) return;
    try {
      await removeStudentFromGroup(token, groupId, studentId);
      await loadData();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se odebrat studenta');
    }
  };

  const handleToggleCourse = async (courseId: number) => {
    if (!token) return;
    try {
      if (assignedCourseIds.has(courseId)) {
        await unassignCourseFromGroup(token, courseId, groupId);
        setAssignedCourseIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(courseId);
          return newSet;
        });
      } else {
        await assignCourseToGroup(token, courseId, groupId);
        setAssignedCourseIds(prev => new Set(prev).add(courseId));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Nepodařilo se změnit přiřazení kurzu');
    }
  };

  if (isLoading) {
    return (
      <div className="groups-page">
        <header className="home-header">
          <Logo />
          <nav className="header-nav">
            <Link to="/" className="nav-link">Domů</Link>
            <Link to="/skupiny" className="nav-link active">Skupiny</Link>
            <Link to="/kurzy" className="nav-link">Kurzy</Link>
          </nav>
          <div className="user-info">
            <span>Učitel</span>
            <button onClick={logout} className="btn-secondary">Odhlásit se</button>
          </div>
        </header>
        <main className="home-content">
          <p>Načítání...</p>
        </main>
      </div>
    );
  }

  if (!group) {
    return (
      <div className="groups-page">
        <header className="home-header">
          <Logo />
          <nav className="header-nav">
            <Link to="/" className="nav-link">Domů</Link>
            <Link to="/skupiny" className="nav-link active">Skupiny</Link>
            <Link to="/kurzy" className="nav-link">Kurzy</Link>
          </nav>
          <div className="user-info">
            <span>Učitel</span>
            <button onClick={logout} className="btn-secondary">Odhlásit se</button>
          </div>
        </header>
        <main className="home-content">
          <div className="error-message">Skupina nenalezena</div>
          <Link to="/skupiny" className="btn-secondary">Zpět na skupiny</Link>
        </main>
      </div>
    );
  }

  return (
    <div className="groups-page">
      <header className="home-header">
        <Logo />
        <nav className="header-nav">
          <Link to="/" className="nav-link">Domů</Link>
          <Link to="/skupiny" className="nav-link active">Skupiny</Link>
          <Link to="/kurzy" className="nav-link">Kurzy</Link>
        </nav>
        <div className="user-info">
          <span>Učitel</span>
          <button onClick={logout} className="btn-secondary">Odhlásit se</button>
        </div>
      </header>

      <main className="home-content">
        <div className="group-detail-header">
          <Link to="/skupiny" className="back-link">&larr; Zpět na skupiny</Link>
          <h2>{group.name}</h2>
        </div>

        {error && <div className="error-message">{error}</div>}

        <div className="tabs">
          <button
            className={`tab ${activeTab === 'students' ? 'active' : ''}`}
            onClick={() => setActiveTab('students')}
          >
            Žáci ({students.length})
          </button>
          <button
            className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
            onClick={() => setActiveTab('courses')}
          >
            Kurzy ({assignedCourseIds.size})
          </button>
        </div>

        {activeTab === 'students' && (
          <div className="students-tab">
            <h3>Žáci ve skupině</h3>
            {students.length === 0 ? (
              <p className="empty-state">Ve skupině zatím nejsou žádní žáci.</p>
            ) : (
              <ul className="students-list">
                {students.map((student) => (
                  <li key={student.id} className="student-item">
                    <span className="student-email">{student.email}</span>
                    <button
                      onClick={() => handleRemoveStudent(student.id)}
                      className="btn-danger btn-small"
                    >
                      Odebrat
                    </button>
                  </li>
                ))}
              </ul>
            )}

            {unassignedStudents.length > 0 && (
              <>
                <h3>Nepřiřazení žáci</h3>
                <ul className="students-list">
                  {unassignedStudents.map((student) => (
                    <li key={student.id} className="student-item">
                      <span className="student-email">{student.email}</span>
                      <button
                        onClick={() => handleAssignStudent(student.id)}
                        className="btn-primary btn-small"
                      >
                        Přidat do skupiny
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {activeTab === 'courses' && (
          <div className="courses-tab">
            <h3>Přiřazené kurzy</h3>
            <p>Vyberte kurzy, které budou dostupné pro žáky v této skupině.</p>

            {courses.length === 0 ? (
              <p className="empty-state">Žádné kurzy nejsou k dispozici.</p>
            ) : (
              <div className="course-toggle-list">
                {courses.map((course) => (
                  <div key={course.id} className="course-toggle-item">
                    <label className="course-toggle-label">
                      <input
                        type="checkbox"
                        checked={assignedCourseIds.has(course.id)}
                        onChange={() => handleToggleCourse(course.id)}
                      />
                      <span className="course-toggle-name">{course.title}</span>
                    </label>
                    {course.description && (
                      <p className="course-toggle-desc">{course.description}</p>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
