// Ruta del archivo: /src/lib/services/authService.ts

import { UserSession, LoginCredentials, LoginResponse } from '../models/auth';

export class AuthService {
    private static readonly USER_KEY = 'planning_poker_user';

    /**
     * Verifica si estamos en el navegador
     */
    private static isClient(): boolean {
        return typeof window !== 'undefined';
    }

    /**
     * Realiza el proceso de login del usuario
     */
    static async login(credentials: LoginCredentials): Promise<LoginResponse> {
        try {
            const response = await fetch('/api/auth-api', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(credentials),
            });

            const data = await response.json();

            if (data.success && data.user && this.isClient()) {
                this.setUserSession(data.user);
            }

            return data;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return {
                success: false,
                message: 'Error al intentar iniciar sesión',
            };
        }
    }

    /**
     * Guarda la sesión del usuario en localStorage
     */
    static setUserSession(user: UserSession): void {
        if (this.isClient()) {
            localStorage.setItem(this.USER_KEY, JSON.stringify(user));
        }
    }

    /**
     * Obtiene la sesión del usuario desde localStorage
     */
    static getUserSession(): UserSession | null {
        if (!this.isClient()) {
            return null;
        }
        const userJson = localStorage.getItem(this.USER_KEY);
        return userJson ? JSON.parse(userJson) : null;
    }

    /**
     * Elimina la sesión del usuario de localStorage
     */
    static logout(): void {
        if (this.isClient()) {
            localStorage.removeItem(this.USER_KEY);
        }
    }

    /**
     * Verifica si hay un usuario autenticado
     */
    static isAuthenticated(): boolean {
        return !!this.getUserSession();
    }

    /**
     * Verifica si el usuario actual es Project Manager
     */
    static isProjectManager(): boolean {
        const user = this.getUserSession();
        return user?.role === 'project_manager';
    }
}