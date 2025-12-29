const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080';

// ==================== TYPES ====================

export interface BlogPost {
  id: number;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  authorName: string | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateBlogPostRequest {
  title: string;
  content?: string;
  excerpt?: string;
}

export interface UpdateBlogPostRequest {
  title?: string;
  slug?: string;
  content?: string;
  excerpt?: string;
  status?: string;
}

// ==================== PUBLIC API ====================

export async function getPublishedPosts(): Promise<BlogPost[]> {
  const response = await fetch(`${API_URL}/api/blog`);
  if (!response.ok) {
    throw new Error('Nepodařilo se načíst články');
  }
  return response.json();
}

export async function getPostBySlug(slug: string): Promise<BlogPost | null> {
  const response = await fetch(`${API_URL}/api/blog/${slug}`);
  if (response.status === 404) {
    return null;
  }
  if (!response.ok) {
    throw new Error('Nepodařilo se načíst článek');
  }
  return response.json();
}

// ==================== ADMIN API ====================

export async function getAllPosts(token: string): Promise<BlogPost[]> {
  const response = await fetch(`${API_URL}/api/admin/blog`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Přístup pouze pro administrátory');
    throw new Error('Nepodařilo se načíst články');
  }
  return response.json();
}

export async function getPostById(token: string, id: number): Promise<BlogPost> {
  const response = await fetch(`${API_URL}/api/admin/blog/${id}`, {
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Přístup pouze pro administrátory');
    if (response.status === 404) throw new Error('Článek nenalezen');
    throw new Error('Nepodařilo se načíst článek');
  }
  return response.json();
}

export async function createPost(token: string, data: CreateBlogPostRequest): Promise<BlogPost> {
  const response = await fetch(`${API_URL}/api/admin/blog`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Přístup pouze pro administrátory');
    throw new Error('Nepodařilo se vytvořit článek');
  }
  return response.json();
}

export async function updatePost(token: string, id: number, data: UpdateBlogPostRequest): Promise<BlogPost> {
  const response = await fetch(`${API_URL}/api/admin/blog/${id}`, {
    method: 'PUT',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(data),
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Přístup pouze pro administrátory');
    if (response.status === 404) throw new Error('Článek nenalezen');
    throw new Error('Nepodařilo se upravit článek');
  }
  return response.json();
}

export async function deletePost(token: string, id: number): Promise<void> {
  const response = await fetch(`${API_URL}/api/admin/blog/${id}`, {
    method: 'DELETE',
    headers: { 'Authorization': `Bearer ${token}` },
  });
  if (!response.ok) {
    if (response.status === 403) throw new Error('Přístup pouze pro administrátory');
    if (response.status === 404) throw new Error('Článek nenalezen');
    throw new Error('Nepodařilo se smazat článek');
  }
}
