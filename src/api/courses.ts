const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface CourseListItem {
  id: number;
  title: string;
  description: string | null;
  assigned: boolean;
  totalLessons: number;
  completedLessons: number;
}

export interface LessonSummary {
  id: number;
  title: string;
  ordering: number;
  completed: boolean;
}

export interface ChapterSummary {
  id: number;
  title: string;
  ordering: number;
  lessons: LessonSummary[];
}

export interface CourseDetail {
  id: number;
  title: string;
  description: string | null;
  chapters: ChapterSummary[];
}

export interface ExerciseData {
  id: number;
  type: string;
  title: string | null;
  instruction: string | null;
  config: string | null;
  ordering: number;
}

export interface LessonDetail {
  id: number;
  title: string;
  content: string | null;
  chapterId: number;
  chapterTitle: string;
  courseId: number;
  courseTitle: string;
  completed: boolean;
  prevLessonId: number | null;
  nextLessonId: number | null;
  exercises: ExerciseData[];
}

export interface LessonProgressDto {
  lessonId: number;
  lessonTitle: string;
  completed: boolean;
  completedAt: string | null;
}

export interface StudentProgress {
  studentId: number;
  studentEmail: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  lastActivity: string | null;
  lessonProgress: LessonProgressDto[];
}

export interface CourseProgressDto {
  courseId: number;
  courseTitle: string;
  totalLessons: number;
  completedLessons: number;
  progressPercent: number;
  lastActivity: string | null;
}

export interface MyProgress {
  courses: CourseProgressDto[];
}

export async function getCourses(token: string): Promise<CourseListItem[]> {
  const response = await fetch(`${API_URL}/api/courses`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Nepodařilo se načíst kurzy');
  return response.json();
}

export async function getCourseDetail(token: string, courseId: number): Promise<CourseDetail> {
  const response = await fetch(`${API_URL}/api/courses/${courseId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Přístup k tomuto kurzu byl odepřen');
    if (response.status === 404) throw new Error('Kurz nenalezen');
    throw new Error('Nepodařilo se načíst kurz');
  }
  return response.json();
}

export async function getLessonDetail(token: string, lessonId: number): Promise<LessonDetail> {
  const response = await fetch(`${API_URL}/api/lessons/${lessonId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Přístup k této lekci byl odepřen');
    if (response.status === 404) throw new Error('Lekce nenalezena');
    throw new Error('Nepodařilo se načíst lekci');
  }
  return response.json();
}

export async function assignCourseToGroup(token: string, courseId: number, groupId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/courses/${courseId}/assign/${groupId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Nepodařilo se přiřadit kurz');
}

export async function unassignCourseFromGroup(token: string, courseId: number, groupId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/courses/${courseId}/assign/${groupId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Nepodařilo se odebrat kurz');
}

export async function getAssignedGroups(token: string, courseId: number): Promise<number[]> {
  const response = await fetch(`${API_URL}/api/courses/${courseId}/groups`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Nepodařilo se načíst přiřazené skupiny');
  return response.json();
}

export async function getCourseProgressForGroup(token: string, courseId: number, groupId: number): Promise<StudentProgress[]> {
  const response = await fetch(`${API_URL}/api/courses/${courseId}/progress/${groupId}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Nepodařilo se načíst pokrok studentů');
  return response.json();
}

export async function markLessonComplete(token: string, lessonId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/lessons/${lessonId}/complete`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Nepodařilo se označit lekci jako dokončenou');
}

export async function getMyProgress(token: string): Promise<MyProgress> {
  const response = await fetch(`${API_URL}/api/progress`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Nepodařilo se načíst pokrok');
  return response.json();
}
