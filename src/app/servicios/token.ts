import { Injectable } from '@angular/core';

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
  private normalizeToken(token: string | null): string | null {
    if (!token) return null;

    const clean = token.trim();
    if (!clean || clean === 'null' || clean === 'undefined') return null;

    return clean.toLowerCase().startsWith('bearer ') ? clean.slice(7).trim() : clean;
  }

  private getPayload(): any | null {
    const token = this.getToken();
    if (!token) return null;
    return decodeJwtPayload(token);
  }

  private isExpired(payload: any | null): boolean {
    const exp = Number(payload?.exp);
    if (!Number.isFinite(exp) || exp <= 0) return false;
    return Math.floor(Date.now() / 1000) >= exp;
  }

  getToken(): string | null {
    const token = this.normalizeToken(localStorage.getItem(KEY_TOKEN));
    if (!token) return null;

    const payload = decodeJwtPayload(token);
    if (this.isExpired(payload)) {
      this.clear();
      return null;
    }

    return token;
  }

  setToken(token: string) {
    const normalized = this.normalizeToken(token);
    if (!normalized) {
      this.clear();
      return;
    }
    localStorage.setItem(KEY_TOKEN, normalized);
  }

  clear() {
    localStorage.removeItem(KEY_TOKEN);
  }

  isLogged(): boolean {
    return this.getToken() !== null;
  }

  getEmail(): string | null {
    const payload = this.getPayload();
    return payload?.sub ?? payload?.email ?? null; // en tu back: subject = email
  }

  getRol(): string | null {
    const payload = this.getPayload();
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
  }

  isAdmin(): boolean {
    const rol = (this.getRol() ?? '').toUpperCase();
    return rol === 'ADMIN' || rol === 'ROLE_ADMIN';
  }
}
