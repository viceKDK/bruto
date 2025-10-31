/**
 * API Client for Backend Communication
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    // Load token from localStorage
    this.token = localStorage.getItem('auth_token');
  }

  setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('auth_token', token);
    } else {
      localStorage.removeItem('auth_token');
    }
  }

  getToken(): string | null {
    return this.token;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (options.headers) {
      Object.assign(headers, options.headers);
    }

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: 'Unknown error' }));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async register(name: string, email: string, password: string) {
    const result = await this.request<{ user: any; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password }),
    });
    this.setToken(result.token);
    return result;
  }

  async login(email: string, password: string) {
    const result = await this.request<{ user: any; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
    this.setToken(result.token);
    return result;
  }

  logout() {
    this.setToken(null);
  }

  // Brutos endpoints
  async getBrutos() {
    return this.request<any[]>('/brutos', {
      method: 'GET',
    });
  }

  async getBruto(id: string) {
    return this.request<any>(`/brutos/${id}`, {
      method: 'GET',
    });
  }

  async createBruto(data: {
    name: string;
    strength: number;
    agility: number;
    speed: number;
    hp: number;
    appearance: any;
  }) {
    return this.request<any>('/brutos', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateBruto(id: string, data: {
    level: number;
    xp: number;
    wins: number;
    losses: number;
    strength: number;
    agility: number;
    speed: number;
    hp: number;
  }) {
    return this.request<any>(`/brutos/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateBrutoXP(id: string, xp: number, level: number) {
    return this.request<any>(`/brutos/${id}/xp`, {
      method: 'PATCH',
      body: JSON.stringify({ xp, level }),
    });
  }

  async checkBrutoName(name: string) {
    return this.request<{ available: boolean }>('/brutos/check-name', {
      method: 'POST',
      body: JSON.stringify({ name }),
    });
  }

  async saveLevelUpgrade(brutoId: string, data: {
    levelNumber: number;
    optionA: { type: string; description: string; stats?: any };
    optionB: { type: string; description: string; stats?: any };
    chosenOption: 'A' | 'B';
  }) {
    return this.request<{ success: boolean; upgradeId: string; message: string }>(
      `/brutos/${brutoId}/upgrades`,
      {
        method: 'POST',
        body: JSON.stringify(data),
      }
    );
  }

  // Battles endpoints
  async saveBattle(data: {
    bruto1_id: string;
    bruto2_id: string;
    winner_id: string | null;
    turn_count: number;
    battle_log: any;
  }) {
    return this.request<{ id: string; message: string; maxBattlesPerBruto: number }>('/battles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getBattlesForBruto(brutoId: string) {
    return this.request<any[]>(`/battles/bruto/${brutoId}`, {
      method: 'GET',
    });
  }

  async getBattleCount(brutoId: string) {
    return this.request<{ count: number }>(`/battles/bruto/${brutoId}/count`, {
      method: 'GET',
    });
  }
}

export const apiClient = new ApiClient();
