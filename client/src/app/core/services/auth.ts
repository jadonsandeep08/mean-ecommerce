
import { Injectable, inject, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';

// User Interface
export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'customer' | 'admin';
}

// API Response Interface
export interface AuthResponse {
  message: string;
  token: string;
  user: AuthUser;
}

// Registration Data Interface
export interface RegisterData {
  name: string;
  email: string;
  password: string;
}

// Login Data Interface
export interface LoginData {
  email: string;
  password: string;
}

@Injectable({
  providedIn: 'root'
})
export class Auth {

  private http = inject(HttpClient);

  // Backend API URL
  private apiUrl = 'http://localhost:5000/api/auth';

  // Current logged-in user
  private userSignal = signal<AuthUser | null>(null);

  // Public readonly user state
  currentUser = this.userSignal.asReadonly();

  // Login status
  isAuthenticated = computed(() => this.userSignal() !== null);

  // Constructor
  constructor() {
    this.loadUser();
  }

  // ====================================
  // Register User
  // ====================================
  register(data: RegisterData): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/register`,
      data
    ).pipe(
      tap(response => {
        this.saveSession(response);
      })
    );
  }

  // ====================================
  // Login User
  // ====================================
  login(data: LoginData): Observable<AuthResponse> {

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/login`,
      data
    ).pipe(
      tap(response => {
        this.saveSession(response);
      })
    );
  }

  // ====================================
  // Save Login Session
  // ====================================
  private saveSession(response: AuthResponse): void {

    if (typeof window === 'undefined') {
      return;
    }

    localStorage.setItem('token', response.token);
    localStorage.setItem('user', JSON.stringify(response.user));

    this.userSignal.set(response.user);
  }

  // ====================================
  // Load User After Page Refresh
  // ====================================
  private loadUser(): void {

    if (typeof window === 'undefined') {
      return;
    }

    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');

    if (!token || !user) {
      return;
    }

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));

      if (
        typeof payload.exp !== 'number' ||
        payload.exp * 1000 <= Date.now()
      ) {
        this.logout();
        return;
      }

      const parsedUser: AuthUser = JSON.parse(user);

      this.userSignal.set(parsedUser);

    } catch (error) {
      this.logout();
    }
  }

  // ====================================
  // Get JWT Token
  // ====================================
  getToken(): string | null {

    if (typeof window === 'undefined') {
      return null;
    }

    return localStorage.getItem('token');
  }

  // ====================================
  // Check Login Status
  // ====================================
  isLoggedIn(): boolean {

    return this.isAuthenticated();
  }

  // ====================================
  // Check Admin Role
  // ====================================
  isAdmin(): boolean {

    return (
      this.isAuthenticated() &&
      this.currentUser()?.role === 'admin'
    );
  }

  // ====================================
  // Logout User
  // ====================================
  logout(): void {

    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }

    this.userSignal.set(null);
  }
}
