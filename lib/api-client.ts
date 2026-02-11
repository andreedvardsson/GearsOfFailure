'use client';

import { User } from 'firebase/auth';

export async function apiCall(endpoint: string, options: RequestInit = {}, user: User | null) {
  if (!user) {
    throw new Error('User not authenticated');
  }

  const headers = new Headers(options.headers || {});
  headers.set('x-user-email', user.email || '');
  headers.set('Content-Type', 'application/json');

  const response = await fetch(endpoint, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(error.error || `HTTP ${response.status}`);
  }

  return response.json();
}
