import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

export interface RegistroRequest {
  email: string;
  password: string;
}
export interface LoginRequest {
  email: string;
  password: string;
}
export interface TokenResponse {
  token: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private baseUrl = '/api/auth';

  constructor(private http: HttpClient) {}

  registro(req: RegistroRequest): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/registro`, req);
  }

  login(req: LoginRequest): Observable<TokenResponse> {
    return this.http.post<TokenResponse>(`${this.baseUrl}/login`, req);
  }
}