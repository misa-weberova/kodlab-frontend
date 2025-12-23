const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  userId: number;
  role: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  role: 'STUDENT' | 'TEACHER';
  organizationName?: string;  // For teachers creating new org
  joinCode?: string;          // For joining existing org
}

export interface RegisterResponse {
  userId: number;
  organizationId: number | null;
  organizationName: string | null;
  joinCode: string | null;
}

export async function login(data: LoginRequest): Promise<LoginResponse> {
  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 401) {
      throw new Error('Nesprávný e-mail nebo heslo');
    }
    throw new Error('Přihlášení se nezdařilo');
  }

  return response.json();
}

export async function register(data: RegisterRequest): Promise<RegisterResponse> {
  const response = await fetch(`${API_URL}/api/auth/register`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    if (response.status === 409) {
      throw new Error('Tento e-mail je již registrován');
    }
    if (response.status === 404) {
      throw new Error('Neplatný kód školy');
    }
    throw new Error('Registrace se nezdařila');
  }

  return response.json();
}

export interface Student {
  id: number;
  email: string;
  createdAt: string;
}

export async function getStudents(token: string): Promise<Student[]> {
  const response = await fetch(`${API_URL}/api/users/students`, {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    if (response.status === 403) {
      throw new Error('Pouze učitelé mohou zobrazit žáky');
    }
    throw new Error('Nepodařilo se načíst žáky');
  }

  return response.json();
}
