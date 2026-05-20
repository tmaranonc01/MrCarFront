import { Injectable, computed, signal } from '@angular/core';

const KEY_TOKEN = 'mrcar_token';

function decodeJwtPayload(token: string): any | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;

    // base64url -> base64
    const b64url = parts[1].replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - (b64url.length % 4)) % 4);
    const b64 = b64url + padding;
    const json = atob(b64);
    return JSON.parse(json);
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class TokenService {
  private readonly _token = signal<string | null>(this.readTokenFromStorage());

  readonly tokenSignal = this._token.asReadonly();
  readonly payloadSignal = computed(() => {
    const token = this._token();
    return token ? decodeJwtPayload(token) : null;
  });
  readonly isLoggedSignal = computed(() => this._token() !== null);
  readonly emailSignal = computed(() => {
    const payload = this.payloadSignal();
    return payload?.sub ?? payload?.email ?? null;
  });
  readonly rolSignal = computed(() => {
    const payload = this.payloadSignal();
    if (!payload) return null;

    // Compatibilidad con distintos formatos de claim.
    const rol =
      payload?.rol ??
      payload?.role ??
      payload?.authorities?.[0] ??
      payload?.roles?.[0] ??
      payload?.scope ??
      null;

    return typeof rol === 'string' ? rol : null;
  });
  readonly isAdminSignal = computed(() => {
    const rol = (this.rolSignal() ?? '').toUpperCase();
    return rol === 'ADMIN' || rol === 'ROLE_ADMIN';
  });

  constructor() {
    // Sincroniza cambios de token entre pestañas/ventanas.
    window.addEventListener('storage', (event: StorageEvent) => {
      if (event.key === KEY_TOKEN) {
        this.syncTokenFromStorage();
      }
    });
  }

  private normalizeToken(token: string | null): string | null {
    if (!token) return null;

    const clean = token.trim().replace(/^['"]+|['"]+$/g, '');
    if (!clean || clean === 'null' || clean === 'undefined') return null;

    return clean.replace(/^bearer\s+/i, '').trim();
  }

  private isExpired(payload: any | null): boolean {
    const exp = Number(payload?.exp);
    if (!Number.isFinite(exp) || exp <= 0) return false;
    return Math.floor(Date.now() / 1000) >= exp;
  }

  private readTokenFromStorage(): string | null {
    const token = this.normalizeToken(localStorage.getItem(KEY_TOKEN));
    if (!token) return null;

    const payload = decodeJwtPayload(token);
    if (this.isExpired(payload)) {
      localStorage.removeItem(KEY_TOKEN);
      return null;
    }

    return token;
  }

  private syncTokenFromStorage() {
    const fromStorage = this.readTokenFromStorage();
    if (fromStorage !== this._token()) {
      this._token.set(fromStorage);
    }
  }

  getToken(): string | null {
    this.syncTokenFromStorage();
    return this._token();
  }

  setToken(token: string) {
    const normalized = this.normalizeToken(token);
    if (!normalized) {
      this.clear();
      return;
    }

    const payload = decodeJwtPayload(normalized);
    if (this.isExpired(payload)) {
      this.clear();
      return;
    }

    localStorage.setItem(KEY_TOKEN, normalized);
    this._token.set(normalized);
  }

  clear() {
    localStorage.removeItem(KEY_TOKEN);
    this._token.set(null);
  }

  isLogged(): boolean {
    this.syncTokenFromStorage();
    return this.isLoggedSignal();
  }

  getEmail(): string | null {
    this.syncTokenFromStorage();
    return this.emailSignal(); // en tu back: subject = email
  }

  getRol(): string | null {
    this.syncTokenFromStorage();
    return this.rolSignal();
  }

  isAdmin(): boolean {
    this.syncTokenFromStorage();
    return this.isAdminSignal();
  }
}
