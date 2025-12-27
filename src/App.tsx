import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import HomePage from './pages/HomePage';
import GroupsPage from './pages/GroupsPage';
import GroupDetailPage from './pages/GroupDetailPage';
import CoursesPage from './pages/CoursesPage';
import CourseDetailPage from './pages/CourseDetailPage';
import LessonPage from './pages/LessonPage';
import AdminPage from './pages/AdminPage';
import AdminCourseEditor from './pages/AdminCourseEditor';
import AdminLessonEditor from './pages/AdminLessonEditor';
import './App.css';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Načítání...</div>;
  }

  return user ? <>{children}</> : <Navigate to="/vitejte" />;
}

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Načítání...</div>;
  }

  return user ? <Navigate to="/" /> : <>{children}</>;
}

function RootRoute() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div className="loading">Načítání...</div>;
  }

  return user ? <HomePage /> : <LandingPage />;
}

function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<RootRoute />} />
      <Route
        path="/vitejte"
        element={
          <PublicRoute>
            <LandingPage />
          </PublicRoute>
        }
      />
      <Route
        path="/skupiny"
        element={
          <PrivateRoute>
            <GroupsPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/skupiny/:id"
        element={
          <PrivateRoute>
            <GroupDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/kurzy"
        element={
          <PrivateRoute>
            <CoursesPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/kurzy/:id"
        element={
          <PrivateRoute>
            <CourseDetailPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/lekce/:id"
        element={
          <PrivateRoute>
            <LessonPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/prihlaseni"
        element={
          <PublicRoute>
            <LoginPage />
          </PublicRoute>
        }
      />
      <Route
        path="/registrace"
        element={
          <PublicRoute>
            <RegisterPage />
          </PublicRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <PrivateRoute>
            <AdminPage />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/kurzy/:id"
        element={
          <PrivateRoute>
            <AdminCourseEditor />
          </PrivateRoute>
        }
      />
      <Route
        path="/admin/lekce/:id"
        element={
          <PrivateRoute>
            <AdminLessonEditor />
          </PrivateRoute>
        }
      />
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
