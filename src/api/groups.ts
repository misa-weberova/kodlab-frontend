const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

export interface Group {
  id: number;
  name: string;
  studentCount: number;
}

export interface StudentInGroup {
  id: number;
  email: string;
  groupId: number | null;
  groupName: string | null;
}

export async function getGroups(token: string): Promise<Group[]> {
  const response = await fetch(`${API_URL}/api/groups`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Nepodařilo se načíst skupiny');
  return response.json();
}

export async function createGroup(token: string, name: string): Promise<Group> {
  const response = await fetch(`${API_URL}/api/groups`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ name }),
  });
  if (!response.ok) {
    if (response.status === 409) throw new Error('Skupina s tímto názvem již existuje');
    throw new Error('Nepodařilo se vytvořit skupinu');
  }
  return response.json();
}

export async function deleteGroup(token: string, groupId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/groups/${groupId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Nepodařilo se smazat skupinu');
}

export async function getGroupStudents(token: string, groupId: number): Promise<StudentInGroup[]> {
  const response = await fetch(`${API_URL}/api/groups/${groupId}/students`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Nepodařilo se načíst studenty');
  return response.json();
}

export async function getUnassignedStudents(token: string): Promise<StudentInGroup[]> {
  const response = await fetch(`${API_URL}/api/groups/unassigned-students`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Nepodařilo se načíst studenty');
  return response.json();
}

export async function assignStudentToGroup(token: string, groupId: number, studentId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/groups/${groupId}/students/${studentId}`, {
    method: 'POST',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Nepodařilo se přiřadit studenta do skupiny');
}

export async function removeStudentFromGroup(token: string, groupId: number, studentId: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/groups/${groupId}/students/${studentId}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) throw new Error('Nepodařilo se odebrat studenta ze skupiny');
}
