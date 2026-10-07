import { User, InterviewSession, LostFoundItem, ItemMatch, NotificationItem, AdminStats } from '../types';

const API_BASE = '/api';

function getAuthHeader(): Record<string, string> {
  const token = localStorage.getItem('cc_token');
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function handleResponse<T>(res: Response): Promise<T> {
  const json = await res.json();
  if (!res.ok) {
    throw new Error(json.message || 'An unexpected error occurred');
  }
  return json.data;
}

export const api = {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return handleResponse(res);
  },

  async register(data: any): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getCurrentUser(): Promise<User> {
    const res = await fetch(`${API_BASE}/auth/me`, {
      headers: { ...getAuthHeader() },
    });
    const data = await handleResponse<{ user: User }>(res);
    return data.user;
  },

  async switchDemoRole(role: 'student' | 'moderator' | 'admin'): Promise<{ token: string; user: User }> {
    const res = await fetch(`${API_BASE}/auth/switch-demo`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role }),
    });
    return handleResponse(res);
  },

  // Users
  async updateProfile(updates: Partial<User>): Promise<User> {
    const res = await fetch(`${API_BASE}/users/profile`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(updates),
    });
    return handleResponse(res);
  },

  // Interviews
  async startInterview(config: {
    role: string;
    interviewType: string;
    difficulty: string;
    skills: string[];
    targetCompany?: string;
    totalQuestions: number;
  }): Promise<InterviewSession> {
    const res = await fetch(`${API_BASE}/interviews/start`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(config),
    });
    return handleResponse(res);
  },

  async evaluateAnswer(data: {
    sessionId: string;
    questionId: string;
    answer: string;
    timeSpentSeconds?: number;
  }): Promise<{ evaluation: any; question: any }> {
    const res = await fetch(`${API_BASE}/interviews/evaluate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async getFollowUpQuestion(sessionId: string, previousQuestion: string, previousAnswer: string): Promise<any> {
    const res = await fetch(`${API_BASE}/interviews/followup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ sessionId, previousQuestion, previousAnswer }),
    });
    return handleResponse(res);
  },

  async getNextQuestion(sessionId: string): Promise<any> {
    const res = await fetch(`${API_BASE}/interviews/question`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ sessionId }),
    });
    return handleResponse(res);
  },

  async completeInterview(sessionId: string): Promise<InterviewSession> {
    const res = await fetch(`${API_BASE}/interviews/complete`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ sessionId }),
    });
    return handleResponse(res);
  },

  async getInterviewHistory(): Promise<InterviewSession[]> {
    const res = await fetch(`${API_BASE}/interviews/history`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getInterviewById(id: string): Promise<InterviewSession> {
    const res = await fetch(`${API_BASE}/interviews/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Lost & Found Items
  async getItems(params?: {
    search?: string;
    category?: string;
    location?: string;
    type?: string;
    status?: string;
  }): Promise<LostFoundItem[]> {
    const query = new URLSearchParams();
    if (params?.search) query.append('search', params.search);
    if (params?.category) query.append('category', params.category);
    if (params?.location) query.append('location', params.location);
    if (params?.type) query.append('type', params.type);
    if (params?.status) query.append('status', params.status);

    const res = await fetch(`${API_BASE}/items?${query.toString()}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getItemById(id: string): Promise<LostFoundItem> {
    const res = await fetch(`${API_BASE}/items/${id}`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async reportLostItem(data: any): Promise<LostFoundItem> {
    const res = await fetch(`${API_BASE}/items/lost`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async reportFoundItem(data: any): Promise<LostFoundItem> {
    const res = await fetch(`${API_BASE}/items/found`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify(data),
    });
    return handleResponse(res);
  },

  async markItemReturned(id: string): Promise<LostFoundItem> {
    const res = await fetch(`${API_BASE}/items/${id}/returned`, {
      method: 'PUT',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async reportItemDispute(id: string, reason: string): Promise<any> {
    const res = await fetch(`${API_BASE}/items/${id}/report`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ reason }),
    });
    return handleResponse(res);
  },

  async contactReporter(id: string, message: string, contactInfo: string): Promise<any> {
    const res = await fetch(`${API_BASE}/items/${id}/contact`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ message, contactInfo }),
    });
    return handleResponse(res);
  },

  // AI Matching
  async getItemMatches(itemId: string): Promise<{ item: LostFoundItem; matches: ItemMatch[] }> {
    const res = await fetch(`${API_BASE}/matches/items/${itemId}/matches`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  // Notifications
  async getNotifications(): Promise<NotificationItem[]> {
    const res = await fetch(`${API_BASE}/notifications`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async markNotificationRead(id: string): Promise<boolean> {
    const res = await fetch(`${API_BASE}/notifications/${id}/read`, {
      method: 'PUT',
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    return json.success;
  },

  async markAllNotificationsRead(): Promise<boolean> {
    const res = await fetch(`${API_BASE}/notifications/read-all`, {
      method: 'PUT',
      headers: { ...getAuthHeader() },
    });
    const json = await res.json();
    return json.success;
  },

  // Admin
  async getAdminStats(): Promise<AdminStats> {
    const res = await fetch(`${API_BASE}/admin/statistics`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getAdminUsers(): Promise<User[]> {
    const res = await fetch(`${API_BASE}/admin/users`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async updateUserRole(userId: string, role: string): Promise<User> {
    const res = await fetch(`${API_BASE}/admin/users/${userId}/role`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ role }),
    });
    return handleResponse(res);
  },

  async deleteItem(id: string): Promise<void> {
    const res = await fetch(`${API_BASE}/admin/items/${id}`, {
      method: 'DELETE',
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async getAdminReports(): Promise<any[]> {
    const res = await fetch(`${API_BASE}/admin/reports`, {
      headers: { ...getAuthHeader() },
    });
    return handleResponse(res);
  },

  async resolveReport(id: string, action: 'resolve' | 'dismiss' | 'remove_item'): Promise<any> {
    const res = await fetch(`${API_BASE}/admin/reports/${id}/resolve`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...getAuthHeader() },
      body: JSON.stringify({ action }),
    });
    return handleResponse(res);
  },
};
