import { useState } from 'react';
import type { FormEvent } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { register as apiRegister } from '../api/auth';
import Logo from '../components/Logo';
import FloatingShapes from '../components/FloatingShapes';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [role, setRole] = useState<'STUDENT' | 'TEACHER'>('STUDENT');
  const [joinCode, setJoinCode] = useState('');
  const [organizationName, setOrganizationName] = useState('');
  const [createNewOrg, setCreateNewOrg] = useState(true);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [successInfo, setSuccessInfo] = useState<{ joinCode: string } | null>(null);

  const navigate = useNavigate();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (password !== passwordConfirm) {
      setError('Hesla se neshodují');
      return;
    }

    if (password.length < 6) {
      setError('Heslo musí mít alespoň 6 znaků');
      return;
    }

    if (role === 'STUDENT' && !joinCode.trim()) {
      setError('Zadejte kód školy od učitele');
      return;
    }

    if (role === 'TEACHER' && createNewOrg && !organizationName.trim()) {
      setError('Zadejte název školy');
      return;
    }

    if (role === 'TEACHER' && !createNewOrg && !joinCode.trim()) {
      setError('Zadejte kód školy');
      return;
    }

    setIsLoading(true);

    try {
      const result = await apiRegister({
        email,
        password,
        role,
        organizationName: role === 'TEACHER' && createNewOrg ? organizationName : undefined,
        joinCode: (role === 'STUDENT' || (role === 'TEACHER' && !createNewOrg)) ? joinCode : undefined,
      });

      // If teacher created new org, show them the join code
      if (role === 'TEACHER' && createNewOrg && result.joinCode) {
        setSuccessInfo({ joinCode: result.joinCode });
      } else {
        navigate('/prihlaseni', { state: { registered: true } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Něco se pokazilo');
    } finally {
      setIsLoading(false);
    }
  };

  if (successInfo) {
    return (
      <div className="auth-page">
        <FloatingShapes />
        <div className="auth-card">
          <Logo size="large" />
          <h1>Registrace dokončena!</h1>
          <div className="success-message">
            <p>Vaše škola byla vytvořena.</p>
            <p><strong>Kód pro žáky:</strong></p>
            <div className="join-code">{successInfo.joinCode}</div>
            <p className="hint">Sdílejte tento kód se svými žáky, aby se mohli připojit.</p>
          </div>
          <button className="btn-primary" onClick={() => navigate('/prihlaseni')}>
            Přejít na přihlášení
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <FloatingShapes />
      <div className="auth-card">
        <Logo size="large" />
        <h1>Registrace</h1>

        {error && <div className="error-message">{error}</div>}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              autoComplete="email"
              placeholder="vas@email.cz"
            />
          </div>

          <div className="form-group">
            <label htmlFor="password">Heslo</label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Alespoň 6 znaků"
            />
          </div>

          <div className="form-group">
            <label htmlFor="passwordConfirm">Heslo znovu</label>
            <input
              id="passwordConfirm"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              required
              autoComplete="new-password"
              placeholder="Zopakujte heslo"
            />
          </div>

          <div className="form-group">
            <label>Jsem</label>
            <div className="role-selector">
              <button
                type="button"
                className={`role-btn ${role === 'STUDENT' ? 'active' : ''}`}
                onClick={() => setRole('STUDENT')}
              >
                Žák
              </button>
              <button
                type="button"
                className={`role-btn ${role === 'TEACHER' ? 'active' : ''}`}
                onClick={() => setRole('TEACHER')}
              >
                Učitel
              </button>
            </div>
          </div>

          {role === 'STUDENT' && (
            <div className="form-group">
              <label htmlFor="joinCode">Kód školy</label>
              <input
                id="joinCode"
                type="text"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                placeholder="Kód od učitele"
                maxLength={8}
              />
            </div>
          )}

          {role === 'TEACHER' && (
            <>
              <div className="form-group">
                <label>Škola</label>
                <div className="role-selector">
                  <button
                    type="button"
                    className={`role-btn ${createNewOrg ? 'active' : ''}`}
                    onClick={() => setCreateNewOrg(true)}
                  >
                    Vytvořit novou
                  </button>
                  <button
                    type="button"
                    className={`role-btn ${!createNewOrg ? 'active' : ''}`}
                    onClick={() => setCreateNewOrg(false)}
                  >
                    Připojit se
                  </button>
                </div>
              </div>

              {createNewOrg ? (
                <div className="form-group">
                  <label htmlFor="orgName">Název školy</label>
                  <input
                    id="orgName"
                    type="text"
                    value={organizationName}
                    onChange={(e) => setOrganizationName(e.target.value)}
                    placeholder="ZŠ Příkladová"
                  />
                </div>
              ) : (
                <div className="form-group">
                  <label htmlFor="teacherJoinCode">Kód školy</label>
                  <input
                    id="teacherJoinCode"
                    type="text"
                    value={joinCode}
                    onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                    placeholder="Kód od kolegy"
                    maxLength={8}
                  />
                </div>
              )}
            </>
          )}

          <button type="submit" className="btn-primary" disabled={isLoading}>
            {isLoading ? 'Registrace...' : 'Zaregistrovat se'}
          </button>
        </form>

        <p className="auth-link">
          Už máte účet? <Link to="/prihlaseni">Přihlaste se</Link>
        </p>
      </div>
    </div>
  );
}
