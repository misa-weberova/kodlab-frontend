import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { getStudents } from '../api/auth';
import type { Student } from '../api/auth';
import Logo from '../components/Logo';

export default function HomePage() {
  const { user, token, logout } = useAuth();
  const [students, setStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const isTeacher = user?.role === 'TEACHER';

  useEffect(() => {
    if (isTeacher && token) {
      setIsLoading(true);
      getStudents(token)
        .then(setStudents)
        .catch((err) => setError(err.message))
        .finally(() => setIsLoading(false));
    }
  }, [isTeacher, token]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('cs-CZ');
  };

  return (
    <div className="home-page">
      <header className="home-header">
        <Logo />
        <div className="user-info">
          <span>{isTeacher ? 'Učitel' : 'Žák'}</span>
          <button onClick={logout} className="btn-secondary">
            Odhlásit se
          </button>
        </div>
      </header>

      <main className="home-content">
        <h2>Vítejte v KodLabu!</h2>
        <p>Platforma pro výuku programování a digitální gramotnosti.</p>

        {isTeacher ? (
          <div className="students-section">
            <h3>
              Moji žáci
              <span className="student-count">({students.length})</span>
            </h3>

            {error && <div className="error-message">{error}</div>}

            {isLoading ? (
              <p>Načítání...</p>
            ) : students.length === 0 ? (
              <div className="empty-state">
                <p>Zatím nemáte žádné žáky.</p>
                <p>Sdílejte kód školy se svými žáky, aby se mohli připojit.</p>
              </div>
            ) : (
              <ul className="students-list">
                {students.map((student) => (
                  <li key={student.id} className="student-item">
                    <span className="student-email">{student.email}</span>
                    <span className="student-date">
                      Registrován: {formatDate(student.createdAt)}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ) : (
          <div className="placeholder-card">
            <p>Kurzy budou brzy k dispozici.</p>
          </div>
        )}
      </main>
    </div>
  );
}
