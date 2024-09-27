// src/app/auth.service.ts
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class AuthService {
  private authKey = 'isAuthenticated'; // Clave para almacenar el estado de autenticación

  private isBrowser(): boolean {
    return typeof window !== 'undefined';
  }

  // Verifica si el usuario está autenticado
  isAuthenticated(): boolean {
    if (this.isBrowser()) {
      return localStorage.getItem(this.authKey) === 'true'; // Retorna 'true' solo si es explícitamente 'true'
    }
    return false;
  }

  // Realiza el login estableciendo la autenticación en 'true'
  login(): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.authKey, 'true'); // Almacena el estado de autenticación
    }
  }

  // Realiza el logout limpiando el estado de autenticación
  logout(): void {
    if (this.isBrowser()) {
      localStorage.setItem(this.authKey, 'false'); // Establece la autenticación en 'false'
    }
  }
}
