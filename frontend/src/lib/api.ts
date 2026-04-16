const API_PREFIX = '/api';
const ACCESS_TOKEN_KEY = 'ai_observatory_access_token';
const REFRESH_TOKEN_KEY = 'ai_observatory_refresh_token';

export interface UserBasicInfo {
  id: string;
  email: string;
  gender: string | null;
  language: string;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  user?: UserBasicInfo | null;
}

export interface TarotCardInfo {
  id: number;
  name_en: string;
  name_zh: string;
  short_code: string;
  arcana: string;
  suit: string | null;
  image_filename: string;
}

export interface SpreadPosition {
  index: number;
  name_zh: string;
  name_en: string;
  description_zh: string;
}

export interface SpreadInfo {
  type: string;
  name_zh: string;
  name_en: string;
  description_zh: string;
  card_count: number;
}

export interface DrawnCard {
  card_id: number;
  position: number;
  is_reversed: boolean;
  card: TarotCardInfo;
}

export interface DrawCardResponse {
  session_id: string;
  spread_type: string;
  spread_name_zh: string;
  question?: string | null;
  cards: DrawnCard[];
  positions: SpreadPosition[];
}

export interface ReadingHistoryItem {
  id: string;
  spread_type: string;
  spread_name_zh: string;
  question?: string | null;
  cards_count: number;
  created_at: string;
}

export interface ReadingHistoryListResponse {
  readings: ReadingHistoryItem[];
  total: number;
  page: number;
  page_size: number;
}

export interface ReadingHistoryDetail {
  id: string;
  spread_type: string;
  spread_name_zh: string;
  question?: string | null;
  cards: DrawnCard[];
  positions: SpreadPosition[];
  interpretation?: string | null;
  created_at: string;
  disclaimer?: string;
}

export interface MBTIOption {
  id: string;
  text: string;
  weight: Record<string, number>;
}

export interface MBTIQuestion {
  question_id: string;
  question_text: string;
  question_type: 'scenario' | 'preference' | 'agreement';
  dimension: 'EI' | 'SN' | 'TF' | 'JP';
  options: MBTIOption[];
}

export interface MBTIProgress {
  answered: number;
  min_questions: number;
  max_questions: number;
  estimated_remaining: number;
}

export interface MBTIResult {
  session_id: string;
  personality_type: string;
  type_name_zh: string;
  type_name_en: string;
  summary: string;
  cognitive_functions: string[];
  strengths: string[];
  weaknesses: string[];
  career_matches: string[];
  relationship_advice: string;
  famous_people: string[];
  dimension_scores: Record<string, number>;
  disclaimer: string;
}

export interface MBTISessionState {
  session_id: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'cancelled';
  question_count: number;
  current_question?: MBTIQuestion | null;
  progress: MBTIProgress;
  completed_result?: MBTIResult | null;
}

export interface MBTITypeInfo {
  type_code: string;
  type_name_zh: string;
  type_name_en: string;
  summary: string;
  cognitive_functions: string[];
}

type RequestOptions = {
  method?: 'GET' | 'POST' | 'DELETE';
  body?: unknown;
  auth?: boolean;
  headers?: HeadersInit;
};

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getAccessToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function getRefreshToken(): string | null {
  if (!isBrowser()) {
    return null;
  }

  return window.localStorage.getItem(REFRESH_TOKEN_KEY);
}

export function setStoredTokens(accessToken: string, refreshToken: string): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
}

export function clearStoredTokens(): void {
  if (!isBrowser()) {
    return;
  }

  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}

async function refreshAccessToken(): Promise<string | null> {
  const refreshToken = getRefreshToken();
  if (!refreshToken) {
    clearStoredTokens();
    return null;
  }

  const response = await fetch(`${API_PREFIX}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!response.ok) {
    clearStoredTokens();
    return null;
  }

  const tokens = (await response.json()) as TokenResponse;
  setStoredTokens(tokens.access_token, tokens.refresh_token);
  return tokens.access_token;
}

async function ensureAuthenticatedResponse(
  path: string,
  init: RequestInit,
  auth: boolean,
): Promise<Response> {
  const response = await fetch(`${API_PREFIX}${path}`, init);

  if (!auth || response.status !== 401) {
    return response;
  }

  const refreshedToken = await refreshAccessToken();
  if (!refreshedToken) {
    return response;
  }

  const retryHeaders = new Headers(init.headers);
  retryHeaders.set('Authorization', `Bearer ${refreshedToken}`);

  return fetch(`${API_PREFIX}${path}`, {
    ...init,
    headers: retryHeaders,
  });
}

async function apiRequest<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false, headers } = options;
  const requestHeaders = new Headers(headers);

  if (body !== undefined) {
    requestHeaders.set('Content-Type', 'application/json');
  }

  if (auth) {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error('请先登录');
    }

    requestHeaders.set('Authorization', `Bearer ${accessToken}`);
  }

  const response = await ensureAuthenticatedResponse(
    path,
    {
      method,
      headers: requestHeaders,
      body: body === undefined ? undefined : JSON.stringify(body),
    },
    auth,
  );

  if (!response.ok) {
    let message = '请求失败';

    try {
      const data = (await response.json()) as { detail?: string; message?: string };
      message = data.detail || data.message || message;
    } catch {
      message = response.statusText || message;
    }

    if (response.status === 401) {
      clearStoredTokens();
    }

    throw new Error(message);
  }

  return (await response.json()) as T;
}

async function authFetch(path: string, body: unknown): Promise<TokenResponse> {
  return apiRequest<TokenResponse>(path, {
    method: 'POST',
    body,
  });
}

export const authApi = {
  register(email: string, password: string) {
    return authFetch('/auth/register', { email, password });
  },
  login(email: string, password: string) {
    return authFetch('/auth/login', { email, password });
  },
  me() {
    return apiRequest<UserBasicInfo>('/auth/me', { auth: true });
  },
};

export const tarotApi = {
  async getSpreads(): Promise<SpreadInfo[]> {
    const data = await apiRequest<{ spreads: SpreadInfo[] }>('/tarot/spreads');
    return data.spreads;
  },

  async getAllCards(): Promise<{ cards: TarotCardInfo[]; total: number }> {
    return apiRequest<{ cards: TarotCardInfo[]; total: number }>('/tarot/cards');
  },

  async drawCards(
    spreadType: string,
    question?: string,
    selectedCardIds?: number[],
  ): Promise<DrawCardResponse> {
    return apiRequest<DrawCardResponse>('/tarot/draw', {
      method: 'POST',
      auth: true,
      body: {
        spread_type: spreadType,
        question,
        selected_card_ids: selectedCardIds,
      },
    });
  },

  async interpret(sessionId: string, question?: string): Promise<Response> {
    const accessToken = getAccessToken();
    if (!accessToken) {
      throw new Error('请先登录');
    }

    const headers = new Headers({
      'Content-Type': 'application/json',
      Authorization: `Bearer ${accessToken}`,
    });

    return ensureAuthenticatedResponse(
      '/tarot/interpret',
      {
        method: 'POST',
        headers,
        body: JSON.stringify({
          session_id: sessionId,
          question,
        }),
      },
      true,
    );
  },

  interpretSync(
    sessionId: string,
    question?: string,
  ): Promise<{ cached?: boolean; interpretation: string; disclaimer?: string }> {
    return apiRequest<{ cached?: boolean; interpretation: string; disclaimer?: string }>('/tarot/interpret/sync', {
      method: 'POST',
      auth: true,
      body: {
        session_id: sessionId,
        question,
      },
    });
  },

  getInterpretationResult(
    sessionId: string,
  ): Promise<{ ready: boolean; interpretation?: string; disclaimer?: string }> {
    return apiRequest<{ ready: boolean; interpretation?: string; disclaimer?: string }>(`/tarot/interpret/result/${sessionId}`, {
      auth: true,
    });
  },

  getHistory(page = 1, pageSize = 20): Promise<ReadingHistoryListResponse> {
    return apiRequest<ReadingHistoryListResponse>(`/tarot/history?page=${page}&page_size=${pageSize}`, {
      auth: true,
    });
  },

  getHistoryDetail(readingId: string): Promise<ReadingHistoryDetail> {
    return apiRequest<ReadingHistoryDetail>(`/tarot/history/${readingId}`, { auth: true });
  },

  deleteHistory(readingId: string): Promise<{ message: string; success: boolean }> {
    return apiRequest<{ message: string; success: boolean }>(`/tarot/history/${readingId}`, {
      method: 'DELETE',
      auth: true,
    });
  },
};

export const mbtiApi = {
  startSession(): Promise<MBTISessionState> {
    return apiRequest<MBTISessionState>('/mbti/session/start', {
      method: 'POST',
      auth: true,
    });
  },

  resumeSession(sessionId: string): Promise<MBTISessionState> {
    return apiRequest<MBTISessionState>(`/mbti/session/${sessionId}/resume`, {
      auth: true,
    });
  },

  submitAnswer(sessionId: string, questionId: string, selectedOption: string): Promise<{ status: 'running'; next_question: MBTIQuestion; progress: MBTIProgress } | { status: 'completed'; result: MBTIResult }> {
    return apiRequest<{ status: 'running'; next_question: MBTIQuestion; progress: MBTIProgress } | { status: 'completed'; result: MBTIResult }>(`/mbti/session/${sessionId}/answer`, {
      method: 'POST',
      auth: true,
      body: {
        question_id: questionId,
        selected_option: selectedOption,
      },
    });
  },

  getResult(sessionId: string): Promise<MBTIResult> {
    return apiRequest<MBTIResult>(`/mbti/session/${sessionId}/result`, {
      auth: true,
    });
  },

  getTypes(): Promise<MBTITypeInfo[]> {
    return apiRequest<MBTITypeInfo[]>('/mbti/types');
  },

  getTypeDetail(typeCode: string): Promise<MBTITypeInfo> {
    return apiRequest<MBTITypeInfo>(`/mbti/types/${typeCode}`);
  },
};
