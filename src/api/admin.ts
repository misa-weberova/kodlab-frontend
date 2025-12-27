const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// ==================== TYPES ====================

export interface ExerciseConfig {
  // Code exercise
  expectedOutput?: string;
  initialCode?: string;
  // Matching exercise
  pairs?: { id: string; left: string; right: string }[];
  // Gap fill exercise
  sentence?: string;
  answers?: string[];
  distractors?: string[];
  // Crossword exercise
  words?: { id: string; word: string; clue: string; row: number; col: number; direction: 'across' | 'down' }[];
  // Sorting exercise
  items?: { id: string; text: string; displayValue?: string }[];
  correctOrder?: string[];
  startLabel?: string;
  endLabel?: string;
  // Category sort exercise
  categories?: { id: string; title: string; color?: string }[];
  categoryItems?: { id: string; text: string; correctCategoryId: string }[];
}

export interface Exercise {
  id: number;
  type: string;
  title: string | null;
  instruction: string | null;
  config: string | null; // JSON string
  ordering: number;
}

export interface Lesson {
  id: number;
  title: string;
  content: string | null;
  ordering: number;
  exercises: Exercise[];
}

export interface Chapter {
  id: number;
  title: string;
  ordering: number;
  lessons: Lesson[];
}

export interface Course {
  id: number;
  title: string;
  description: string | null;
  published: boolean;
  chapters: Chapter[];
}

// ==================== COURSE API ====================

export async function getAllCourses(token: string): Promise<Course[]> {
  const response = await fetch(`${API_URL}/api/admin/courses`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Přístup pouze pro administrátory');
    throw new Error('Nepodařilo se načíst kurzy');
  }
  return response.json();
}

export async function createCourse(token: string, title: string, description: string | null): Promise<Course> {
  const response = await fetch(`${API_URL}/api/admin/courses`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, description }),
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Přístup pouze pro administrátory');
    throw new Error('Nepodařilo se vytvořit kurz');
  }
  return response.json();
}

export async function updateCourse(
  token: string,
  courseId: number,
  data: { title?: string; description?: string | null; published?: boolean }
): Promise<Course> {
  const response = await fetch(`${API_URL}/api/admin/courses/${courseId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Přístup pouze pro administrátory');
    if (response.status === 404) throw new Error('Kurz nenalezen');
    throw new Error('Nepodařilo se upravit kurz');
  }
  return response.json();
}

export async function deleteCourse(token: string, courseId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/admin/courses/${courseId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Přístup pouze pro administrátory');
    if (response.status === 404) throw new Error('Kurz nenalezen');
    throw new Error('Nepodařilo se smazat kurz');
  }
}

// ==================== CHAPTER API ====================

export async function createChapter(token: string, courseId: number, title: string): Promise<Chapter> {
  const response = await fetch(`${API_URL}/api/admin/courses/${courseId}/chapters`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title }),
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Přístup pouze pro administrátory');
    throw new Error('Nepodařilo se vytvořit kapitolu');
  }
  return response.json();
}

export async function updateChapter(
  token: string,
  chapterId: number,
  data: { title?: string; ordering?: number }
): Promise<Chapter> {
  const response = await fetch(`${API_URL}/api/admin/chapters/${chapterId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Přístup pouze pro administrátory');
    if (response.status === 404) throw new Error('Kapitola nenalezena');
    throw new Error('Nepodařilo se upravit kapitolu');
  }
  return response.json();
}

export async function deleteChapter(token: string, chapterId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/admin/chapters/${chapterId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Přístup pouze pro administrátory');
    if (response.status === 404) throw new Error('Kapitola nenalezena');
    throw new Error('Nepodařilo se smazat kapitolu');
  }
}

// ==================== LESSON API ====================

export async function createLesson(
  token: string,
  chapterId: number,
  title: string,
  content: string | null
): Promise<Lesson> {
  const response = await fetch(`${API_URL}/api/admin/chapters/${chapterId}/lessons`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ title, content }),
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Přístup pouze pro administrátory');
    throw new Error('Nepodařilo se vytvořit lekci');
  }
  return response.json();
}

export async function updateLesson(
  token: string,
  lessonId: number,
  data: { title?: string; content?: string | null; ordering?: number }
): Promise<Lesson> {
  const response = await fetch(`${API_URL}/api/admin/lessons/${lessonId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Přístup pouze pro administrátory');
    if (response.status === 404) throw new Error('Lekce nenalezena');
    throw new Error('Nepodařilo se upravit lekci');
  }
  return response.json();
}

export async function deleteLesson(token: string, lessonId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/admin/lessons/${lessonId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Přístup pouze pro administrátory');
    if (response.status === 404) throw new Error('Lekce nenalezena');
    throw new Error('Nepodařilo se smazat lekci');
  }
}

// ==================== EXERCISE API ====================

export async function getExercises(token: string, lessonId: number): Promise<Exercise[]> {
  const response = await fetch(`${API_URL}/api/admin/lessons/${lessonId}/exercises`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Nepodařilo se načíst cvičení');
  return response.json();
}

export async function createExercise(
  token: string,
  lessonId: number,
  data: { type: string; title?: string; instruction?: string; config?: string }
): Promise<Exercise> {
  const response = await fetch(`${API_URL}/api/admin/lessons/${lessonId}/exercises`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Přístup pouze pro administrátory');
    throw new Error('Nepodařilo se vytvořit cvičení');
  }
  return response.json();
}

export async function updateExercise(
  token: string,
  exerciseId: number,
  data: { type?: string; title?: string; instruction?: string; config?: string; ordering?: number }
): Promise<Exercise> {
  const response = await fetch(`${API_URL}/api/admin/exercises/${exerciseId}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Přístup pouze pro administrátory');
    if (response.status === 404) throw new Error('Cvičení nenalezeno');
    throw new Error('Nepodařilo se upravit cvičení');
  }
  return response.json();
}

export async function deleteExercise(token: string, exerciseId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/admin/exercises/${exerciseId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Přístup pouze pro administrátory');
    if (response.status === 404) throw new Error('Cvičení nenalezeno');
    throw new Error('Nepodařilo se smazat cvičení');
  }
}
